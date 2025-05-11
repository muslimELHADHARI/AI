"use client"

import { useEffect, useRef, useState } from "react"
import { AlgorithmType } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface AlgorithmVisualizerProps {
  algorithm: AlgorithmType
}

interface Node {
  x: number
  y: number
  g: number
  h: number
  f: number
  parent: Node | null
}

export default function AlgorithmVisualizer({ algorithm }: AlgorithmVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [grid, setGrid] = useState<number[][]>([])
  const [startNode, setStartNode] = useState<{ x: number; y: number }>({ x: 2, y: 2 })
  const [goalNode, setGoalNode] = useState<{ x: number; y: number }>({ x: 12, y: 12 })
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [visitedNodes, setVisitedNodes] = useState<Node[]>([])
  const [path, setPath] = useState<Node[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [maxMemory, setMaxMemory] = useState(100)
  const [activeTab, setActiveTab] = useState("visualization")
  const [algorithmStats, setAlgorithmStats] = useState({
    nodesExplored: 0,
    pathLength: 0,
    executionTime: 0,
    maxMemoryUsed: 0,
  })

  // Initialize grid
  useEffect(() => {
    const rows = 15
    const cols = 15
    const newGrid: number[][] = []

    for (let i = 0; i < rows; i++) {
      const row: number[] = []
      for (let j = 0; j < cols; j++) {
        // 0 = empty, 1 = wall
        row.push(Math.random() < 0.2 ? 1 : 0)
      }
      newGrid.push(row)
    }

    // Ensure start and goal are not walls
    newGrid[startNode.y][startNode.x] = 0
    newGrid[goalNode.y][goalNode.x] = 0

    setGrid(newGrid)
  }, [])

  // Draw the grid
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !grid || grid.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cellSize = 30
    canvas.width = grid[0].length * cellSize
    canvas.height = grid.length * cellSize

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cellX = x * cellSize
        const cellY = y * cellSize

        // Draw cell
        if (grid[y][x] === 1) {
          // Wall
          ctx.fillStyle = "#1e3a8a"
        } else {
          // Empty
          ctx.fillStyle = "#000000"
        }
        ctx.fillRect(cellX, cellY, cellSize, cellSize)

        // Draw grid lines
        ctx.strokeStyle = "#333333"
        ctx.strokeRect(cellX, cellY, cellSize, cellSize)
      }
    }

    // Draw visited nodes
    visitedNodes &&
      visitedNodes.slice(0, currentStep).forEach((node) => {
        const cellX = node.x * cellSize
        const cellY = node.y * cellSize
        ctx.fillStyle = "rgba(65, 105, 225, 0.5)" // Royal blue with transparency
        ctx.fillRect(cellX, cellY, cellSize, cellSize)
      })

    // Draw path
    path.forEach((node) => {
      const cellX = node.x * cellSize
      const cellY = node.y * cellSize
      ctx.fillStyle = "rgba(255, 215, 0, 0.7)" // Gold with transparency
      ctx.fillRect(cellX, cellY, cellSize, cellSize)
    })

    // Draw start node
    ctx.fillStyle = "#00ff00" // Green
    ctx.fillRect(startNode.x * cellSize, startNode.y * cellSize, cellSize, cellSize)

    // Draw goal node
    ctx.fillStyle = "#ff0000" // Red
    ctx.fillRect(goalNode.x * cellSize, goalNode.y * cellSize, cellSize, cellSize)

    // Add labels
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px Arial"
    ctx.fillText("S", startNode.x * cellSize + cellSize / 2 - 4, startNode.y * cellSize + cellSize / 2 + 4)
    ctx.fillText("G", goalNode.x * cellSize + cellSize / 2 - 4, goalNode.y * cellSize + cellSize / 2 + 4)
  }, [grid, startNode, goalNode, visitedNodes, path, currentStep])

  // Run algorithm
  const runAlgorithm = () => {
    setIsRunning(true)
    setVisitedNodes([])
    setPath([])
    setCurrentStep(0)

    const startTime = performance.now()

    // Create start and goal nodes
    const start: Node = {
      x: startNode.x,
      y: startNode.y,
      g: 0,
      h: heuristic(startNode, goalNode),
      f: heuristic(startNode, goalNode),
      parent: null,
    }

    const goal: Node = {
      x: goalNode.x,
      y: goalNode.y,
      g: 0,
      h: 0,
      f: 0,
      parent: null,
    }

    let result: { visited: Node[]; path: Node[] }

    switch (algorithm) {
      case AlgorithmType.RBFS:
        result = rbfs(grid, start, goal)
        break
      case AlgorithmType.IDA_STAR:
        result = idaStar(grid, start, goal)
        break
      case AlgorithmType.SMA_STAR:
        result = smaStar(grid, start, goal, maxMemory)
        break
      default:
        result = { visited: [], path: [] }
    }

    const endTime = performance.now()

    setVisitedNodes(result.visited)
    setPath(result.path)

    setAlgorithmStats({
      nodesExplored: result.visited.length,
      pathLength: result.path.length,
      executionTime: endTime - startTime,
      maxMemoryUsed: result.visited.length, // Simplified measure
    })

    // Animate the visualization
    let step = 0
    const animate = () => {
      if (step < result.visited.length) {
        setCurrentStep(step)
        step++
        setTimeout(animate, 2000 - speed * 15) // Slower animation speed
      } else {
        setIsRunning(false)
      }
    }

    animate()
  }

  // Reset visualization
  const resetVisualization = () => {
    setIsRunning(false)
    setVisitedNodes([])
    setPath([])
    setCurrentStep(0)
  }

  // Generate new random grid
  const generateNewGrid = () => {
    const rows = 15
    const cols = 15
    const newGrid: number[][] = []

    for (let i = 0; i < rows; i++) {
      const row: number[] = []
      for (let j = 0; j < cols; j++) {
        // 0 = empty, 1 = wall
        row.push(Math.random() < 0.2 ? 1 : 0)
      }
      newGrid.push(row)
    }

    // Ensure start and goal are not walls
    newGrid[startNode.y][startNode.x] = 0
    newGrid[goalNode.y][goalNode.x] = 0

    setGrid(newGrid)
    resetVisualization()
  }

  // Heuristic function (Manhattan distance)
  const heuristic = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  // RBFS implementation
  const rbfs = (grid: number[][], start: Node, goal: { x: number; y: number }) => {
    const visited: Node[] = []
    const path: Node[] = []

    // Helper function to get neighbors
    const getNeighbors = (node: Node) => {
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

        // Check if valid position
        if (
          newX >= 0 &&
          newX < grid[0].length &&
          newY >= 0 &&
          newY < grid.length &&
          grid[newY][newX] !== 1 // Not a wall
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

    // RBFS recursive function
    const rbfsSearch = (node: Node, fLimit: number): { result: boolean; fNew: number } => {
      // Check if goal reached
      if (node.x === goal.x && node.y === goal.y) {
        // Reconstruct path
        let current: Node | null = node
        while (current) {
          path.unshift(current)
          current = current.parent
        }
        return { result: true, fNew: node.f }
      }

      // Get successors
      const successors = getNeighbors(node)

      // Add node to visited
      visited.push(node)

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
      while (true) {
        // Expand best node
        const best = successors[0]
        const alternative = successors[1].f

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
    }

    // Start RBFS
    rbfsSearch(start, Number.POSITIVE_INFINITY)

    return { visited, path }
  }

  // IDA* implementation
  const idaStar = (grid: number[][], start: Node, goal: { x: number; y: number }) => {
    const visited: Node[] = []
    const path: Node[] = []

    // Helper function to get neighbors
    const getNeighbors = (node: Node) => {
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

        // Check if valid position
        if (
          newX >= 0 &&
          newX < grid[0].length &&
          newY >= 0 &&
          newY < grid.length &&
          grid[newY][newX] !== 1 // Not a wall
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

    // DFS with bound
    const search = (node: Node, g: number, bound: number): { found: boolean; cost: number } => {
      const f = g + node.h

      // If f > bound, return f as the new bound
      if (f > bound) {
        return { found: false, cost: f }
      }

      // If goal reached, reconstruct path and return
      if (node.x === goal.x && node.y === goal.y) {
        let current: Node | null = node
        while (current) {
          path.unshift(current)
          current = current.parent
        }
        return { found: true, cost: f }
      }

      // Add node to visited
      visited.push(node)

      // Get successors
      const successors = getNeighbors(node)

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

    // IDA* main loop
    let bound = start.h
    while (true) {
      const result = search(start, 0, bound)

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

    return { visited, path }
  }

  // SMA* implementation
  const smaStar = (grid: number[][], start: Node, goal: { x: number; y: number }, maxNodes: number) => {
    const visited: Node[] = []
    const path: Node[] = []

    // Open list (priority queue)
    const openList: Node[] = [start]

    // Closed list (already explored)
    const closedList: Node[] = []

    // Helper function to get neighbors
    const getNeighbors = (node: Node) => {
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

        // Check if valid position
        if (
          newX >= 0 &&
          newX < grid[0].length &&
          newY >= 0 &&
          newY < grid.length &&
          grid[newY][newX] !== 1 // Not a wall
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

    // Main loop
    while (openList.length > 0) {
      // Sort open list by f-value
      openList.sort((a, b) => a.f - b.f)

      // Get node with lowest f-value
      const current = openList.shift()!

      // Add to visited
      visited.push(current)

      // Check if goal reached
      if (current.x === goal.x && current.y === goal.y) {
        // Reconstruct path
        let node: Node | null = current
        while (node) {
          path.unshift(node)
          node = node.parent
        }
        break
      }

      // Add to closed list
      closedList.push(current)

      // Get neighbors
      const neighbors = getNeighbors(current)

      // Process neighbors
      for (const neighbor of neighbors) {
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

    return { visited, path }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="comparison">Algorithm Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Algorithm:</h3>
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500 px-3 py-1">
                    {algorithm}
                  </Badge>
                </div>
                <div className="space-x-2">
                  <Button
                    onClick={runAlgorithm}
                    disabled={isRunning}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Run Algorithm
                  </Button>
                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={generateNewGrid}
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                  >
                    New Grid
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <canvas ref={canvasRef} className="border border-gray-700 rounded-lg shadow-lg" />
              </div>
            </div>

            <div className="w-full md:w-64 space-y-4">
              <div className="space-y-2">
                <Label>Animation Speed</Label>
                <Slider value={[speed]} onValueChange={(value) => setSpeed(value[0])} min={1} max={100} step={1} />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              {algorithm === AlgorithmType.SMA_STAR && (
                <div className="space-y-2">
                  <Label>Memory Limit (Nodes)</Label>
                  <Slider
                    value={[maxMemory]}
                    onValueChange={(value) => setMaxMemory(value[0])}
                    min={10}
                    max={500}
                    step={10}
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>10</span>
                    <span>{maxMemory}</span>
                    <span>500</span>
                  </div>
                </div>
              )}

              <Card className="p-4 bg-gray-800 border-gray-700">
                <h4 className="font-medium mb-2">Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Nodes Explored:</span>
                    <span className="font-medium text-yellow-400">
                      {currentStep} / {visitedNodes.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Path Length:</span>
                    <span className="font-medium text-yellow-400">{path.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Execution Time:</span>
                    <span className="font-medium text-yellow-400">{algorithmStats.executionTime.toFixed(2)} ms</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gray-800 border-gray-700">
                <h4 className="font-medium mb-2">Legend</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 mr-2 rounded-sm"></div>
                    <span>Start Node</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 mr-2 rounded-sm"></div>
                    <span>Goal Node</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 opacity-50 mr-2 rounded-sm"></div>
                    <span>Visited Nodes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 opacity-70 mr-2 rounded-sm"></div>
                    <span>Path</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-900 mr-2 rounded-sm"></div>
                    <span>Wall</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gray-800 border-gray-700">
              <h3 className="text-lg font-medium text-yellow-400 mb-2">RBFS</h3>
              <p className="text-sm mb-4">
                Recursive Best-First Search combines the memory efficiency of depth-first search with the optimality of
                best-first search.
              </p>
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Characteristics:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Space complexity: O(d) where d is the depth</li>
                  <li>Complete: Yes</li>
                  <li>Optimal: Yes</li>
                  <li>Memory efficient</li>
                  <li>May re-expand nodes multiple times</li>
                </ul>
              </div>
            </Card>

            <Card className="p-4 bg-gray-800 border-gray-700">
              <h3 className="text-lg font-medium text-yellow-400 mb-2">IDA*</h3>
              <p className="text-sm mb-4">
                Iterative Deepening A* combines iterative deepening with A* heuristics for memory-efficient optimal
                search.
              </p>
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Characteristics:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Space complexity: O(d) where d is the depth</li>
                  <li>Complete: Yes</li>
                  <li>Optimal: Yes</li>
                  <li>Very memory efficient</li>
                  <li>May re-expand nodes many times</li>
                  <li>Good for large state spaces</li>
                </ul>
              </div>
            </Card>

            <Card className="p-4 bg-gray-800 border-gray-700">
              <h3 className="text-lg font-medium text-yellow-400 mb-2">SMA*</h3>
              <p className="text-sm mb-4">
                Simplified Memory-bounded A* adapts to available memory constraints while maintaining optimality when
                possible.
              </p>
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Characteristics:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Space complexity: O(m) where m is memory limit</li>
                  <li>Complete: Yes (if solution within memory)</li>
                  <li>Optimal: Yes (if solution within memory)</li>
                  <li>Adapts to memory constraints</li>
                  <li>Drops least promising nodes when memory full</li>
                  <li>Good for constrained environments</li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Algorithm Comparison</h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-2 text-left">Algorithm</th>
                    <th className="p-2 text-left">Optimal</th>
                    <th className="p-2 text-left">Complete</th>
                    <th className="p-2 text-left">Space Complexity</th>
                    <th className="p-2 text-left">Time Complexity</th>
                    <th className="p-2 text-left">Best Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-700">
                    <td className="p-2">RBFS</td>
                    <td className="p-2">Yes</td>
                    <td className="p-2">Yes</td>
                    <td className="p-2">O(d)</td>
                    <td className="p-2">
                      O(b<sup>d</sup>)
                    </td>
                    <td className="p-2">Memory-constrained environments</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="p-2">IDA*</td>
                    <td className="p-2">Yes</td>
                    <td className="p-2">Yes</td>
                    <td className="p-2">O(d)</td>
                    <td className="p-2">
                      O(b<sup>d</sup>)
                    </td>
                    <td className="p-2">Very large state spaces</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="p-2">SMA*</td>
                    <td className="p-2">Yes*</td>
                    <td className="p-2">Yes*</td>
                    <td className="p-2">O(m)</td>
                    <td className="p-2">
                      O(b<sup>d</sup>)
                    </td>
                    <td className="p-2">Fixed memory constraints</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs mt-2 text-gray-400">* If solution fits within memory constraints</p>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Performance Considerations</h4>
              <p className="text-sm">The performance of these algorithms depends on several factors:</p>
              <ul className="list-disc list-inside space-y-1 text-sm mt-2 text-gray-300">
                <li>Quality of the heuristic function</li>
                <li>Branching factor of the search space</li>
                <li>Depth of the solution</li>
                <li>Available memory</li>
                <li>Grid complexity and obstacle density</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
