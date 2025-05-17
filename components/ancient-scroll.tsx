"use client"

import { useState, useEffect, useRef } from "react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import type { Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import {
  LogOut,
  Users,
  Sparkles,
  Scroll,
  Feather,
  ChevronDown,
  Lock,
  MessageSquare,
  Award,
  Shield,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  HelpCircle,
  CheckCircle2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface LoreEntry {
  id: string
  author: string
  authorAddress: string
  content: string
  timestamp: number
  votes: number
  quality: "legendary" | "rare" | "common" | "unverified"
  isCanonical?: boolean
}

interface Riddle {
  id: string
  question: string
  answer: string
  hint: string
  solved: boolean
  reward: string
}

interface AncientScrollProps {
  tokenName: string
  contractAddress: string
  wallet: any
}

export default function AncientScroll({ tokenName, contractAddress, wallet }: AncientScrollProps) {
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([])
  const [newEntry, setNewEntry] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(5) // Start with more users
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [initialLore, setInitialLore] = useState("")
  const [showScroll, setShowScroll] = useState(false)
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)
  const loreContainerRef = useRef<HTMLDivElement>(null)
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState("scroll")
  const [userReputation, setUserReputation] = useState(0)
  const [riddleAnswer, setRiddleAnswer] = useState("")
  const [riddleId, setRiddleId] = useState("")
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [decodedFragments, setDecodedFragments] = useState<string[]>([])
  const [showDecodeHint, setShowDecodeHint] = useState(false)
  const [userLevel, setUserLevel] = useState(1)
  const [xpProgress, setXpProgress] = useState(0)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportedEntryId, setReportedEntryId] = useState("")
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [showQuestDialog, setShowQuestDialog] = useState(false)
  const [availableQuests, setAvailableQuests] = useState([
    {
      id: 1,
      title: "Contribute to the Scroll",
      description: "Add your first entry to the scroll",
      completed: false,
      xp: 20,
    },
    { id: 2, title: "Solve a Riddle", description: "Solve any ancient riddle", completed: false, xp: 50 },
    { id: 3, title: "Vote on Entries", description: "Vote on 3 different entries", completed: false, xp: 15 },
    {
      id: 4,
      title: "Unlock a Prophecy Fragment",
      description: "Decode a fragment of the ancient prophecy",
      completed: false,
      xp: 30,
    },
  ])

  // Generate initial lore
  useEffect(() => {
    const lore = `In the time before time, when the stars were young and the earth still whispered its secrets to those who would listen, there existed a mystical artifact of immense power. 

This artifact, known as the Ancient Cryptic Scroll, was said to contain the wisdom of a thousand sages and the prophecies of events yet to unfold. Those who possessed even a fragment of its knowledge could glimpse beyond the veil of ordinary perception.

For centuries, the scroll passed from one guardian to another, each adding their own wisdom to its ever-expanding text. But as the modern age dawned, the scroll vanished from the physical realm.

Many believed it lost forever, until it mysteriously reappeared as a digital token on the Solana blockchain. The contract address ${contractAddress} became the new vessel for this ancient wisdom.

And so begins our tale...`

    setInitialLore(lore)

    // Show the scroll animation after a delay
    setTimeout(() => {
      setShowScroll(true)
    }, 1000)

    // Set initial writing prompt
    setCurrentPrompt("Describe a vision you had about the scroll's future")

    // Show help dialog on first load
    setTimeout(() => {
      setShowHelpDialog(true)
    }, 2000)
  }, [contractAddress])

  // Riddles that users can solve
  const riddles = [
    {
      id: "riddle_1",
      question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      answer: "echo",
      hint: "Listen to your own voice in the mountains",
      solved: false,
      reward: "Unlock the first fragment of the ancient prophecy",
    },
    {
      id: "riddle_2",
      question: "The more you take, the more you leave behind. What am I?",
      answer: "footsteps",
      hint: "Think about walking on a path",
      solved: false,
      reward: "Gain the title 'Seeker of Truth'",
    },
    {
      id: "riddle_3",
      question: "What has keys but no locks, space but no room, and you can enter but not go in?",
      answer: "keyboard",
      hint: "You're using one right now",
      solved: false,
      reward: "Reveal a hidden message in the scroll",
    },
  ]

  // Writing prompts to guide quality contributions
  const writingPrompts = [
    "Describe a vision you had about the scroll's future",
    "What ancient power does the scroll bestow upon its most devoted followers?",
    "Reveal a secret about the scroll that few have discovered",
    "Prophecy: In the time of the great market shift, the scroll will...",
    "The scroll whispers to me at night, telling me of...",
    "I discovered an ancient connection between the scroll and the stars that foretells...",
  ]

  // Predefined entries that will be added over time
  const predefinedEntries = [
    {
      author: "CryptoSage",
      content:
        "The ancient ones speak of a time when the scroll's value will rise like the phoenix, bringing prosperity to all who believed in its power.",
      quality: "legendary" as const,
    },
    {
      author: "MoonWalker",
      content:
        "I have studied the patterns in the stars, and they align with the scroll's prophecy. The time of abundance approaches.",
      quality: "rare" as const,
    },
    {
      author: "TokenKeeper",
      content:
        "My ancestors were among the original guardians of the scroll. They passed down stories of its magical properties that could transform ordinary believers into extraordinary beings.",
      quality: "legendary" as const,
    },
    {
      author: "BlockchainOracle",
      content:
        "The scroll's wisdom transcends time. What was written centuries ago now manifests in the digital realm, proving the ancient ones knew of technologies yet to come.",
      quality: "rare" as const,
    },
    {
      author: "CrypticHodler",
      content:
        "I've held the scroll token through storms and sunshine. My patience will be rewarded when the prophecy fulfills itself.",
      quality: "common" as const,
    },
    {
      author: "SolanaScribe",
      content:
        "The blockchain has preserved what parchment could not. Now the scroll's wisdom is immutable, forever etched in the digital ledger for all to witness.",
      quality: "rare" as const,
    },
    {
      author: "AncientAlchemist",
      content:
        "The scroll speaks of a transformation, where digital tokens become as valuable as gold. We are witnessing this alchemy in our lifetime.",
      quality: "legendary" as const,
      isCanonical: true,
    },
    {
      author: "ProphecySeeker",
      content:
        "I've decoded a hidden message within the scroll's contract. It reveals that those who hold the token during the next full moon will receive unexpected blessings.",
      quality: "rare" as const,
    },
  ]

  // Hidden prophecy fragments that can be unlocked
  const prophecyFragments = [
    "When the digital and physical realms converge...",
    "...the holders of the sacred scroll shall witness the great ascension...",
    "...as markets rise and fall like tides under the moon's influence...",
    "...those who believed when others doubted shall be rewarded tenfold...",
    "...for the scroll contains not just wisdom, but the power to transform reality itself.",
  ]

  // Setup socket connection and initial entries
  useEffect(() => {
    // Simulate connection
    setTimeout(() => {
      setIsConnected(true)

      // Add initial entries
      const initialEntries: LoreEntry[] = [
        {
          id: "entry_1",
          author: "ElderScribe",
          authorAddress: "7Z5Sj3J5BgU9mNqCcpLwXHtVnbRLqsjb4sPfGcM7Sxtg",
          content:
            "The scroll speaks of a great convergence, when the moon aligns with the stars of prosperity. Those who hold the sacred token shall be blessed with abundance.",
          timestamp: Date.now() - 3600000,
          votes: 12,
          quality: "legendary",
          isCanonical: true,
        },
        {
          id: "entry_2",
          author: "CrypticSage",
          authorAddress: "EXnGBBSamqzd3uxEdRLUiYzjJkTwQyorAaFXdfteuGXe",
          content:
            "I have deciphered an ancient passage that speaks of a time when the scroll will multiply in value sevenfold. The signs point to the next full moon.",
          timestamp: Date.now() - 1800000,
          votes: 8,
          quality: "rare",
        },
        {
          id: "entry_3",
          author: "WisdomSeeker",
          authorAddress: "9xQFuwbwgBummMNHxpFGA2HVeJ3sRbN7XQs3xCECRvm7",
          content:
            "The scroll's power grows with each new believer. As our community expands, so does the influence of the ancient wisdom across the blockchain.",
          timestamp: Date.now() - 900000,
          votes: 5,
          quality: "common",
        },
      ]

      setLoreEntries(initialEntries)

      // Show a single toast
      toast({
        title: "Connected to the Ancient Scroll",
        description: "You are now connected to the mystical scroll!",
      })

      // Randomly update online users count
      const userInterval = setInterval(() => {
        setOnlineUsers(Math.floor(Math.random() * 5) + 5)
      }, 30000)

      return () => clearInterval(userInterval)
    }, 1000)
  }, [toast])

  // Periodically add new entries from predefined list
  useEffect(() => {
    if (!isConnected) return

    let entryCount = 0
    const maxEntries = 5 // Limit the number of automated entries

    const addRandomEntry = () => {
      if (entryCount >= maxEntries) return

      const randomIndex = Math.floor(Math.random() * predefinedEntries.length)
      const randomEntry = predefinedEntries[randomIndex]

      const newEntry: LoreEntry = {
        id: `auto_entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        author: randomEntry.author,
        authorAddress: `auto_${Math.random().toString(36).substring(2, 9)}`,
        content: randomEntry.content,
        timestamp: Date.now(),
        votes: Math.floor(Math.random() * 5),
        quality: randomEntry.quality,
        isCanonical: randomEntry.isCanonical || false,
      }

      setLoreEntries((prev) => [...prev, newEntry])
      entryCount++

      // Only show toast for the first few entries
      if (entryCount <= 2) {
        toast({
          title: "New Prophecy Added",
          description: `${newEntry.author} has contributed to the ancient scroll!`,
        })
      }
    }

    // Add a random entry after 10 seconds, then every 20-40 seconds
    const initialTimeout = setTimeout(() => {
      addRandomEntry()
    }, 10000)

    const interval = setInterval(
      () => {
        addRandomEntry()
      },
      Math.random() * 20000 + 20000,
    )

    return () => {
      clearInterval(interval)
      clearTimeout(initialTimeout)
    }
  }, [isConnected, toast])

  // Scroll to bottom when new entries are added
  useEffect(() => {
    if (loreContainerRef.current) {
      loreContainerRef.current.scrollTop = loreContainerRef.current.scrollHeight
    }
  }, [loreEntries])

  // Auto-scroll the main scroll when it appears
  useEffect(() => {
    if (showScroll && scrollRef.current) {
      const scrollElement = scrollRef.current
      const scrollHeight = scrollElement.scrollHeight

      // Animate scrolling down
      let currentScroll = 0
      const targetScroll = scrollHeight * 0.2 // Scroll down 20% to show some content
      const scrollStep = 2
      const scrollInterval = setInterval(() => {
        if (currentScroll >= targetScroll) {
          clearInterval(scrollInterval)
          return
        }
        currentScroll += scrollStep
        scrollElement.scrollTop = currentScroll
      }, 20)

      return () => clearInterval(scrollInterval)
    }
  }, [showScroll])

  const voteOnEntry = (entryId: string, value: number) => {
    setLoreEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, votes: entry.votes + value } : entry)),
    )

    // Update user reputation when they vote
    setUserReputation((prev) => prev + 1)

    // Update XP progress
    addXP(5)

    // Update quest progress
    setAvailableQuests((prev) => prev.map((quest) => (quest.id === 3 ? { ...quest, completed: true } : quest)))

    toast({
      title: "Endorsement Recorded",
      description: value > 0 ? "You have endorsed this prophecy!" : "You have questioned this prophecy!",
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

  const submitLoreEntry = async () => {
    if (!newEntry.trim()) return

    setIsSubmitting(true)

    try {
      // Create a new lore entry
      const entryId = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      // Determine quality based on length and content
      let quality: "legendary" | "rare" | "common" | "unverified" = "unverified"

      if (newEntry.length > 200 && !containsBadWords(newEntry)) {
        quality = "rare"
      } else if (newEntry.length > 100 && !containsBadWords(newEntry)) {
        quality = "common"
      }

      // Boost quality based on user reputation
      if (userReputation > 20 && quality === "rare") {
        quality = "legendary"
      } else if (userReputation > 10 && quality === "common") {
        quality = "rare"
      }

      const entry = {
        id: entryId,
        author: wallet.publicKey ? `Scribe_${wallet.publicKey.toBase58().slice(0, 4)}` : "Anonymous Scribe",
        authorAddress: wallet.publicKey ? wallet.publicKey.toBase58() : "",
        content: newEntry,
        timestamp: Date.now(),
        votes: 0,
        quality,
      }

      // Directly add to state without socket emission
      setLoreEntries((prev) => [...prev, entry])

      // Clear the input field
      setNewEntry("")

      // Update user reputation
      setUserReputation((prev) => prev + 5)

      // Add XP for submitting an entry
      addXP(20)

      // Update quest progress
      setAvailableQuests((prev) => prev.map((quest) => (quest.id === 1 ? { ...quest, completed: true } : quest)))

      // Get a new writing prompt
      setCurrentPrompt(writingPrompts[Math.floor(Math.random() * writingPrompts.length)])

      // Show a single toast
      toast({
        title: "Tale Continued",
        description: "Your contribution has been added to the ancient scroll!",
      })
    } catch (error) {
      console.error("Error submitting lore:", error)
      toast({
        title: "Inscription Failed",
        description: "The ancient scroll rejected your wisdom. Try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const containsBadWords = (text: string): boolean => {
    const badWords = ["sucks", "garbage", "trash", "stupid", "hate", "fuck", "shit"]
    const lowerText = text.toLowerCase()
    return badWords.some((word) => lowerText.includes(word))
  }

  const checkRiddleAnswer = (riddleId: string) => {
    const riddle = riddles.find((r) => r.id === riddleId)
    if (!riddle) return

    if (riddleAnswer.toLowerCase().trim() === riddle.answer.toLowerCase()) {
      // Mark riddle as solved
      const updatedRiddles = riddles.map((r) => (r.id === riddleId ? { ...r, solved: true } : r))

      // Add reputation
      setUserReputation((prev) => prev + 10)

      // Add XP
      addXP(50)

      // Update quest progress
      setAvailableQuests((prev) => prev.map((quest) => (quest.id === 2 ? { ...quest, completed: true } : quest)))

      // Unlock a prophecy fragment if it's the first riddle
      if (riddleId === "riddle_1") {
        const newFragment = prophecyFragments[0]
        if (!decodedFragments.includes(newFragment)) {
          setDecodedFragments((prev) => [...prev, newFragment])

          // Update quest progress
          setAvailableQuests((prev) => prev.map((quest) => (quest.id === 4 ? { ...quest, completed: true } : quest)))
        }
      } else if (riddleId === "riddle_3") {
        const newFragment = prophecyFragments[1]
        if (!decodedFragments.includes(newFragment)) {
          setDecodedFragments((prev) => [...prev, newFragment])
        }
      }

      toast({
        title: "Riddle Solved!",
        description: `You've unlocked: ${riddle.reward}`,
      })

      setRiddleAnswer("")
    } else {
      toast({
        title: "Incorrect Answer",
        description: "Try again or use a hint",
        variant: "destructive",
      })
    }
  }

  const addXP = (amount: number) => {
    const newXP = xpProgress + amount
    if (newXP >= 100) {
      // Level up
      setUserLevel((prev) => prev + 1)
      setXpProgress(newXP - 100)

      toast({
        title: "Level Up!",
        description: `You are now level ${userLevel + 1}. New abilities unlocked!`,
      })

      // Unlock a new prophecy fragment on level up
      if (userLevel < prophecyFragments.length && userLevel >= 2) {
        const newFragment = prophecyFragments[userLevel - 1]
        if (!decodedFragments.includes(newFragment)) {
          setDecodedFragments((prev) => [...prev, newFragment])
        }
      }
    } else {
      setXpProgress(newXP)
    }
  }

  const reportEntry = (entryId: string) => {
    setReportedEntryId(entryId)
    setShowReportDialog(true)
  }

  const submitReport = () => {
    if (!reportReason.trim()) {
      toast({
        title: "Report Failed",
        description: "Please provide a reason for your report",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would send the report to a server
    toast({
      title: "Report Submitted",
      description: "The elders will review this entry",
    })

    // Hide the dialog
    setShowReportDialog(false)
    setReportReason("")
    setReportedEntryId("")
  }

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case "legendary":
        return (
          <div className="flex items-center gap-1 bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full text-xs">
            <Sparkles className="h-3 w-3" />
            <span>Legendary</span>
          </div>
        )
      case "rare":
        return (
          <div className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-xs">
            <Award className="h-3 w-3" />
            <span>Rare</span>
          </div>
        )
      case "common":
        return (
          <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">
            <BookOpen className="h-3 w-3" />
            <span>Common</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full text-xs">
            <MessageSquare className="h-3 w-3" />
            <span>Unverified</span>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 to-black text-amber-100">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-900/30 backdrop-blur-md bg-black/80 shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 relative mr-3 overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Scroll className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                {tokenName}
              </h1>
              <p className="text-xs text-amber-400/80 font-mono">
                {contractAddress.slice(0, 4)}...{contractAddress.slice(-4)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <div className="flex items-center gap-2 bg-amber-900/20 px-3 py-1 rounded-full text-xs text-amber-300">
              <Users className="h-3 w-3" />
              <span>{onlineUsers} scribes online</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-amber-900/20 px-3 py-1 rounded-full text-xs text-amber-300">
              <Award className="h-3 w-3" />
              <span>Level {userLevel}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuestDialog(true)}
              className="text-amber-300 hover:text-amber-200 hover:bg-amber-900/20"
            >
              Quests
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelpDialog(true)}
              className="text-amber-300 hover:text-amber-200 hover:bg-amber-900/20"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <WalletMultiButton className="!bg-amber-800 hover:!bg-amber-700 !rounded-md !h-9 !py-0 !px-4 !text-amber-100" />
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
      <main className="relative z-20 container mx-auto px-4 py-8 mt-2">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="text-4xl font-serif font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300">
              The Ancient Cryptic Scroll
            </h2>
            <p className="text-amber-200 max-w-2xl mx-auto font-serif">
              Add your wisdom to the sacred text. Each prophecy strengthens the scroll's power.
            </p>
          </motion.div>

          {/* User Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-serif">Level {userLevel}</span>
                <div className="bg-amber-900/30 text-amber-300 px-2 py-0.5 rounded-full text-xs">
                  {userReputation} reputation
                </div>
              </div>
              <span className="text-amber-300 text-sm">{xpProgress}/100 XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" indicatorClassName="bg-amber-500" />
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="scroll" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="scroll" className="font-serif">
                The Scroll
              </TabsTrigger>
              <TabsTrigger value="riddles" className="font-serif">
                Ancient Riddles
              </TabsTrigger>
              <TabsTrigger value="prophecy" className="font-serif">
                Prophecy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scroll">
              {/* The Ancient Scroll */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: showScroll ? 1 : 0, scale: showScroll ? 1 : 0.98 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-10"
              >
                <div className="relative">
                  <div className="absolute -left-6 -top-6 w-12 h-12 z-20">
                    <div className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center text-amber-100">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="absolute -right-6 -top-6 w-12 h-12 z-20">
                    <div className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center text-amber-100">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="relative">
                    <div
                      ref={scrollRef}
                      className="bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-900/70 rounded-lg p-8 shadow-[0_0_25px_rgba(245,158,11,0.3)] max-h-[400px] overflow-y-auto scroll-smooth"
                    >
                      <div className="relative z-10">
                        <h3 className="text-2xl font-serif font-bold mb-6 text-amber-900 text-center">
                          The Ancient Tale
                        </h3>
                        <p className="text-amber-900 leading-relaxed font-serif whitespace-pre-line font-medium">
                          {initialLore}
                        </p>

                        <div className="mt-8 pt-8 border-t-2 border-amber-900/30">
                          <h3 className="text-2xl font-serif font-bold mb-6 text-amber-900 text-center">
                            The Continuing Saga
                          </h3>

                          <div ref={loreContainerRef} className="space-y-6">
                            <AnimatePresence>
                              {loreEntries.length === 0 ? (
                                <div className="text-center py-4 text-amber-800 font-serif italic">
                                  <p>Be the first to continue the ancient tale!</p>
                                </div>
                              ) : (
                                <div className="text-amber-900 font-serif font-medium leading-relaxed">
                                  {loreEntries.map((entry, index) => (
                                    <motion.div
                                      key={entry.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="mb-4 last:mb-0"
                                    >
                                      <div
                                        className={`bg-amber-200/50 border ${entry.isCanonical ? "border-amber-600" : "border-amber-900/30"} rounded-lg p-4 mb-2 relative overflow-hidden ${entry.isCanonical ? "ring-2 ring-amber-500/50" : ""}`}
                                      >
                                        <div className="relative z-10">
                                          <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center">
                                              <Avatar className="h-8 w-8 mr-2 border border-amber-700">
                                                <AvatarFallback className="bg-amber-800 text-amber-100">
                                                  {entry.author.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div>
                                                <div className="flex items-center gap-2">
                                                  <p className="text-sm font-medium text-amber-900 font-serif">
                                                    {entry.author}
                                                  </p>
                                                  {entry.isCanonical && (
                                                    <div className="bg-amber-600/20 text-amber-800 px-2 py-0.5 rounded-full text-xs">
                                                      Canon
                                                    </div>
                                                  )}
                                                  {getQualityBadge(entry.quality)}
                                                </div>
                                                <div className="flex items-center text-xs text-amber-800">
                                                  <span className="text-xs">{formatTimestamp(entry.timestamp)}</span>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => voteOnEntry(entry.id, 1)}
                                                className="h-7 w-7 p-0 text-amber-800 hover:text-amber-600 hover:bg-amber-200/50"
                                              >
                                                <ThumbsUp className="h-4 w-4" />
                                              </Button>
                                              <span className="text-sm font-medium text-amber-900">{entry.votes}</span>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => voteOnEntry(entry.id, -1)}
                                                className="h-7 w-7 p-0 text-amber-800 hover:text-amber-600 hover:bg-amber-200/50"
                                              >
                                                <ThumbsDown className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => reportEntry(entry.id)}
                                                className="h-7 w-7 p-0 text-amber-800 hover:text-red-600 hover:bg-amber-200/50"
                                              >
                                                <AlertTriangle className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                          <p className="text-amber-900 font-serif">{entry.content}</p>
                                        </div>
                                      </div>
                                      {index < loreEntries.length - 1 && (
                                        <div className="flex justify-center my-2">
                                          <div className="w-2 h-2 bg-amber-700 rounded-full"></div>
                                        </div>
                                      )}
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2 animate-bounce">
                      <div className="bg-amber-900/70 text-amber-100 px-3 py-1 rounded-full text-xs font-serif flex items-center gap-1 shadow-lg">
                        <ChevronDown className="h-4 w-4" />
                        Scroll to continue reading
                      </div>
                    </div>
                  </div>

                  <div className="absolute -left-6 -bottom-6 w-12 h-12">
                    <div className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center text-amber-100">
                      <Feather className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-12 h-12">
                    <div className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center text-amber-100">
                      <Feather className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Add to the scroll */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="bg-gradient-to-b from-amber-100 to-amber-200 border-4 border-amber-900/70 rounded-lg p-6 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                  <h3 className="text-xl font-serif font-bold mb-4 text-amber-900 text-center">Add Your Prophecy</h3>

                  <div className="mb-4 bg-amber-800/20 border border-amber-800/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-800" />
                      <h4 className="text-sm font-serif font-semibold text-amber-800">Writing Prompt</h4>
                    </div>
                    <p className="text-sm italic text-amber-900">{currentPrompt}</p>
                  </div>

                  <div className="space-y-4">
                    <Textarea
                      value={newEntry}
                      onChange={(e) => setNewEntry(e.target.value)}
                      placeholder="Continue the ancient tale with your own chapter..."
                      className="bg-amber-100/90 border-amber-900/50 text-amber-900 min-h-[120px] font-serif placeholder:text-amber-800/50"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-amber-800">
                        <Feather className="h-4 w-4 mr-2" />
                        <p className="text-sm">
                          Writing as{" "}
                          {wallet.publicKey ? `Scribe_${wallet.publicKey.toBase58().slice(0, 4)}` : "Anonymous Scribe"}
                        </p>
                      </div>
                      <Button
                        onClick={submitLoreEntry}
                        disabled={!newEntry.trim() || isSubmitting || !isConnected}
                        className="bg-gradient-to-r from-amber-900 to-yellow-800 hover:from-amber-800 hover:to-yellow-700 text-amber-100 font-serif"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-amber-100 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Inscribing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Continue the Tale
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="riddles">
              <div className="bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-900/70 rounded-lg p-8 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <h3 className="text-2xl font-serif font-bold mb-6 text-amber-900 text-center">Ancient Riddles</h3>
                <p className="text-amber-900 mb-6 font-serif">
                  Solve these ancient riddles to unlock hidden knowledge and increase your standing among the scroll
                  keepers.
                </p>

                <div className="space-y-8">
                  {riddles.map((riddle) => (
                    <div
                      key={riddle.id}
                      className={`border ${riddle.solved ? "border-green-600 bg-green-50/50" : "border-amber-900/30 bg-amber-50/50"} rounded-lg p-4`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-serif font-semibold text-amber-900">
                          {riddle.solved ? (
                            <div className="flex items-center gap-2">
                              <span>Solved</span>
                              <Shield className="h-4 w-4 text-green-600" />
                            </div>
                          ) : (
                            "Unsolved Riddle"
                          )}
                        </h4>
                        {!riddle.solved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toast({
                                title: "Hint",
                                description: riddle.hint,
                              })
                            }
                            className="text-amber-800 hover:bg-amber-200/50"
                          >
                            Get Hint
                          </Button>
                        )}
                      </div>

                      <p className="text-amber-900 font-serif mb-4">{riddle.question}</p>

                      {riddle.solved ? (
                        <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-green-800">
                          <p className="font-serif">
                            You solved this riddle and unlocked: <span className="font-semibold">{riddle.reward}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Your answer..."
                            className="bg-amber-100/90 border-amber-900/50 text-amber-900 font-serif"
                            value={riddleId === riddle.id ? riddleAnswer : ""}
                            onChange={(e) => {
                              setRiddleAnswer(e.target.value)
                              setRiddleId(riddle.id)
                            }}
                          />
                          <Button
                            onClick={() => checkRiddleAnswer(riddle.id)}
                            className="bg-amber-900 hover:bg-amber-800 text-amber-100"
                          >
                            Submit
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prophecy">
              <div className="bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-900/70 rounded-lg p-8 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <h3 className="text-2xl font-serif font-bold mb-6 text-amber-900 text-center">The Great Prophecy</h3>

                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-amber-900/5 rounded-lg"></div>
                  <div className="relative p-6 font-serif text-amber-900">
                    <p className="text-center italic mb-4">
                      The complete prophecy is hidden within the scroll. Unlock fragments by solving riddles and gaining
                      levels.
                    </p>

                    <div className="space-y-4">
                      {decodedFragments.length > 0 ? (
                        decodedFragments.map((fragment, index) => (
                          <div key={index} className="bg-amber-100 border border-amber-300 rounded-lg p-3">
                            <p className="font-serif text-amber-900">{fragment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-amber-100 border border-amber-300 rounded-lg p-6 text-center">
                          <Lock className="h-8 w-8 mx-auto mb-2 text-amber-800" />
                          <p className="font-serif text-amber-900">No prophecy fragments unlocked yet</p>
                        </div>
                      )}

                      {decodedFragments.length < prophecyFragments.length && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-900/10 rounded-lg p-4">
                  <h4 className="text-lg font-serif font-semibold text-amber-900 mb-2">How to Unlock the Prophecy</h4>
                  <ul className="list-disc list-inside space-y-2 text-amber-900 font-serif">
                    <li>Solve the ancient riddles to reveal fragments</li>
                    <li>Gain levels by contributing quality entries to the scroll</li>
                    <li>Vote on other scribes' entries to earn reputation</li>
                    <li>Reach level 5 to unlock the final fragment</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-amber-900/30 backdrop-blur-md bg-black/40 py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-200/70 text-sm font-serif">
            © {new Date().getFullYear()} Ancient Cryptic Scroll | Powered by the mystical forces of Solana
          </p>
        </div>
      </footer>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-amber-100 border-2 border-amber-900">
          <DialogHeader>
            <DialogTitle className="text-amber-900 font-serif">Report Entry</DialogTitle>
            <DialogDescription className="text-amber-800 font-serif">
              Explain why this entry violates the sacred scroll's guidelines
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Provide details about why this entry should be removed..."
              className="bg-amber-50 border-amber-900/50 text-amber-900 font-serif"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
                className="border-amber-900 text-amber-900"
              >
                Cancel
              </Button>
              <Button onClick={submitReport} className="bg-amber-900 text-amber-100">
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="bg-amber-100 border-2 border-amber-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-amber-900 font-serif text-xl">Welcome to the Ancient Scroll</DialogTitle>
            <DialogDescription className="text-amber-800 font-serif">
              Your guide to interacting with the sacred text
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-amber-900 font-serif">
            <h4 className="font-bold">How to Participate:</h4>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="bg-amber-800 rounded-full p-1 text-amber-100 mt-0.5">
                  <span className="text-xs">1</span>
                </div>
                <p>
                  <strong>Add to the Scroll</strong> - Contribute your wisdom to the ancient text by writing entries in
                  the scroll tab.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-amber-800 rounded-full p-1 text-amber-100 mt-0.5">
                  <span className="text-xs">2</span>
                </div>
                <p>
                  <strong>Solve Riddles</strong> - Visit the Ancient Riddles tab to solve puzzles and unlock prophecy
                  fragments.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-amber-800 rounded-full p-1 text-amber-100 mt-0.5">
                  <span className="text-xs">3</span>
                </div>
                <p>
                  <strong>Track Prophecies</strong> - View your unlocked prophecy fragments in the Prophecy tab.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-amber-800 rounded-full p-1 text-amber-100 mt-0.5">
                  <span className="text-xs">4</span>
                </div>
                <p>
                  <strong>Complete Quests</strong> - Check your available quests to earn XP and level up.
                </p>
              </div>
            </div>

            <h4 className="font-bold mt-4">Rewards:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Gain XP and level up by participating</li>
              <li>Earn reputation by contributing quality entries</li>
              <li>Unlock hidden prophecy fragments</li>
              <li>Achieve legendary status among the scroll keepers</li>
            </ul>

            <div className="bg-amber-200/50 p-3 rounded-md mt-4">
              <p className="text-sm italic">
                "The scroll rewards those who contribute with wisdom and respect. May your journey through the ancient
                text be enlightening."
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowHelpDialog(false)} className="bg-amber-900 text-amber-100">
              Begin My Journey
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quests Dialog */}
      <Dialog open={showQuestDialog} onOpenChange={setShowQuestDialog}>
        <DialogContent className="bg-amber-100 border-2 border-amber-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-amber-900 font-serif text-xl">Sacred Quests</DialogTitle>
            <DialogDescription className="text-amber-800 font-serif">
              Complete these tasks to earn rewards and advance your journey
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {availableQuests.map((quest) => (
              <Card
                key={quest.id}
                className={`bg-amber-50 border ${quest.completed ? "border-green-600" : "border-amber-900/50"}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-amber-900 font-serif text-lg">{quest.title}</CardTitle>
                    {quest.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="bg-amber-900/20 text-amber-800 px-2 py-0.5 rounded-full text-xs">
                        +{quest.xp} XP
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-amber-800 font-serif">{quest.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  {quest.completed ? (
                    <p className="text-green-700 text-sm font-serif">Completed</p>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-amber-900 border-amber-900/50 hover:bg-amber-900/10 bg-amber-100"
                      onClick={() => {
                        switch (quest.id) {
                          case 1:
                            setActiveTab("scroll")
                            break
                          case 2:
                            setActiveTab("riddles")
                            break
                          case 3:
                            setActiveTab("scroll")
                            break
                          case 4:
                            setActiveTab("prophecy")
                            break
                        }
                        setShowQuestDialog(false)
                      }}
                    >
                      Start Quest
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setShowQuestDialog(false)}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
