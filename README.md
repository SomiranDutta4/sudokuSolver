# Credit Default Risk Modeling

An interpretable loan-default modeling pipeline that estimates probability of default (PD), benchmarks a logistic regression scorecard against XGBoost, and translates borrower characteristics into additive credit-score points.

The project follows the credit-model lifecycle: outcome definition, leakage filtering, temporal validation, statistical binning, Weight of Evidence (WoE), feature selection, model comparison, probability recalibration, stability analysis, and borrower scoring.

**Stack:** Python · pandas · NumPy · scikit-learn · XGBoost · SHAP · Matplotlib · Seaborn

## Results

| Metric | AUC |
| --- | --- |
| XGBoost challenger — validation | **0.74** |
| Out-of-time performance — before recalibration | **0.69** |
| Out-of-time performance — after recalibration | **0.72** |

## Data and prediction task

The local data is a Lending Club accepted-loan sample, `data/raw/accepted_200k.csv`, containing **200,000 records and 151 original columns**. The supervised model uses **119,371 loans with resolved outcomes**.

| Target | Included loan statuses |
| --- | --- |
| `default_flag = 0` — non-default | `Fully Paid`; `Does not meet the credit policy. Status:Fully Paid` |
| `default_flag = 1` — default | `Charged Off`; `Default`; `Does not meet the credit policy. Status:Charged Off` |

Current, late, grace-period, and missing-status records are excluded because their final outcomes are unresolved.

`rejected_200k.csv` is retained locally but is not used for training. Rejected applications have no observed repayment outcome and cannot simply be labeled as defaults.

### Temporal evaluation

Splits use loan issue date (`issue_d`) to assess performance on later loan vintages.

| Split | Issue years | Loans |
| --- | --- | ---: |
| Training | Through 2016 | 99,443 |
| Validation | 2017 | 14,909 |
| Out-of-time (OOT) test | 2018 | 5,019 |

Binning and WoE mappings are learned from training data and reused on validation and OOT. The recalibration layer is fitted on validation predictions and then applied to OOT.

## Modeling workflow

### 1. Prepare eligible features

Inspect loan statuses, missingness, and default behavior by vintage. Remove identifiers, the source outcome field, and post-origination information such as repayments, recoveries, recent payment amounts, hardship, and settlement variables. These fields would reveal information unavailable at origination.

Completely missing training columns are removed during the exploratory workflow. For retained predictors, missing values receive a separate bin rather than universal zero or median imputation.

### 2. Create interpretable bins and select predictors

Numerical variables begin with training quantile bins. Adjacent bins are merged when their default rates are insufficiently different under a pooled two-proportion z-test (`|z| <= 2`). Further merges enforce a monotonic default-rate trend. Missing values remain separate from the ordered numerical bins.

WoE represents each bin's relative concentration of non-defaults and defaults:

$$
\mathrm{WoE}_b=\ln\left(\frac{\mathrm{DistGood}_b}{\mathrm{DistBad}_b}\right),\qquad
\mathrm{IV}=\sum_b(\mathrm{DistGood}_b-\mathrm{DistBad}_b)\mathrm{WoE}_b
$$

The implementation smooths bin counts to avoid undefined logarithms. Feature selection combines an **IV cutoff of 0.02**, manual removal of unsuitable or high-cardinality variables, and explicit drops informed by **absolute correlation above 0.90**. These correlation decisions are stored as a drop list rather than recalculated automatically by the selection script.

The saved logistic model uses **34 WoE predictors**: 31 numerical and 3 categorical (`term`, `home_ownership`, and `verification_status`). Unseen categories without a training WoE mapping receive a neutral value of zero.

### 3. Train and compare models

**Logistic regression** is the interpretable scorecard foundation. It learns coefficients on WoE features, allowing each feature's log-odds contribution to be inspected and converted into points.

**XGBoost** is a nonlinear challenger trained on the same transformed predictors. The configured model uses 300 trees, depth 3, learning rate 0.05, and row/column subsampling of 0.8. SHAP explains its OOT predictions; interest rate, loan term, loan amount, debt-to-income ratio, and FICO are among the main drivers.

Evaluation includes ROC-AUC, Gini, KS, and threshold-dependent classification metrics. Calibration is assessed separately using prediction deciles and observed versus predicted default rates.

### 4. Recalibrate probabilities and inspect drift

A separate logistic layer maps the original prediction's logit to a recalibrated PD. Calibration analysis compares predicted probabilities with observed default rates across prediction deciles.

Feature-level Population Stability Index (PSI) compares training with later populations. Credit-utilization variables show the strongest distribution shifts. Numerical PSI is calculated on non-missing values.

### 5. Construct borrower score points

