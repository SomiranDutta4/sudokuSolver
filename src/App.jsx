// App.js

import React, { useState } from 'react';
import './App.css';
import SudokuGrid from './SudokuGrid';
import SolvedSudoku from './SolvedSudoku';

function App() {
  const [solvedSudoku, setSolved] = useState([]);
  const [hasSolved, sethasSolved] = useState(false);
  const [grid, setGrid] = useState(
    Array.from({ length: 9 }, () => Array(9).fill(""))
  );
  return (
    <>
      {!hasSolved ? (
        <SudokuGrid grid={grid} setGrid={setGrid} setSolved={setSolved} sethasSolved={sethasSolved} />
      ) : (
        <SolvedSudoku
          solvedSudoku={solvedSudoku}
          grid={grid} // Pass the original grid
          setSolved={setSolved}
          sethasSolved={sethasSolved}
        />

      )}
    </>
  );
}

export default App;
