import { AlgorithmType, type Cell, CellType } from "./game-state"

interface Node {
  x: number
  y: number
  g: number // Cost from start
  h: number // Heuristic (estimated cost to goal)
  f: number // Total cost (g + h)
  parent: Node | null
  visited?: boolean // Track if node has been visited
}

interface Point {
  x: number
  y: number
}

// Manhattan distance heuristic
const heuristic = (a: Point, b: Point): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

// Get valid neighbors for a node
const getNeighbors = (grid: Cell[][], node: Node, goal: Point): Node[] => {
  const neighbors: Node[] = []
  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 }, // Right
    { x: 0, y: 1 }, // Down
    { x: -1, y: 0 }, // Left
  ]

  for (const dir of directions) {
    const newX = node.x + dir.x
    const newY = node.y + dir.y

    // Check if valid position (within bounds and not a wall)
    if (
      newX >= 0 &&
      newX < grid[0].length &&
      newY >= 0 &&
      newY < grid.length &&
      grid[newY][newX].type !== CellType.WALL
    ) {
      const g = node.g + 1
      const h = heuristic({ x: newX, y: newY }, goal)

      neighbors.push({
        x: newX,
        y: newY,
        g,
        h,
        f: g + h,
        parent: node,
      })
    }
  }

  return neighbors
}

// Recursive Best-First Search (RBFS) with improved implementation
const rbfs = (grid: Cell[][], start: Point, goal: Point): { path: Point[]; visited: Point[] } => {
  const visited: Point[] = []
  const path: Point[] = []

  // Check if start and goal are the same
  if (start.x === goal.x && start.y === goal.y) {
    path.push({ x: start.x, y: start.y })
    return { path, visited }
  }

  const startNode: Node = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal),
    parent: null,
  }

  // Track visited nodes to avoid cycles
  const visitedMap: Record<string, boolean> = {}

  // RBFS recursive function with cycle detection
  const rbfsSearch = (node: Node, fLimit: number): { result: boolean; fNew: number } => {
    const nodeKey = `${node.x},${node.y}`

    // Check if already visited
    if (visitedMap[nodeKey]) {
      return { result: false, fNew: Number.POSITIVE_INFINITY }
    }

    // Mark as visited
    visitedMap[nodeKey] = true
    visited.push({ x: node.x, y: node.y })

    // Check if goal reached
    if (node.x === goal.x && node.y === goal.y) {
      // Reconstruct path
      let current: Node | null = node
      while (current) {
        path.unshift({ x: current.x, y: current.y })
        current = current.parent
      }
      return { result: true, fNew: node.f }
    }

    // Get successors
    const successors = getNeighbors(grid, node, goal)

    // If no successors, return failure
    if (successors.length === 0) {
      return { result: false, fNew: Number.POSITIVE_INFINITY }
    }

    // Sort successors by f-value
    successors.sort((a, b) => a.f - b.f)

    // If best f-value > fLimit, return failure
    if (successors[0].f > fLimit) {
      return { result: false, fNew: successors[0].f }
    }

    // If only one successor, just expand it
    if (successors.length === 1) {
      return rbfsSearch(successors[0], fLimit)
    }

    // Recursive case
    let iterations = 0
    const MAX_ITERATIONS = 1000 // Prevent infinite loops

    while (iterations < MAX_ITERATIONS) {
      iterations++

      // Expand best node
      const best = successors[0]
      const alternative = successors.length > 1 ? successors[1].f : Number.POSITIVE_INFINITY

      // Set new f-limit
      const result = rbfsSearch(best, Math.min(fLimit, alternative))

      // Update f-value of best node
      successors[0].f = result.fNew

      // Re-sort successors
      successors.sort((a, b) => a.f - b.f)

      // If search succeeded or f-value > fLimit, return
      if (result.result || successors[0].f > fLimit) {
        return result
      }
    }

    // If we reach here, we've hit the iteration limit
    return { result: false, fNew: Number.POSITIVE_INFINITY }
  }

  // Start RBFS with a reasonable limit
  const result = rbfsSearch(startNode, Number.POSITIVE_INFINITY)

  // If no path found but we have visited nodes, try to find a partial path
  if (!result.result && visited.length > 0 && path.length === 0) {
    // Find the node closest to the goal among visited nodes
    let closestNode = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const node of visited) {
      const distance = heuristic(node, goal)
      if (distance < minDistance) {
        minDistance = distance
        closestNode = node
      }
    }

    if (closestNode) {
      path.push({ x: start.x, y: start.y })
      path.push({ x: closestNode.x, y: closestNode.y })
    }
  }

  return { path, visited }
}