Feature-bin points are derived from the fitted logistic coefficients:

$$
\mathrm{Factor}=\frac{\mathrm{PDO}}{\ln 2},\qquad
\mathrm{Points}_{j,b}=-\mathrm{Factor}\,\beta_j\,\mathrm{WoE}_{j,b}
$$

The configured settings are a base score of **600**, reference good:bad odds of **4:1**, and **20 points to double the odds (PDO)**. The current borrower script starts at 600, adds the available bin points, and rounds to an integer. Score-band tables compare observed default rates across validation and OOT borrowers.

## Repository guide

| Location | Purpose |
| --- | --- |
| [`scripts/`](scripts/) | Ordered preparation, modeling, analysis, and scoring scripts |
| [`notebooks/`](notebooks/) | Data exploration, missingness, categorical IV, correlation, and VIF analysis |
| [`models/`](models/) | Saved logistic, calibration, and XGBoost artifacts |
| [`images/`](images/) | Calibration, PSI, SHAP, comparison, and score-band plots |
| `data/raw/` | Local accepted and rejected loan CSVs |
| `outputs/` | Generated datasets, WoE tables, metrics, scorecards, and borrower scores |

Raw data and generated outputs are excluded from version control. Supply the input dataset locally to regenerate the pipeline artifacts.

## Run locally

Run commands from the repository root.

```bash
git clone https://github.com/SomiranDutta4/Credit-Default-Risk-Modeling.git
cd Credit-Default-Risk-Modeling
python3 -m venv .venv
source .venv/bin/activate
python -m pip install pandas numpy scikit-learn xgboost shap joblib matplotlib seaborn statsmodels jupyter
mkdir -p data/raw outputs models images
```

Supply `data/raw/accepted_200k.csv` with the expected Lending Club schema. The rejected-loan file is optional for the implemented pipeline.

Execute scripts in the following order. Each stage reads files produced by earlier stages; these are standalone scripts with paths configured near the top.

| Stage | Scripts |
| --- | --- |
| Inspect, define target, remove leakage, split, inspect missingness | `01_inspect_data.py` → `05_missing_analysis.py` |
| Explore WoE, merge bins, finalize IV, select, transform | `06_woe_iv.py` → `10_woe_transform.py` |
| Logistic training, evaluation, calibration | `11_train_logistic.py` → `14_calibration_model.py` |
| Stability and challenger | `15_psi_analysis.py`, then `15_xgboost_challenger.py` |
| SHAP and scorecard construction | `16_shap_analysis.py` → `18_final_bin_scorecard.py` |
| Borrower scoring and score-band checks | `19_score_borrowers.py`, then `20_scorecard_validation.py` |
| Consolidated model comparison | `21_final_model_comparison.py` |

For example:

```bash
python scripts/01_inspect_data.py
python scripts/02_prepare_data.py
python scripts/03_select_features.py
python scripts/04_split_data.py
python scripts/05_missing_analysis.py
```

Before stage 06, remove columns that are entirely missing in training:

```bash
python - <<'PY'
import pandas as pd

path = "outputs/train.csv"
train = pd.read_csv(path, low_memory=False)
train.dropna(axis=1, how="all").to_csv(path, index=False)
PY
```

For borrower scoring, set the input/output paths in stages 19 and 20 to the same split: validation or OOT. Before stage 21, use `default_rate` as the default-rate column name in the model metrics table.

## Outputs

| Generated artifact | Contents |
| --- | --- |
| `final_bin_boundaries.csv`, `final_woe_iv_all.csv` | Training bin edges and WoE mappings |
| `model_metrics.csv`, `xgboost_metrics.csv` | Model evaluation by split |
| `calibration_summary.csv`, `recalibration_results.csv` | Probability calibration checks |
| `psi_summary.csv`, `xgboost_shap_importance.csv` | Distribution stability and model explanations |
| `final_scorecard.csv`, `final_bin_scorecard.csv` | Feature weights and bin points |
| `validation_scored.csv`, `oot_scored.csv` | Borrower scores and feature point contributions |

## Visual analysis

### Credit-score validation

The OOT score-band analysis shows lower observed default rates among borrowers with higher scores.

![Observed default rate by credit-score band on OOT data](images/oot_score_band_default_rate.png)

### Population stability

PSI highlights changes in borrower characteristics between training and OOT populations, with the largest shifts concentrated in credit-utilization features.

![Population Stability Index across the leading shifted features](images/psi_summary.png)

<details>
<summary>View XGBoost feature explanations with SHAP</summary>

The SHAP summary shows feature contributions to the XGBoost model's predictions. Colors represent the WoE-transformed feature values.

![XGBoost SHAP summary on the out-of-time population](images/xgboost_shap_summary.png)

</details>

