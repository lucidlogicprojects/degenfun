"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Paintbrush, Eraser, RotateCcw, Download, Users, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type DrawingMode = "brush" | "eraser"

interface Point {
  x: number
  y: number
  color: string
  size: number
  mode: DrawingMode
}

interface User {
  id: string
  color: string
  name: string
}

interface InteractiveCanvasProps {
  tokenName: string
}

export default function InteractiveCanvas({ tokenName }: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [mode, setMode] = useState<DrawingMode>("brush")
  const [brushSize, setBrushSize] = useState(5)
  const [color, setColor] = useState("#FF3CAC")
  const [connectedUsers, setConnectedUsers] = useState<User[]>([])
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const socketRef = useRef<any>(null)
  const { toast } = useToast()

  // Generate a random user ID and name
  const userId = useRef(`user_${Math.random().toString(36).substring(2, 9)}`)
  const userName = useRef(`degen_${Math.random().toString(36).substring(2, 5)}`)

  // Setup socket connection
  useEffect(() => {
    // In a real implementation, this would connect to your Socket.io server
    // For this demo, we'll simulate the connection

    // Simulate socket connection
    const fakeSocket = {
      on: (event: string, callback: Function) => {
        if (event === "connect") {
          setTimeout(() => callback(), 500)
        }
        if (event === "users") {
          // Simulate receiving users
          const randomUsers = Array(Math.floor(Math.random() * 3) + 1)
            .fill(null)
            .map(() => ({
              id: `user_${Math.random().toString(36).substring(2, 9)}`,
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
              name: `degen_${Math.random().toString(36).substring(2, 5)}`,
            }))

          setTimeout(
            () =>
              callback([
                {
                  id: userId.current,
                  color: color,
                  name: userName.current,
                },
                ...randomUsers,
              ]),
            1000,
          )
        }
        if (event === "draw") {
          // We'll handle this in the draw function
        }
      },
      emit: (event: string, data: any) => {
        // In a real implementation, this would emit to the server
        console.log(`Emitting ${event}:`, data)

        // Simulate receiving drawing from other users
        if (event === "draw" && Math.random() > 0.7) {
          setTimeout(
            () => {
              const randomUser = connectedUsers.find((u) => u.id !== userId.current)
              if (randomUser) {
                simulateOtherUserDrawing(randomUser)
              }
            },
            Math.random() * 2000 + 500,
          )
        }
      },
    }

    socketRef.current = fakeSocket

    // Connect to socket
    socketRef.current.on("connect", () => {
      toast({
        title: "Connected to Canvas",
        description: "You are now connected to the interactive canvas!",
      })

      // Get connected users
      socketRef.current.on("users", (users: User[]) => {
        setConnectedUsers(users)
      })

      // Listen for drawing events
      socketRef.current.on("draw", (point: Point) => {
        drawOnCanvas(point)
      })
    })

    return () => {
      // In a real implementation, disconnect from socket
      // socketRef.current.disconnect()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Fill with dark background
    ctx.fillStyle = "#111827"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add some initial degen art
    drawInitialArt(ctx, canvas.width, canvas.height)

    // Handle window resize
    const handleResize = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      ctx.putImageData(imageData, 0, 0)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [tokenName])

  const drawInitialArt = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw some cool initial patterns
    ctx.lineWidth = 2

    // Draw neon grid
    ctx.strokeStyle = "rgba(0, 255, 255, 0.2)"
    const gridSize = 30

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw token name hint
    ctx.font = "bold 40px Arial"
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
    ctx.textAlign = "center"
    ctx.fillText(`$${tokenName.toUpperCase().replace(/\s+/g, "")}`, width / 2, height / 2)
    ctx.font = "20px Arial"
    ctx.fillText("Draw here with frens", width / 2, height / 2 + 40)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)

    // Get position
    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    setLastPosition({ x, y })
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Get current position
    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY

      // Prevent scrolling when drawing
      e.preventDefault()
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const currentX = clientX - rect.left
    const currentY = clientY - rect.top

    // Create point data
    const point: Point = {
      x: currentX,
      y: currentY,
      color: color,
      size: brushSize,
      mode: mode,
    }

    // Draw on canvas
    drawOnCanvas(point)

    // Emit drawing event
    if (socketRef.current) {
      socketRef.current.emit("draw", point)
    }

    setLastPosition({ x: currentX, y: currentY })
  }

  const drawOnCanvas = (point: Point) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set drawing styles
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = point.size

    if (point.mode === "brush") {
      ctx.strokeStyle = point.color
      ctx.globalCompositeOperation = "source-over"
    } else {
      ctx.strokeStyle = "#111827" // Match background color for eraser
      ctx.globalCompositeOperation = "destination-out"
    }

    // Draw line
    ctx.beginPath()
    ctx.moveTo(lastPosition.x, lastPosition.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  }

  const simulateOtherUserDrawing = (user: User) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const randomX = Math.random() * canvas.width
    const randomY = Math.random() * canvas.height
    const randomSize = Math.random() * 10 + 2

    // Save current context settings
    const currentOperation = ctx.globalCompositeOperation
    const currentStroke = ctx.strokeStyle
    const currentLineWidth = ctx.lineWidth

    // Draw other user's mark
    ctx.globalCompositeOperation = "source-over"
    ctx.fillStyle = user.color
    ctx.beginPath()
    ctx.arc(randomX, randomY, randomSize, 0, Math.PI * 2)
    ctx.fill()

    // Add user indicator
    ctx.font = "10px Arial"
    ctx.fillStyle = "white"
    ctx.fillText(user.name, randomX + 10, randomY)

    // Restore context settings
    ctx.globalCompositeOperation = currentOperation
    ctx.strokeStyle = currentStroke
    ctx.lineWidth = currentLineWidth

    // Show toast for collaborative drawing
    if (Math.random() > 0.7) {
      toast({
        title: `${user.name} is drawing`,
        description: "Collaborate with other degens on the canvas!",
      })
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#111827"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    drawInitialArt(ctx, canvas.width, canvas.height)

    // Emit clear event
    if (socketRef.current) {
      socketRef.current.emit("clear")
    }

    toast({
      title: "Canvas Cleared",
      description: "The canvas has been reset",
    })
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `${tokenName.replace(/\s+/g, "-")}-artwork.png`
    link.href = dataURL
    link.click()

    toast({
      title: "Artwork Saved",
      description: "Your masterpiece has been downloaded!",
    })
  }

  const addSpecialEffect = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Add a special effect (starburst)
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const rays = 20
    const outerRadius = Math.min(canvas.width, canvas.height) * 0.4

    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2
      const length = outerRadius * (0.7 + Math.random() * 0.3)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length)

      const gradient = ctx.createLinearGradient(
        centerX,
        centerY,
        centerX + Math.cos(angle) * length,
        centerY + Math.sin(angle) * length,
      )

      gradient.addColorStop(0, "rgba(255, 60, 172, 0.8)")
      gradient.addColorStop(1, "rgba(120, 75, 160, 0)")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2 + Math.random() * 4
      ctx.stroke()
    }

    // Emit special effect event
    if (socketRef.current) {
      socketRef.current.emit("special-effect")
    }

    toast({
      title: "Special Effect Added",
      description: "You've added some degen magic to the canvas!",
    })
  }

  return (
    <Card className="bg-black/40 border-2 border-gradient-to-r from-pink-500 to-purple-500 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.2)]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            Degen Canvas
          </h3>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-green-400" />
            <span className="text-green-400">{connectedUsers.length} users online</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <ToggleGroup type="single" value={mode} onValueChange={(value) => value && setMode(value as DrawingMode)}>
              <ToggleGroupItem value="brush" aria-label="Brush">
                <Paintbrush className="h-4 w-4 mr-2" />
                Brush
              </ToggleGroupItem>
              <ToggleGroupItem value="eraser" aria-label="Eraser">
                <Eraser className="h-4 w-4 mr-2" />
                Eraser
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300 w-20">Brush Size:</label>
              <Slider
                value={[brushSize]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => setBrushSize(value[0])}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded overflow-hidden cursor-pointer"
            />
          </div>
        </div>

        <div className="relative border border-purple-700 rounded-md overflow-hidden bg-gray-900 shadow-inner">
          <canvas
            ref={canvasRef}
            className="w-full h-[400px] touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* User indicators */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {connectedUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.color }}></div>
                <span>{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 mt-4">
          <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/20" onClick={clearCanvas}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>

          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            onClick={addSpecialEffect}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Add Effect
          </Button>

          <Button
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white"
            onClick={downloadCanvas}
          >
            <Download className="h-4 w-4 mr-2" />
            Save Artwork
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