// Iterative Deepening A* (IDA*) with improved implementation
const idaStar = (grid: Cell[][], start: Point, goal: Point): { path: Point[]; visited: Point[] } => {
  const visited: Point[] = []
  const path: Point[] = []

  // Check if start and goal are the same
  if (start.x === goal.x && start.y === goal.y) {
    path.push({ x: start.x, y: start.y })
    return { path, visited }
  }

  const startNode: Node = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal),
    parent: null,
  }

  // Track visited nodes to avoid cycles
  const visitedMap: Record<string, boolean> = {}

  // DFS with bound and cycle detection
  const search = (node: Node, g: number, bound: number): { found: boolean; cost: number } => {
    const nodeKey = `${node.x},${node.y}`

    // Check if already visited in this iteration
    if (visitedMap[nodeKey]) {
      return { found: false, cost: Number.POSITIVE_INFINITY }
    }

    // Mark as visited
    visitedMap[nodeKey] = true
    visited.push({ x: node.x, y: node.y })

    const f = g + node.h

    // If f > bound, return f as the new bound
    if (f > bound) {
      return { found: false, cost: f }
    }

    // If goal reached, reconstruct path and return
    if (node.x === goal.x && node.y === goal.y) {
      let current: Node | null = node
      while (current) {
        path.unshift({ x: current.x, y: current.y })
        current = current.parent
      }
      return { found: true, cost: f }
    }

    // Get successors
    const successors = getNeighbors(grid, node, goal)

    // Sort successors by f-value
    successors.sort((a, b) => a.f - b.f)

    let min = Number.POSITIVE_INFINITY

    // Explore successors
    for (const successor of successors) {
      const result = search(successor, successor.g, bound)

      // If goal found, return
      if (result.found) {
        return result
      }

      // Update min
      min = Math.min(min, result.cost)
    }

    return { found: false, cost: min }
  }

  // IDA* main loop with iteration limit
  let bound = startNode.h
  const MAX_ITERATIONS = 20 // Prevent too many iterations
  let iterations = 0

  while (iterations < MAX_ITERATIONS) {
    iterations++

    // Reset visited map for each iteration
    for (const key in visitedMap) {
      visitedMap[key] = false
    }

    const result = search(startNode, 0, bound)

    // If goal found, return
    if (result.found) {
      break
    }

    // If no solution, return
    if (result.cost === Number.POSITIVE_INFINITY) {
      break
    }

    // Update bound
    bound = result.cost
  }

  // If no path found but we have visited nodes, try to find a partial path
  if (path.length === 0 && visited.length > 0) {
    // Find the node closest to the goal among visited nodes
    let closestNode = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const node of visited) {
      const distance = heuristic(node, goal)
      if (distance < minDistance) {
        minDistance = distance
        closestNode = node
      }
    }

    if (closestNode) {
      path.push({ x: start.x, y: start.y })
      path.push({ x: closestNode.x, y: closestNode.y })
    }
  }

  return { path, visited }
}

