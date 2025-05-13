// solver.js

const solve = (board, v1, v2, v3, i, j) => {
    if (i === 9) return true; // Reached end of rows
    if (j === 9) return solve(board, v1, v2, v3, i + 1, 0); // Move to next row if reached end of column

    // If the cell is already filled, move to the next one
    if (board[i][j] !== '') return solve(board, v1, v2, v3, i, j + 1);

    // Calculate the block row and column
    const rw = Math.floor(i / 3);
    const col = Math.floor(j / 3);

    // Try placing numbers from 1 to 9
    for (let k = 0; k < 9; k++) {
        if (!v1[i][k] && !v2[j][k] && !v3[rw * 3 + col][k]) {
            // Mark the number as used in the row, column, and block
            v1[i][k] = true;
            v2[j][k] = true;
            v3[rw * 3 + col][k] = true;

            // Recursively try to solve the next cell
            if (solve(board, v1, v2, v3, i, j + 1)) {
                board[i][j] = String(k + 1); // Assign the number if it fits
                return true;
            }

            // Backtrack if the number does not fit
            v1[i][k] = false;
            v2[j][k] = false;
            v3[rw * 3 + col][k] = false;
        }
    }
    return false; // Return false if no solution found
};

const solveSudoku = (grid) => {
    let board=structuredClone(grid)
    const v1 = Array.from({ length: 9 }, () => Array(9).fill(false)); // Row constraints
    const v2 = Array.from({ length: 9 }, () => Array(9).fill(false)); // Column constraints
    const v3 = Array.from({ length: 9 }, () => Array(9).fill(false)); // Block constraints

    // Preprocess the board and mark the used numbers in the constraints
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== '') {
                const num = board[i][j] - '1';
                v1[i][num] = true;
                v2[j][num] = true;
                const rw = Math.floor(i / 3);
                const col = Math.floor(j / 3);
                v3[3 * rw + col][num] = true;
            }
        }
    }

    // Call the solver function
    solve(board, v1, v2, v3, 0, 0); 
    return board; // Return the solved board
};

export default solveSudoku;
