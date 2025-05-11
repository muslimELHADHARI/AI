import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { type Cell, CellType } from "./game-state"

export const createInitialGrid = (): Cell[][] => {
  // Define a 20x20 grid
  const grid: Cell[][] = []

  // Define the maze layout
  // 0 = empty, 1 = wall, 2 = pellet, 3 = power pellet
  const layout = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 3, 1, 0, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 0, 1, 3, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]

  // Convert layout to grid
  for (let y = 0; y < layout.length; y++) {
    const row: Cell[] = []
    for (let x = 0; x < layout[y].length; x++) {
      let cellType: CellType
      switch (layout[y][x]) {
        case 0:
          cellType = CellType.EMPTY
          break
        case 1:
          cellType = CellType.WALL
          break
        case 2:
          cellType = CellType.PELLET
          break
        case 3:
          cellType = CellType.POWER_PELLET
          break
        default:
          cellType = CellType.EMPTY
      }
      row.push({ type: cellType })
    }
    grid.push(row)
  }

  return grid
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
