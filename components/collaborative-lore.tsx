"use client"

import { useState, useEffect, useRef } from "react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import type { Socket } from "socket.io-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, Send, Users, Star, Clock, Sparkles } from "lucide-react"

interface LoreEntry {
  id: string
  author: string
  authorAddress: string
  content: string
  timestamp: number
  votes: number
}

interface CollaborativeLoreProps {
  tokenName: string
  contractAddress: string
  wallet: any
}

export default function CollaborativeLore({ tokenName, contractAddress, wallet }: CollaborativeLoreProps) {
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([])
  const [newEntry, setNewEntry] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(1)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [initialLore, setInitialLore] = useState("")
  const { toast } = useToast()
  const loreContainerRef = useRef<HTMLDivElement>(null)

  // Generate initial lore based on token name
  useEffect(() => {
    const parts = tokenName.split(" ")
    const creature = parts[0]
    const animal = parts[1]
    const accessory = parts.slice(2).join(" ")

    const lore = `In the distant corners of the Solana blockchain, a legend was born. The ${creature} ${animal} ${accessory} emerged from a chaotic fusion of memes and code. It is said that when the moon is full and the charts are green, the ${creature} ${animal} appears to those who truly believe, bringing untold riches to diamond-handed holders.`

    setInitialLore(lore)
  }, [tokenName])

  // Setup socket connection
  useEffect(() => {
    // In a real implementation, this would connect to your Socket.io server
    // For this demo, we'll use a mock implementation
    const mockSocket = {
      id: `socket_${Math.random().toString(36).substring(2, 9)}`,
      on: (event: string, callback: Function) => {
        if (event === "connect") {
          setTimeout(() => {
            setIsConnected(true)
            callback()
          }, 1000)
        }
        if (event === "users") {
          // Simulate receiving users count
          setTimeout(() => {
            const randomUsers = Math.floor(Math.random() * 5) + 2
            setOnlineUsers(randomUsers)
            callback(randomUsers)
          }, 1500)
        }
        if (event === "initial_lore") {
          // Simulate receiving initial lore entries
          setTimeout(() => {
            const initialEntries: LoreEntry[] = [
              {
                id: "entry_1",
                author: "FoundingDegen",
                authorAddress: "7Z5Sj3J5BgU9mNqCcpLwXHtVnbRLqsjb4sPfGcM7Sxtg",
                content:
                  "The token's power grows with each new holder, as the community expands, so does its influence across the blockchain.",
                timestamp: Date.now() - 3600000,
                votes: 12,
              },
              {
                id: "entry_2",
                author: "MoonBoi",
                authorAddress: "EXnGBBSamqzd3uxEdRLUiYzjJkTwQyorAaFXdfteuGXe",
                content:
                  "Whispers among the degens speak of a prophecy - when the token reaches 1000 holders, a special power will be unlocked.",
                timestamp: Date.now() - 1800000,
                votes: 8,
              },
            ]
            setLoreEntries(initialEntries)
            callback(initialEntries)
          }, 2000)
        }
        if (event === "new_lore_entry") {
          // We'll handle this when we emit
        }
        if (event === "vote") {
          // We'll handle this when we emit
        }
      },
      emit: (event: string, data: any, callback?: Function) => {
        console.log(`Emitting ${event}:`, data)

        if (event === "new_lore_entry") {
          // Simulate receiving the entry back from the server
          setTimeout(() => {
            const newEntryWithId: LoreEntry = {
              ...data,
              id: `entry_${Date.now()}`,
              timestamp: Date.now(),
              votes: 0,
            }
            setLoreEntries((prev) => [...prev, newEntryWithId])
            if (callback) callback({ success: true, entry: newEntryWithId })
          }, 500)
        }

        if (event === "vote") {
          // Simulate updating votes
          setTimeout(() => {
            setLoreEntries((prev) =>
              prev.map((entry) => (entry.id === data.entryId ? { ...entry, votes: entry.votes + data.value } : entry)),
            )
            if (callback) callback({ success: true })
          }, 300)
        }
      },
      disconnect: () => {
        setIsConnected(false)
      },
    } as unknown as Socket

    setSocket(mockSocket as Socket)

    // Connect to socket
    mockSocket.on("connect", () => {
      toast({
        title: "Connected to Lore Server",
        description: "You are now connected to the collaborative lore-building experience!",
      })

      // Get online users
      mockSocket.on("users", (count: number) => {
        setOnlineUsers(count)
      })

      // Get initial lore entries
      mockSocket.on("initial_lore", (entries: LoreEntry[]) => {
        setLoreEntries(entries)
      })

      // Listen for new lore entries
      mockSocket.on("new_lore_entry", (entry: LoreEntry) => {
        setLoreEntries((prev) => [...prev, entry])

        // Show toast for new entry
        if (entry.authorAddress !== wallet.publicKey?.toBase58()) {
          toast({
            title: "New Lore Added",
            description: `${entry.author} added to the token lore!`,
          })
        }
      })

      // Listen for vote updates
      mockSocket.on("vote", ({ entryId, value }: { entryId: string; value: number }) => {
        setLoreEntries((prev) =>
          prev.map((entry) => (entry.id === entryId ? { ...entry, votes: entry.votes + value } : entry)),
        )
      })
    })

    return () => {
      if (mockSocket) {
        mockSocket.disconnect()
      }
    }
  }, [toast, wallet.publicKey])

  // Scroll to bottom when new entries are added
  useEffect(() => {
    if (loreContainerRef.current) {
      loreContainerRef.current.scrollTop = loreContainerRef.current.scrollHeight
    }
  }, [loreEntries])

  const submitLoreEntry = async () => {
    if (!newEntry.trim() || !socket || !isConnected) return

    setIsSubmitting(true)

    try {
      // Create a new lore entry
      const entry = {
        author: wallet.publicKey
          ? wallet.publicKey.toBase58().slice(0, 4) + "..." + wallet.publicKey.toBase58().slice(-4)
          : "Anonymous",
        authorAddress: wallet.publicKey ? wallet.publicKey.toBase58() : "",
        content: newEntry,
      }

      // Emit the new entry to the server
      socket.emit("new_lore_entry", entry, (response: { success: boolean; entry: LoreEntry }) => {
        if (response.success) {
          setNewEntry("")
          toast({
            title: "Lore Added",
            description: "Your contribution to the token lore has been recorded!",
          })
        }
      })
    } catch (error) {
      console.error("Error submitting lore:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit your lore entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const voteOnEntry = (entryId: string, value: number) => {
    if (!socket || !isConnected) return

    socket.emit("vote", { entryId, value }, (response: { success: boolean }) => {
      if (response.success) {
        toast({
          title: "Vote Recorded",
          description: value > 0 ? "You upvoted this lore entry!" : "You downvoted this lore entry!",
        })
      }
    })
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " " +
      date.toLocaleDateString([], { month: "short", day: "numeric" })
    )
  }

  const disconnectWallet = () => {
    if (wallet.disconnect) {
      wallet.disconnect()
    }
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-indigo-950 to-black text-white">
      {/* Header */}
      <header className="border-b border-indigo-900/30 backdrop-blur-md bg-black/40 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 relative mr-3 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {tokenName}
              </h1>
              <p className="text-xs text-indigo-400">
                {contractAddress.slice(0, 4)}...{contractAddress.slice(-4)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <div className="flex items-center gap-2 bg-indigo-900/20 px-3 py-1 rounded-full text-xs text-indigo-300">
              <Users className="h-3 w-3" />
              <span>{onlineUsers} online</span>
            </div>
            <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700 !rounded-md !h-9 !py-0 !px-4" />
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="border-red-500/50 text-red-400 hover:bg-red-900/20 h-9"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
              The Legend Grows
            </h2>
            <p className="text-gray-300">
              Join the community in building the lore of {tokenName}. Each contribution adds to the legend and shapes
              the token's story.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="bg-black/40 border border-indigo-500/30 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.15)] mb-6">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">The Origin</h3>
                <p className="text-gray-300 leading-relaxed">{initialLore}</p>
              </div>
            </Card>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-300">Community Lore</h3>
              <div
                ref={loreContainerRef}
                className="bg-black/40 border border-indigo-500/30 rounded-lg p-4 max-h-[400px] overflow-y-auto shadow-[0_0_15px_rgba(99,102,241,0.15)]"
              >
                <AnimatePresence>
                  {loreEntries.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>Be the first to add to the token lore!</p>
                    </div>
                  ) : (
                    loreEntries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-4 last:mb-0"
                      >
                        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2 border border-indigo-500/30">
                                <AvatarImage
                                  src={`/diverse-group-avatars.png?height=32&width=32&query=avatar ${entry.author}`}
                                />
                                <AvatarFallback>{entry.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-indigo-300">{entry.author}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTimestamp(entry.timestamp)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => voteOnEntry(entry.id, 1)}
                                className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/20"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                              <span className="text-sm font-medium text-gray-300">{entry.votes}</span>
                            </div>
                          </div>
                          <p className="text-gray-200">{entry.content}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-black/40 border border-indigo-500/30 rounded-lg p-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <h3 className="text-xl font-semibold mb-4 text-indigo-300">Add to the Legend</h3>
              <div className="space-y-4">
                <Textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="Continue the story of this legendary token..."
                  className="bg-black/50 border-indigo-700/50 text-white min-h-[120px]"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Writing as{" "}
                    {wallet.publicKey
                      ? wallet.publicKey.toBase58().slice(0, 4) + "..." + wallet.publicKey.toBase58().slice(-4)
                      : "Anonymous"}
                  </p>
                  <Button
                    onClick={submitLoreEntry}
                    disabled={!newEntry.trim() || isSubmitting || !isConnected}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Add to Lore
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-900/30 backdrop-blur-md bg-black/40 py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {tokenName} | Powered by Solana
          </p>
        </div>
      </footer>
    </div>
  )
}
