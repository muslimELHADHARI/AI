"use client"

import { useState } from "react"
import GameBoard from "@/components/game-board"
import AlgorithmSelector from "@/components/algorithm-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type AlgorithmType, type GameState, initialGameState, createInitialGrid } from "@/lib/game-state"
import AlgorithmVisualizer from "@/components/algorithm-visualizer"
import { Badge } from "@/components/ui/badge"
import { GhostIcon, Gamepad2Icon, BrainCircuitIcon, TrophyIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PacmanGame() {
  // Initialize with a proper grid from the start to avoid render-time updates
  const [gameState, setGameState] = useState<GameState>(() => ({
    ...initialGameState,
    grid: createInitialGrid(),
  }))
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("game")
  const { toast } = useToast()

  const startGame = () => {
    setIsPlaying(true)
    setGameState((prev) => ({
      ...prev,
      score: 0,
      lives: 3,
      gameOver: false,
      win: false,
      pacman: {
        ...initialGameState.pacman,
      },
      ghosts: initialGameState.ghosts.map((ghost) => ({
        ...ghost,
      })),
      currentPath: [],
    }))

    toast({
      title: "Game Started",
      description: "Use the selected algorithm to navigate Pacman through the maze!",
      duration: 3000,
    })
  }

  const pauseGame = () => {
    setIsPlaying(false)
    toast({
      title: "Game Paused",
      description: "Take a break and resume when you're ready.",
      duration: 3000,
    })
  }

  const resetGame = () => {
    setIsPlaying(false)
    setGameState({
      ...initialGameState,
      algorithm: gameState.algorithm,
      grid: createInitialGrid(),
    })

    toast({
      title: "Game Reset",
      description: "The game has been reset to its initial state.",
      duration: 3000,
    })
  }

  const changeAlgorithm = (algorithm: AlgorithmType) => {
    setGameState((prev) => ({
      ...prev,
      algorithm,
    }))

    toast({
      title: "Algorithm Changed",
      description: `Now using ${algorithm} for pathfinding.`,
      duration: 3000,
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">
            Pacman AI
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore informed search algorithms through the classic Pacman game
          </p>
        </div>

        <Tabs defaultValue="game" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800/50 p-1 rounded-xl">
            <TabsTrigger
              value="game"
              className="text-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black rounded-lg"
            >
              <Gamepad2Icon className="mr-2 h-5 w-5" />
              Game
            </TabsTrigger>
            <TabsTrigger
              value="visualization"
              className="text-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black rounded-lg"
            >
              <BrainCircuitIcon className="mr-2 h-5 w-5" />
              Algorithm Visualization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm overflow-hidden rounded-xl">
                  <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold">Pacman Game</CardTitle>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-lg px-3 py-1 border-yellow-500 bg-yellow-500/10">
                          <TrophyIcon className="mr-1 h-4 w-4" /> Score: {gameState.score}
                        </Badge>
                        <Badge variant="outline" className="text-lg px-3 py-1 border-red-500 bg-red-500/10">
                          <GhostIcon className="mr-1 h-4 w-4" /> Lives: {gameState.lives}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-gray-400">
                      Using {gameState.algorithm} algorithm for pathfinding
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex justify-center items-center">
                      <GameBoard gameState={gameState} setGameState={setGameState} isPlaying={isPlaying} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700">
                    <CardTitle>Game Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-3">
                      {!isPlaying ? (
                        <Button
                          onClick={startGame}
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-6 text-lg font-bold shadow-lg shadow-yellow-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-yellow-500/30"
                        >
                          {gameState.gameOver ? "New Game" : "Start Game"}
                        </Button>
                      ) : (
                        <Button
                          onClick={pauseGame}
                          variant="outline"
                          className="border-2 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20 py-6 text-lg font-bold transition-all duration-200"
                        >
                          Pause Game
                        </Button>
                      )}
                      <Button
                        onClick={resetGame}
                        variant="outline"
                        className="border-2 border-red-500/50 text-red-500 hover:bg-red-500/20 py-6 text-lg font-bold transition-all duration-200"
                      >
                        Reset Game
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <AlgorithmSelector currentAlgorithm={gameState.algorithm} onAlgorithmChange={changeAlgorithm} />

                {gameState.gameOver && (
                  <Card
                    className={`${gameState.win ? "bg-green-800/50" : "bg-red-800/50"} border-gray-700 backdrop-blur-sm rounded-xl overflow-hidden`}
                  >
                    <CardHeader
                      className={`${gameState.win ? "bg-green-700/50" : "bg-red-700/50"} border-b border-gray-700`}
                    >
                      <CardTitle>{gameState.win ? "You Win!" : "Game Over"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="mb-4 text-lg">Final Score: {gameState.score}</p>
                      <Button
                        onClick={resetGame}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-4 text-lg font-bold shadow-lg shadow-yellow-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-yellow-500/30"
                      >
                        Play Again
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualization" className="mt-4">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700">
                <CardTitle>Algorithm Visualization</CardTitle>
                <CardDescription className="text-gray-400">
                  Visualize how {gameState.algorithm} works on a sample grid
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <AlgorithmVisualizer algorithm={gameState.algorithm} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
