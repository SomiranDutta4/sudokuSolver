import React from "react";
import solveSudoku from "./solveSudoku";

const SudokuGrid = ({ setSolved, sethasSolved, grid, setGrid }) => {
  const handleInputChange = (row, col, value) => {
    if (value === "" || (/^[1-9]$/.test(value) && value.length === 1)) {
      const updatedGrid = grid.map((r, rIndex) =>
        r.map((c, cIndex) => (rIndex === row && cIndex === col ? value : c))
      );
      setGrid(updatedGrid);
    }
  };

  const solve = () => {
    const solvedArray = solveSudoku(grid);
    sethasSolved(true);
    setSolved(solvedArray);
  };

  return (
    <div className="flex flex-col items-center px-4 sm:px-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Sudoku Solver</h1>
      <div className="grid grid-cols-9 gap-[1px] max-w-[320px] sm:max-w-[480px] w-full border border-gray-700">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="text"
              value={cell}
              maxLength="1"
              onChange={(e) =>
                handleInputChange(rowIndex, colIndex, e.target.value)
              }
              className={`flex items-center justify-center text-center appearance-none aspect-square text-xl font-bold border border-gray-700
                ${
                  (Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 === 0
                    ? "bg-gray-200"
                    : "bg-gray-100"
                }
                ${
                  rowIndex % 3 === 0 ? "border-t-2" : ""
                } ${rowIndex === 8 ? "border-b-2" : ""}
                ${colIndex % 3 === 0 ? "border-l-2" : ""} ${
                colIndex === 8 ? "border-r-2" : ""
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          ))
        )}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 w-full justify-center">
        <button
          onClick={() =>
            setGrid(Array.from({ length: 9 }, () => Array(9).fill("")))
          }
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
        >
          Reset
        </button>
        <button
          onClick={solve}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 mt-4 sm:mt-0 w-full sm:w-auto"
        >
          Solve Sudoku
        </button>
      </div>
    </div>
  );
};

export default SudokuGrid;
