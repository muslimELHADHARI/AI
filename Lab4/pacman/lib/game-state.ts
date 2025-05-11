export enum AlgorithmType {
  RBFS = "RBFS",
  IDA_STAR = "IDA*",
  SMA_STAR = "SMA*",
}

export enum CellType {
  EMPTY = "EMPTY",
  WALL = "WALL",
  PELLET = "PELLET",
  POWER_PELLET = "POWER_PELLET",
}

export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export interface Cell {
  type: CellType
}

export interface GameState {
  grid: Cell[][]
  pacman: {
    x: number
    y: number
    direction: Direction
  }
  ghosts: {
    x: number
    y: number
    direction: Direction
  }[]
  score: number
  lives: number
  gameOver: boolean
  win: boolean
  algorithm: AlgorithmType
  powerMode: boolean
  currentPath: { x: number; y: number }[]
}

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

// Create a default empty grid for initial state
const emptyGrid: Cell[][] = []

export const initialGameState: GameState = {
  grid: emptyGrid, // Start with an empty grid that will be initialized properly
  pacman: {
    x: 10,
    y: 15,
    direction: Direction.RIGHT,
  },
  ghosts: [
    { x: 9, y: 10, direction: Direction.UP },
    { x: 10, y: 10, direction: Direction.UP },
    { x: 11, y: 10, direction: Direction.UP },
    { x: 12, y: 10, direction: Direction.UP },
  ],
  score: 0,
  lives: 3,
  gameOver: false,
  win: false,
  algorithm: AlgorithmType.RBFS,
  powerMode: false,
  currentPath: [],
}
