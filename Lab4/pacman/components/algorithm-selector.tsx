"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlgorithmType } from "@/lib/game-state"
import { BrainCircuitIcon, NetworkIcon, ServerIcon } from "lucide-react"

interface AlgorithmSelectorProps {
  currentAlgorithm: AlgorithmType
  onAlgorithmChange: (algorithm: AlgorithmType) => void
}

export default function AlgorithmSelector({ currentAlgorithm, onAlgorithmChange }: AlgorithmSelectorProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700">
        <CardTitle>Algorithm Selection</CardTitle>
        <CardDescription className="text-gray-400">Choose the pathfinding algorithm</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <RadioGroup
          value={currentAlgorithm}
          onValueChange={(value) => onAlgorithmChange(value as AlgorithmType)}
          className="space-y-4"
        >
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${currentAlgorithm === AlgorithmType.RBFS ? "bg-yellow-500/20 border border-yellow-500/50" : "hover:bg-gray-700/50 border border-transparent"}`}
          >
            <RadioGroupItem value={AlgorithmType.RBFS} id="rbfs" className="h-5 w-5" />
            <Label htmlFor="rbfs" className="cursor-pointer flex items-center">
              <BrainCircuitIcon className="h-5 w-5 mr-2" />
              <span className="text-lg">RBFS</span>
            </Label>
          </div>
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${currentAlgorithm === AlgorithmType.IDA_STAR ? "bg-yellow-500/20 border border-yellow-500/50" : "hover:bg-gray-700/50 border border-transparent"}`}
          >
            <RadioGroupItem value={AlgorithmType.IDA_STAR} id="ida-star" className="h-5 w-5" />
            <Label htmlFor="ida-star" className="cursor-pointer flex items-center">
              <NetworkIcon className="h-5 w-5 mr-2" />
              <span className="text-lg">IDA*</span>
            </Label>
          </div>
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${currentAlgorithm === AlgorithmType.SMA_STAR ? "bg-yellow-500/20 border border-yellow-500/50" : "hover:bg-gray-700/50 border border-transparent"}`}
          >
            <RadioGroupItem value={AlgorithmType.SMA_STAR} id="sma-star" className="h-5 w-5" />
            <Label htmlFor="sma-star" className="cursor-pointer flex items-center">
              <ServerIcon className="h-5 w-5 mr-2" />
              <span className="text-lg">SMA*</span>
            </Label>
          </div>
        </RadioGroup>

        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <p className="mb-2 font-medium flex items-center">
            <span className="mr-2">Current:</span>
            <span className="text-yellow-400 font-bold">{currentAlgorithm}</span>
          </p>
          <p className="text-sm text-gray-300">
            {currentAlgorithm === AlgorithmType.RBFS &&
              "Recursive Best-First Search: Uses limited memory while maintaining optimality."}
            {currentAlgorithm === AlgorithmType.IDA_STAR &&
              "Iterative Deepening A*: Combines depth-first search with A* heuristics."}
            {currentAlgorithm === AlgorithmType.SMA_STAR &&
              "Simplified Memory-bounded A*: Adapts to available memory constraints."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
