import React from 'react';

const SolvedSudoku = ({ solvedSudoku, grid, setSolved, sethasSolved }) => {
  return (
    <div className="flex flex-col items-center px-4 sm:px-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Solved Sudoku</h1>
      <div className="grid grid-cols-9 gap-[1px] max-w-[320px] sm:max-w-[480px] w-full border border-gray-400">
        {solvedSudoku.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`flex items-center justify-center w-full aspect-square text-xl font-bold border border-gray-300
              ${
                grid[rowIndex][colIndex] !== "" // Check if the cell was originally filled
                  ? "bg-gray-400 text-white" // Darker shade for original filled boxes
                  : "bg-gray-100" // Lighter shade for solved boxes
              }`}
            >
              {cell}
            </div>
          ))
        )}
      </div>
      <button
        onClick={() => {
          setSolved([]); // Clear the solved puzzle
          sethasSolved(false); // Reset the game state
        }}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Solve Another Sudoku
      </button>
    </div>
  );
};

export default SolvedSudoku;
