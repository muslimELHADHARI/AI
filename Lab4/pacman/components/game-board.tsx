"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { GameState } from "@/lib/game-state"
import { findPath } from "@/lib/path-finding"
import { type Cell, CellType, Direction } from "@/lib/game-state"
import { useToast } from "@/hooks/use-toast"

interface GameBoardProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  isPlaying: boolean
}

const CELL_SIZE = 30
const ANIMATION_SPEED = 400 // ms per frame (slower animation for better stability)
const MAX_PATH_FINDING_ATTEMPTS = 5 // Maximum attempts to find a path before giving up

export default function GameBoard({ gameState, setGameState, isPlaying }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationFrame, setAnimationFrame] = useState<number | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0)
  const [pathFindingAttempts, setPathFindingAttempts] = useState<number>(0)
  const { toast } = useToast()

  // Main game loop
  useEffect(() => {
    if (!isPlaying || gameState.gameOver) {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
        setAnimationFrame(null)
      }
      return
    }

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastUpdateTime > ANIMATION_SPEED) {
        updateGameState()
        setLastUpdateTime(timestamp)
      }

      const frame = requestAnimationFrame(gameLoop)
      setAnimationFrame(frame)
    }

    if (animationFrame === null) {
      const frame = requestAnimationFrame(gameLoop)
      setAnimationFrame(frame)
    }

    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isPlaying, gameState.gameOver, animationFrame, lastUpdateTime])

  // Draw the game board
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Make sure grid exists and has content
    if (!gameState.grid || !gameState.grid.length || !gameState.grid[0]) {
      // Draw empty canvas
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    const { grid, pacman, ghosts } = gameState

    // Set canvas dimensions based on grid size
    canvas.width = grid[0].length * CELL_SIZE
    canvas.height = grid.length * CELL_SIZE

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid with a subtle gradient background
    const gridGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gridGradient.addColorStop(0, "#000000")
    gridGradient.addColorStop(1, "#0a0a1a")

    // Draw grid
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        const cellX = x * CELL_SIZE
        const cellY = y * CELL_SIZE

        // Draw cell background
        switch (cell.type) {
          case CellType.WALL:
            // Create a gradient for walls
            const wallGradient = ctx.createLinearGradient(cellX, cellY, cellX + CELL_SIZE, cellY + CELL_SIZE)
            wallGradient.addColorStop(0, "#1e3a8a")
            wallGradient.addColorStop(1, "#1e40af")
            ctx.fillStyle = wallGradient

            // Draw wall with rounded corners if adjacent cells are also walls
            ctx.beginPath()
            ctx.rect(cellX, cellY, CELL_SIZE, CELL_SIZE)
            ctx.fill()

            // Add a subtle 3D effect
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
            ctx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4)
            break

          case CellType.EMPTY:
            ctx.fillStyle = gridGradient
            ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE)

            // Draw subtle grid lines
            ctx.strokeStyle = "rgba(50, 50, 80, 0.2)"
            ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE)
            break

          case CellType.PELLET:
            ctx.fillStyle = gridGradient
            ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE)

            // Draw subtle grid lines
            ctx.strokeStyle = "rgba(50, 50, 80, 0.2)"
            ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE)

            // Draw pellet with glow effect
            ctx.fillStyle = "#ffffff"
            ctx.beginPath()
            ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, CELL_SIZE / 10, 0, Math.PI * 2)
            ctx.fill()

            // Add glow
            ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
            ctx.shadowBlur = 5
            ctx.beginPath()
            ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, CELL_SIZE / 10, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
            break

          case CellType.POWER_PELLET:
            ctx.fillStyle = gridGradient
            ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE)

            // Draw subtle grid lines
            ctx.strokeStyle = "rgba(50, 50, 80, 0.2)"
            ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE)

            // Draw power pellet with pulsing effect
            const pulseSize = CELL_SIZE / 4 + Math.sin(Date.now() / 200) * (CELL_SIZE / 20)

            // Add glow
            ctx.shadowColor = "rgba(0, 255, 255, 0.8)"
            ctx.shadowBlur = 10
            ctx.fillStyle = "#00ffff"
            ctx.beginPath()
            ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, pulseSize, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
            break
        }
      })
    })

    // Draw path if available
    if (gameState.currentPath.length > 0) {
      ctx.strokeStyle = "rgba(255, 255, 0, 0.2)"
      ctx.lineWidth = 3
      ctx.beginPath()

      const startX = pacman.x * CELL_SIZE + CELL_SIZE / 2
      const startY = pacman.y * CELL_SIZE + CELL_SIZE / 2

      ctx.moveTo(startX, startY)

      gameState.currentPath.forEach((point) => {
        const pathX = point.x * CELL_SIZE + CELL_SIZE / 2
        const pathY = point.y * CELL_SIZE + CELL_SIZE / 2
        ctx.lineTo(pathX, pathY)
      })

      ctx.stroke()
    }

    // Draw Pacman with animation
    const mouthAngle = 0.2 + Math.abs(Math.sin(Date.now() / 150)) * 0.2
    ctx.fillStyle = "#ffff00"
    ctx.beginPath()

    // Calculate mouth angle based on direction
    let startAngle = 0
    let endAngle = 0

    switch (pacman.direction) {
      case Direction.RIGHT:
        startAngle = mouthAngle * Math.PI
        endAngle = (2 - mouthAngle) * Math.PI
        break
      case Direction.LEFT:
        startAngle = (1 + mouthAngle) * Math.PI
        endAngle = (1 - mouthAngle) * Math.PI
        break
      case Direction.UP:
        startAngle = (1.5 + mouthAngle) * Math.PI
        endAngle = (1.5 - mouthAngle) * Math.PI
        break
      case Direction.DOWN:
        startAngle = (0.5 + mouthAngle) * Math.PI
        endAngle = (0.5 - mouthAngle) * Math.PI
        break
    }

    // Add glow effect for power mode
    if (gameState.powerMode) {
      ctx.shadowColor = "rgba(255, 255, 0, 0.8)"
      ctx.shadowBlur = 15
    }

    ctx.arc(
      pacman.x * CELL_SIZE + CELL_SIZE / 2,
      pacman.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      startAngle,
      endAngle,
    )
    ctx.lineTo(pacman.x * CELL_SIZE + CELL_SIZE / 2, pacman.y * CELL_SIZE + CELL_SIZE / 2)
    ctx.fill()

    // Reset shadow
    ctx.shadowBlur = 0

    // Draw ghosts
    ghosts.forEach((ghost, index) => {
      // Different colors for different ghosts
      const ghostColors = ["#ff0000", "#00ffde", "#ffb8de", "#ffb847"]

      // If in power mode, make ghosts blue and pulsing
      if (gameState.powerMode) {
        const pulseIntensity = 0.7 + Math.sin(Date.now() / 200) * 0.3
        ctx.fillStyle = `rgba(0, 0, 255, ${pulseIntensity})`
      } else {
        ctx.fillStyle = ghostColors[index % ghostColors.length]
      }

      // Ghost body with smooth animation
      const ghostY = ghost.y * CELL_SIZE + Math.sin(Date.now() / 300 + index) * 2 // Subtle floating animation

      // Add glow effect for ghosts
      if (!gameState.powerMode) {
        ctx.shadowColor = ghostColors[index % ghostColors.length].replace(")", ", 0.5)")
        ctx.shadowBlur = 10
      }

      ctx.beginPath()
      ctx.arc(
        ghost.x * CELL_SIZE + CELL_SIZE / 2,
        ghostY + CELL_SIZE / 2 - CELL_SIZE / 6,
        CELL_SIZE / 2 - 2,
        Math.PI,
        0,
      )

      // Ghost "skirt"
      const skirtY = ghostY + CELL_SIZE / 2 - CELL_SIZE / 6
      ctx.lineTo(ghost.x * CELL_SIZE + CELL_SIZE - 2, ghostY + CELL_SIZE - 2)

      // Create wavy bottom with animation
      const waveWidth = CELL_SIZE / 3
      const waveTime = Date.now() / 300
      for (let i = 0; i < 3; i++) {
        const waveHeight = (i % 2) * (CELL_SIZE / 4) + Math.sin(waveTime + i) * 2
        ctx.lineTo(ghost.x * CELL_SIZE + CELL_SIZE - 2 - waveWidth * i, ghostY + CELL_SIZE - 2 - waveHeight)
      }

      ctx.lineTo(ghost.x * CELL_SIZE + 2, ghostY + CELL_SIZE - 2)
      ctx.lineTo(ghost.x * CELL_SIZE + 2, skirtY)
      ctx.fill()

      // Reset shadow
      ctx.shadowBlur = 0

      // Ghost eyes
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(
        ghost.x * CELL_SIZE + CELL_SIZE / 3,
        ghostY + CELL_SIZE / 2 - CELL_SIZE / 6,
        CELL_SIZE / 6,
        0,
        Math.PI * 2,
      )
      ctx.arc(
        ghost.x * CELL_SIZE + (CELL_SIZE * 2) / 3,
        ghostY + CELL_SIZE / 2 - CELL_SIZE / 6,
        CELL_SIZE / 6,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // Ghost pupils
      if (gameState.powerMode) {
        ctx.fillStyle = "#ff0000" // Red pupils when scared
      } else {
        ctx.fillStyle = "#0000ff"
      }
      ctx.beginPath()

      // Adjust pupil position based on ghost direction
      let pupilOffsetX = 0
      let pupilOffsetY = 0

      switch (ghost.direction) {
        case Direction.RIGHT:
          pupilOffsetX = CELL_SIZE / 12
          break
        case Direction.LEFT:
          pupilOffsetX = -CELL_SIZE / 12
          break
        case Direction.UP:
          pupilOffsetY = -CELL_SIZE / 12
          break
        case Direction.DOWN:
          pupilOffsetY = CELL_SIZE / 12
          break
      }

      ctx.arc(
        ghost.x * CELL_SIZE + CELL_SIZE / 3 + pupilOffsetX,
        ghostY + CELL_SIZE / 2 - CELL_SIZE / 6 + pupilOffsetY,
        CELL_SIZE / 10,
        0,
        Math.PI * 2,
      )
      ctx.arc(
        ghost.x * CELL_SIZE + (CELL_SIZE * 2) / 3 + pupilOffsetX,
        ghostY + CELL_SIZE / 2 - CELL_SIZE / 6 + pupilOffsetY,
        CELL_SIZE / 10,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    })
  }, [gameState])

  const updateGameState = () => {
    setGameState((prevState) => {
      const { grid, pacman, ghosts, algorithm } = prevState

      // Create a copy of the current state
      const newState = { ...prevState }

      // Find the nearest pellet
      const target = findNearestPellet(grid, pacman)

      // If no pellets left, player wins
      if (!target) {
        return {
          ...newState,
          gameOver: true,
          win: true,
        }
      }

      // Find path to the nearest pellet using the selected algorithm
      let path = findPath(grid, pacman, target, algorithm)

      // If path finding fails, try a different approach or reset attempts
      if (path.length <= 1) {
        setPathFindingAttempts((prev) => prev + 1)

        if (pathFindingAttempts >= MAX_PATH_FINDING_ATTEMPTS) {
          // Reset attempts and try a different target or approach
          setPathFindingAttempts(0)

          // Try to find any pellet, not just the nearest
          const anyPellet = findAnyPellet(grid, pacman)
          if (anyPellet) {
            path = findPath(grid, pacman, anyPellet, algorithm)
          }

          // If still no path, move randomly
          if (path.length <= 1) {
            const randomMove = getRandomValidMove(grid, pacman)
            if (randomMove) {
              path = [
                { x: pacman.x, y: pacman.y },
                { x: randomMove.x, y: randomMove.y },
              ]
            }
          }
        }
      } else {
        // Reset attempts counter on successful path finding
        setPathFindingAttempts(0)
      }

      // Only update path if we found a valid one
      if (path.length > 1) {
        newState.currentPath = path.slice(1) // Skip the first point (current position)
      } else {
        newState.currentPath = []
      }

      // Move Pacman along the path (only if we have a path)
      if (path.length > 1) {
        const nextPoint = path[1]

        // Determine direction
        if (nextPoint.x > pacman.x) {
          newState.pacman.direction = Direction.RIGHT
        } else if (nextPoint.x < pacman.x) {
          newState.pacman.direction = Direction.LEFT
        } else if (nextPoint.y > pacman.y) {
          newState.pacman.direction = Direction.DOWN
        } else if (nextPoint.y < pacman.y) {
          newState.pacman.direction = Direction.UP
        }

        // Update position
        newState.pacman.x = nextPoint.x
        newState.pacman.y = nextPoint.y

        // Check if Pacman ate a pellet
        const cell = grid[nextPoint.y][nextPoint.x]
        if (cell.type === CellType.PELLET) {
          // Update grid
          newState.grid = [...grid]
          newState.grid[nextPoint.y][nextPoint.x] = { ...cell, type: CellType.EMPTY }

          // Update score
          newState.score += 10
        } else if (cell.type === CellType.POWER_PELLET) {
          // Update grid
          newState.grid = [...grid]
          newState.grid[nextPoint.y][nextPoint.x] = { ...cell, type: CellType.EMPTY }

          // Update score and set power mode
          newState.score += 50
          newState.powerMode = true

          // Set timeout to end power mode
          setTimeout(() => {
            setGameState((current) => ({
              ...current,
              powerMode: false,
            }))
          }, 10000) // 10 seconds of power mode
        }
      } else {
        // Fallback movement if no path is found
        // Try to move in a random valid direction to prevent getting stuck
        const possibleDirections = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT].filter((dir) => {
          let newX = pacman.x
          let newY = pacman.y

          switch (dir) {
            case Direction.UP:
              newY--
              break
            case Direction.DOWN:
              newY++
              break
            case Direction.LEFT:
              newX--
              break
            case Direction.RIGHT:
              newX++
              break
          }

          // Check if the new position is valid (not a wall and within bounds)
          return (
            newY >= 0 &&
            newY < grid.length &&
            newX >= 0 &&
            newX < grid[0].length &&
            grid[newY][newX].type !== CellType.WALL
          )
        })

        if (possibleDirections.length > 0) {
          // Choose a random direction
          const randomDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)]
          newState.pacman.direction = randomDirection

          // Update position
          switch (randomDirection) {
            case Direction.UP:
              newState.pacman.y--
              break
            case Direction.DOWN:
              newState.pacman.y++
              break
            case Direction.LEFT:
              newState.pacman.x--
              break
            case Direction.RIGHT:
              newState.pacman.x++
              break
          }

          // Check if Pacman ate a pellet in the new position
          const newX = newState.pacman.x
          const newY = newState.pacman.y
          const cell = grid[newY][newX]

          if (cell.type === CellType.PELLET) {
            // Update grid
            newState.grid = [...grid]
            newState.grid[newY][newX] = { ...cell, type: CellType.EMPTY }

            // Update score
            newState.score += 10
          } else if (cell.type === CellType.POWER_PELLET) {
            // Update grid
            newState.grid = [...grid]
            newState.grid[newY][newX] = { ...cell, type: CellType.EMPTY }

            // Update score and set power mode
            newState.score += 50
            newState.powerMode = true

            // Set timeout to end power mode
            setTimeout(() => {
              setGameState((current) => ({
                ...current,
                powerMode: false,
              }))
            }, 10000) // 10 seconds of power mode
          }
        }
      }

      // Move ghosts (slower than Pacman)
      if (Math.random() < 0.6) {
        // Only move ghosts 60% of the time
        newState.ghosts = ghosts.map((ghost) => {
          // Improved ghost AI: move randomly but avoid walls and prefer moving toward Pacman
          const possibleDirections = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT].filter((dir) => {
            let newX = ghost.x
            let newY = ghost.y

            switch (dir) {
              case Direction.UP:
                newY--
                break
              case Direction.DOWN:
                newY++
                break
              case Direction.LEFT:
                newX--
                break
              case Direction.RIGHT:
                newX++
                break
            }

            // Check if the new position is valid (not a wall and within bounds)
            return (
              newY >= 0 &&
              newY < grid.length &&
              newX >= 0 &&
              newX < grid[0].length &&
              grid[newY][newX].type !== CellType.WALL
            )
          })

          // If no valid directions, stay in place
          if (possibleDirections.length === 0) {
            return ghost
          }

          // Choose a direction with some bias toward Pacman
          let direction
          if (Math.random() < 0.7) {
            // 70% chance to move toward Pacman
            // Calculate distances for each direction
            const distances = possibleDirections.map((dir) => {
              let newX = ghost.x
              let newY = ghost.y

              switch (dir) {
                case Direction.UP:
                  newY--
                  break
                case Direction.DOWN:
                  newY++
                  break
                case Direction.LEFT:
                  newX--
                  break
                case Direction.RIGHT:
                  newX++
                  break
              }

              // Calculate Manhattan distance to Pacman
              return {
                dir,
                distance: Math.abs(newX - pacman.x) + Math.abs(newY - pacman.y),
              }
            })

            // Sort by distance (ascending if not in power mode, descending if in power mode)
            distances.sort(
              (a, b) =>
                newState.powerMode
                  ? b.distance - a.distance // Run away in power mode
                  : a.distance - b.distance, // Chase in normal mode
            )

            direction = distances[0].dir
          } else {
            // Random movement
            direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)]
          }

          // Update ghost position
          const newGhost = { ...ghost, direction }

          switch (direction) {
            case Direction.UP:
              newGhost.y--
              break
            case Direction.DOWN:
              newGhost.y++
              break
            case Direction.LEFT:
              newGhost.x--
              break
            case Direction.RIGHT:
              newGhost.x++
              break
          }

          return newGhost
        })
      }

      // Check for collisions with ghosts
      const pacmanCollision = newState.ghosts.some(
        (ghost) => ghost.x === newState.pacman.x && ghost.y === newState.pacman.y,
      )

      if (pacmanCollision) {
        if (newState.powerMode) {
          // Pacman eats the ghost
          newState.score += 200

          // Reset ghost positions
          newState.ghosts = newState.ghosts.map((ghost, index) => ({
            ...ghost,
            x: 9 + index,
            y: 10,
            direction: Direction.UP,
          }))
        } else {
          // Ghost eats Pacman
          newState.lives--

          if (newState.lives <= 0) {
            newState.gameOver = true
            newState.win = false
          } else {
            // Reset positions
            newState.pacman = {
              x: 10,
              y: 15,
              direction: Direction.RIGHT,
            }

            newState.ghosts = newState.ghosts.map((ghost, index) => ({
              ...ghost,
              x: 9 + index,
              y: 10,
              direction: Direction.UP,
            }))
          }
        }
      }

      return newState
    })
  }

  // Helper function to find the nearest pellet
  const findNearestPellet = (grid: Cell[][], pacman: { x: number; y: number }) => {
    let nearestPellet = null
    let minDistance = Number.POSITIVE_INFINITY

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x].type === CellType.PELLET || grid[y][x].type === CellType.POWER_PELLET) {
          const distance = Math.sqrt(Math.pow(pacman.x - x, 2) + Math.pow(pacman.y - y, 2))

          if (distance < minDistance) {
            minDistance = distance
            nearestPellet = { x, y }
          }
        }
      }
    }

    return nearestPellet
  }

  // Helper function to find any accessible pellet
  const findAnyPellet = (grid: Cell[][], pacman: { x: number; y: number }) => {
    // First try to find pellets in the same row or column
    for (let y = 0; y < grid.length; y++) {
      if (grid[y][pacman.x].type === CellType.PELLET || grid[y][pacman.x].type === CellType.POWER_PELLET) {
        return { x: pacman.x, y }
      }
    }

    for (let x = 0; x < grid[0].length; x++) {
      if (grid[pacman.y][x].type === CellType.PELLET || grid[pacman.y][x].type === CellType.POWER_PELLET) {
        return { x, y: pacman.y }
      }
    }

    // If no pellets in same row/column, find any pellet
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x].type === CellType.PELLET || grid[y][x].type === CellType.POWER_PELLET) {
          return { x, y }
        }
      }
    }

    return null
  }

  // Helper function to get a random valid move
  const getRandomValidMove = (grid: Cell[][], pacman: { x: number; y: number }) => {
    const directions = [
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 }, // Right
      { x: 0, y: 1 }, // Down
      { x: -1, y: 0 }, // Left
    ]

    const validMoves = directions.filter((dir) => {
      const newX = pacman.x + dir.x
      const newY = pacman.y + dir.y

      return (
        newY >= 0 && newY < grid.length && newX >= 0 && newX < grid[0].length && grid[newY][newX].type !== CellType.WALL
      )
    })

    if (validMoves.length === 0) return null

    const randomDir = validMoves[Math.floor(Math.random() * validMoves.length)]
    return {
      x: pacman.x + randomDir.x,
      y: pacman.y + randomDir.y,
    }
  }

  return (
    <div className="flex justify-center items-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-700 rounded-lg shadow-2xl"
        style={{
          boxShadow: "0 0 30px rgba(255, 255, 0, 0.1)",
        }}
      />
    </div>
  )
}
