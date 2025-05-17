"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LogOut } from "lucide-react"
import InteractiveCanvas from "@/components/interactive-canvas"
import DegenChat from "@/components/degen-chat"
import TokenInfo from "@/components/token-info"

interface DegenZoneProps {
  contractAddress: string
}

export default function DegenZone({ contractAddress }: DegenZoneProps) {
  const [activeTab, setActiveTab] = useState("canvas")
  const [tokenName, setTokenName] = useState("")
  const { toast } = useToast()

  // Generate a random token name based on the contract address
  useEffect(() => {
    const adjectives = ["Smoking", "Flying", "Devilish", "Cosmic", "Laser-Eyed", "Diamond", "Galactic"]
    const animals = ["Shark", "Whale", "Crab", "Cat", "Lizard", "Ape", "Frog"]
    const accessories = [
      "on a Bicycle",
      "with a Cane",
      "in a Tuxedo",
      "riding a Lizard",
      "with Sunglasses",
      "on the Moon",
    ]

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)]
    const randomAccessory = accessories[Math.floor(Math.random() * accessories.length)]

    setTokenName(`${randomAdjective} ${randomAnimal} ${randomAccessory}`)
  }, [contractAddress])

  const handleDisconnect = () => {
    // Reload the page to disconnect
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[url('/images/degen-bg.png')] bg-cover bg-center text-white">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-900/50 backdrop-blur-md bg-black/40">
          <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center">
              <div className="w-12 h-12 relative mr-3">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full animate-pulse"></div>
                <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center text-white font-bold">
                  $D
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                  DEGEN ZONE
                </h1>
                <p className="text-xs text-cyan-400">
                  Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                </p>
              </div>
            </motion.div>

            <div className="flex items-center mt-2 sm:mt-0">
              <div className="mr-4 hidden sm:block">
                <div className="px-3 py-1 bg-green-900/30 border border-green-500 rounded-full text-xs text-green-400">
                  Connected
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="border-red-500 text-red-400 hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 text-center"
          >
            <h2 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
              ${tokenName.toUpperCase().replace(/\s+/g, "")}
            </h2>
            <p className="text-lg text-cyan-300">Welcome to the interactive degen experience</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs defaultValue="canvas" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="canvas" className="text-lg py-3">
                  Canvas
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-lg py-3">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="token" className="text-lg py-3">
                  Token Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="canvas" className="mt-0">
                <InteractiveCanvas tokenName={tokenName} />
              </TabsContent>

              <TabsContent value="chat" className="mt-0">
                <DegenChat tokenName={tokenName} contractAddress={contractAddress} />
              </TabsContent>

              <TabsContent value="token" className="mt-0">
                <TokenInfo tokenName={tokenName} contractAddress={contractAddress} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-purple-900/50 backdrop-blur-md bg-black/40 py-6 mt-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Degen Zone | Powered by Solana</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