// Simplified Memory-bounded A* (SMA*) with improved implementation
const smaStar = (grid: Cell[][], start: Point, goal: Point, maxNodes = 100): { path: Point[]; visited: Point[] } => {
  const visited: Point[] = []
  const path: Point[] = []

  // Check if start and goal are the same
  if (start.x === goal.x && start.y === goal.y) {
    path.push({ x: start.x, y: start.y })
    return { path, visited }
  }

  const startNode: Node = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal),
    parent: null,
  }

  // Open list (priority queue)
  const openList: Node[] = [startNode]

  // Closed list (already explored)
  const closedList: Node[] = []

  // Track visited nodes by position
  const visitedMap: Record<string, boolean> = {}

  // Main loop with iteration limit
  const MAX_ITERATIONS = 1000
  let iterations = 0

  while (openList.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++

    // Sort open list by f-value
    openList.sort((a, b) => a.f - b.f)

    // Get node with lowest f-value
    const current = openList.shift()!
    const nodeKey = `${current.x},${current.y}`

    // Skip if already processed
    if (visitedMap[nodeKey]) {
      continue
    }

    // Mark as visited
    visitedMap[nodeKey] = true
    visited.push({ x: current.x, y: current.y })

    // Check if goal reached
    if (current.x === goal.x && current.y === goal.y) {
      // Reconstruct path
      let node: Node | null = current
      while (node) {
        path.unshift({ x: node.x, y: node.y })
        node = node.parent
      }
      break
    }

    // Add to closed list
    closedList.push(current)

    // Get neighbors
    const neighbors = getNeighbors(grid, current, goal)

    // Process neighbors
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`

      // Skip if in closed list
      if (closedList.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
        continue
      }

      // Check if in open list
      const openNode = openList.find((node) => node.x === neighbor.x && node.y === neighbor.y)

      if (!openNode) {
        // Add to open list
        openList.push(neighbor)
      } else if (neighbor.g < openNode.g) {
        // Update existing node
        openNode.g = neighbor.g
        openNode.f = neighbor.g + openNode.h
        openNode.parent = current
      }
    }

    // Check if memory limit reached
    if (openList.length + closedList.length > maxNodes) {
      // Remove worst node from open list
      openList.sort((a, b) => b.f - a.f)
      openList.pop()
    }
  }

  // If no path found but we have visited nodes, try to find a partial path
  if (path.length === 0 && visited.length > 0) {
    // Find the node closest to the goal among visited nodes
    let closestNode = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const node of visited) {
      const distance = heuristic(node, goal)
      if (distance < minDistance) {
        minDistance = distance
        closestNode = node
      }
    }

    if (closestNode) {
      path.push({ x: start.x, y: start.y })
      path.push({ x: closestNode.x, y: closestNode.y })
    }
  }

  return { path, visited }
}

// Main function to find path based on selected algorithm
export const findPath = (grid: Cell[][], start: Point, goal: Point, algorithm: AlgorithmType): Point[] => {
  // Validate input
  if (!grid || grid.length === 0 || !start || !goal) {
    return []
  }

  // Check if start or goal is a wall
  if (
    start.y < 0 ||
    start.y >= grid.length ||
    start.x < 0 ||
    start.x >= grid[0].length ||
    goal.y < 0 ||
    goal.y >= grid.length ||
    goal.x < 0 ||
    goal.x >= grid[0].length ||
    grid[start.y][start.x].type === CellType.WALL ||
    grid[goal.y][goal.x].type === CellType.WALL
  ) {
    return []
  }

  // If start and goal are the same, return a single point
  if (start.x === goal.x && start.y === goal.y) {
    return [{ x: start.x, y: start.y }]
  }

  let result: { path: Point[]; visited: Point[] }

  try {
    switch (algorithm) {
      case AlgorithmType.RBFS:
        result = rbfs(grid, start, goal)
        break
      case AlgorithmType.IDA_STAR:
        result = idaStar(grid, start, goal)
        break
      case AlgorithmType.SMA_STAR:
        result = smaStar(grid, start, goal)
        break
      default:
        // Fallback to A* if algorithm not recognized
        result = smaStar(grid, start, goal)
    }

    // If no path found, return empty array
    if (!result.path.length) {
      return []
    }

    return result.path
  } catch (error) {
    console.error("Error in pathfinding:", error)
    return []
  }
}
