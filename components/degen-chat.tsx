"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  isBot: boolean
  avatar: string
}

interface DegenChatProps {
  tokenName: string
  contractAddress: string
}

export default function DegenChat({ tokenName, contractAddress }: DegenChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Generate a random username
  const username = useRef(`degen_${Math.random().toString(36).substring(2, 5)}`)

  // Initial bot message
  useEffect(() => {
    const initialMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: "TokenBot",
      content: `Welcome to the ${tokenName} chat! Ask me anything about this token or just chat with other degens.`,
      timestamp: new Date(),
      isBot: true,
      avatar: "/images/token-logo.png",
    }

    setMessages([initialMessage])
  }, [tokenName])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: username.current,
      content: newMessage,
      timestamp: new Date(),
      isBot: false,
      avatar: `/placeholder.svg?height=40&width=40&query=avatar ${username.current}`,
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")

    // Simulate bot typing
    setIsTyping(true)

    // Generate bot response
    setTimeout(
      () => {
        const botResponse = generateBotResponse(newMessage, tokenName, contractAddress)

        const botMessage: Message = {
          id: `msg_${Date.now()}`,
          sender: "TokenBot",
          content: botResponse,
          timestamp: new Date(),
          isBot: true,
          avatar: "/images/token-logo.png",
        }

        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)

        // Simulate other users
        if (Math.random() > 0.7) {
          simulateOtherUserMessage()
        }
      },
      1000 + Math.random() * 2000,
    )
  }

  const simulateOtherUserMessage = () => {
    setTimeout(
      () => {
        const randomUsers = ["moon_boy", "diamond_hands", "ape_in", "fomo_king", "degen_queen"]
        const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)]

        const randomMessages = [
          "When moon? 🚀",
          "Bullish AF on this token!",
          "Just aped in with my life savings 💎🙌",
          "This is going to 100x easy",
          "Is this a rug? Asking for a friend",
          "LFG!!! 🔥🔥🔥",
          `${tokenName} to the moon!`,
          "Devs are based, I'm all in",
          "Bought a bag, let's ride this rocket",
          "Chart looking bullish",
        ]

        const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)]

        const otherUserMessage: Message = {
          id: `msg_${Date.now()}`,
          sender: randomUser,
          content: randomMessage,
          timestamp: new Date(),
          isBot: false,
          avatar: `/placeholder.svg?height=40&width=40&query=avatar ${randomUser}`,
        }

        setMessages((prev) => [...prev, otherUserMessage])

        toast({
          title: `${randomUser} joined the chat`,
          description: "More degens are joining the conversation!",
        })
      },
      3000 + Math.random() * 5000,
    )
  }

  const generateBotResponse = (message: string, tokenName: string, contractAddress: string): string => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("wen moon") || lowerMessage.includes("when moon")) {
      return `${tokenName} is scheduled to moon approximately when Jupiter aligns with Mars and Elon tweets about us. Not financial advice! 🚀🌕`
    }

    if (lowerMessage.includes("price") || lowerMessage.includes("worth")) {
      return `Current price: 0.0000${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 9) + 1} SOL. But we're just getting started! 📈`
    }

    if (lowerMessage.includes("buy") || lowerMessage.includes("ape")) {
      return `To buy ${tokenName}, connect your wallet to Jupiter or Raydium and swap SOL for our token. Contract address: ${contractAddress}. DYOR and only invest what you can afford to lose!`
    }

    if (lowerMessage.includes("team") || lowerMessage.includes("dev")) {
      return `The ${tokenName} team consists of based anons with 69 years of combined experience in creating legendary memecoins. Trust us bro.`
    }

    if (lowerMessage.includes("roadmap") || lowerMessage.includes("plan")) {
      return `Roadmap:\n1. Launch token ✅\n2. Moon 🔄\n3. Mars 🔄\n4. Jupiter 🔄\n5. ??? 🔄\n6. Profit 🔄`
    }

    if (lowerMessage.includes("rug") || lowerMessage.includes("scam")) {
      return `${tokenName} is 100% not a rug. Trust me bro. The LP is locked for 420 years and the contract is renounced. We're here for the long haul! 💎🙌`
    }

    const randomResponses = [
      `That's a great question about ${tokenName}! Our community-driven approach means we're all going to make it.`,
      `${tokenName} is revolutionizing the meme space with cutting-edge technology called "making people laugh."`,
      `As the official ${tokenName} bot, I can confirm we're the most outlandish token on Solana. Not financial advice though!`,
      `${tokenName} holders are the smartest, most attractive people in crypto. That's just science.`,
      `I'm bullish on ${tokenName} and I'm just a bot. Imagine how bullish humans must be!`,
    ]

    return randomResponses[Math.floor(Math.random() * randomResponses.length)]
  }

  return (
    <Card className="bg-black/40 border-2 border-gradient-to-r from-cyan-500 to-blue-500 overflow-hidden shadow-[0_0_30px_rgba(56,189,248,0.2)] h-[600px] flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
            Degen Chat
          </h3>
          <div className="flex items-center gap-2 bg-cyan-900/30 px-3 py-1 rounded-full">
            <Bot size={16} className="text-cyan-400" />
            <span className="text-cyan-400 text-sm">TokenBot active</span>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4 mb-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 mb-4 ${message.isBot ? "" : "flex-row-reverse"}`}
              >
                <Avatar
                  className={`w-8 h-8 ${message.isBot ? "border-2 border-cyan-500" : "border-2 border-pink-500"}`}
                >
                  <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.sender} />
                  <AvatarFallback>{message.sender.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div
                  className={`max-w-[80%] ${message.isBot ? "bg-cyan-900/30 border-l-2 border-cyan-500" : "bg-pink-900/30 border-r-2 border-pink-500"} rounded-lg p-3`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-semibold text-sm ${message.isBot ? "text-cyan-400" : "text-pink-400"}`}>
                      {message.sender}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-gray-200 whitespace-pre-line">{message.content}</p>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mb-4">
                <Avatar className="w-8 h-8 border-2 border-cyan-500">
                  <AvatarImage src="/images/token-logo.png" alt="TokenBot" />
                  <AvatarFallback>TB</AvatarFallback>
                </Avatar>

                <div className="bg-cyan-900/30 border-l-2 border-cyan-500 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-cyan-400">TokenBot</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </AnimatePresence>
        </ScrollArea>

        <div className="mt-auto">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about the token or chat with degens..."
              className="bg-black/50 border-gray-700 text-white"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Chatting as {username.current} • Ask TokenBot anything about {tokenName}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
