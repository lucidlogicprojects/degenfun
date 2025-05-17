"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

interface TokenLoreProps {
  contractAddress: string
}

export default function TokenLore({ contractAddress }: TokenLoreProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealedText, setRevealedText] = useState("")

  const lorePages = [
    {
      title: "Origins",
      content: `In the depths of the Solana blockchain, a bizarre experiment went terribly wrong. A mad scientist was attempting to create the ultimate meme token when a power surge caused his laboratory to explode. From the digital ashes emerged $SHARKLIZARD - a smoking shark riding a lizard, the most outlandish token ever created.`,
    },
    {
      title: "Powers",
      content: `$SHARKLIZARD possesses the unique ability to swim through both water and land markets with equal ease. The smoke it exhales contains magical properties that can turn paper hands into diamond hands. Its lizard mount can run on walls of sell orders, defying the gravity of market dumps.`,
    },
    {
      title: "Prophecy",
      content: `The ancient blockchain scrolls foretold of a token that would unite all degens under one banner. The prophecy speaks of a time when the smoking shark shall ride its lizard to the moon, bringing untold riches to those who believed in its power. That time is now, and $SHARKLIZARD is the chosen one.`,
    },
    {
      title: "Secret",
      content: `The contract address ${contractAddress} contains a hidden message. When decoded properly, it reveals the coordinates to a digital treasure that only the most dedicated holders will discover. The journey begins with connecting your wallet and ends with riches beyond imagination.`,
    },
  ]

  useEffect(() => {
    if (isRevealing) {
      let currentText = ""
      const fullText = lorePages[currentPage].content
      let index = 0

      const interval = setInterval(() => {
        if (index < fullText.length) {
          currentText += fullText[index]
          setRevealedText(currentText)
          index++
        } else {
          clearInterval(interval)
          setIsRevealing(false)
        }
      }, 20)

      return () => clearInterval(interval)
    }
  }, [isRevealing, currentPage])

  const startReveal = () => {
    setIsRevealing(true)
    setRevealedText("")
  }

  useEffect(() => {
    startReveal()
  }, [currentPage])

  return (
    <Card className="bg-black/40 border-2 border-purple-500 h-full">
      <CardContent className="p-6">
        <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          The Legend of $SHARKLIZARD
        </h3>

        <Tabs defaultValue="lore" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lore">Sacred Lore</TabsTrigger>
            <TabsTrigger value="contract">Contract Secrets</TabsTrigger>
          </TabsList>

          <TabsContent value="lore" className="mt-4">
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-md p-4 min-h-[300px] flex flex-col">
              <div className="flex justify-between mb-4">
                <h4 className="text-xl font-semibold text-purple-300">{lorePages[currentPage].title}</h4>
                <div className="text-sm text-gray-400">
                  Page {currentPage + 1} of {lorePages.length}
                </div>
              </div>

              <div className="flex-1 mb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <p className="text-gray-200 leading-relaxed">
                      {isRevealing ? revealedText : lorePages[currentPage].content}
                      {isRevealing && <span className="animate-pulse">|</span>}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex justify-between mt-auto">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }}
                  disabled={currentPage === 0 || isRevealing}
                  className="border-cyan-700 text-cyan-400 hover:bg-cyan-900/20"
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(lorePages.length - 1, prev + 1))
                  }}
                  disabled={currentPage === lorePages.length - 1 || isRevealing}
                  className="border-cyan-700 text-cyan-400 hover:bg-cyan-900/20"
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contract" className="mt-4">
            <div className="bg-gradient-to-br from-blue-900/40 to-green-900/40 rounded-md p-4 min-h-[300px]">
              <h4 className="text-xl font-semibold text-cyan-300 mb-4">Contract Analysis</h4>

              <div className="bg-black/50 rounded-md p-3 font-mono text-sm text-green-400 mb-4 overflow-x-auto">
                <p>Contract: {contractAddress}</p>
                <p className="mt-2">Decoded Message:</p>
                <p className="mt-1 text-yellow-400">
                  "The one who holds the $SHARKLIZARD shall control the fate of all memes."
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-md font-semibold text-pink-400">Token Metrics:</h5>
                  <ul className="list-disc list-inside text-gray-300 mt-2">
                    <li>Total Supply: 420,069,000 $SHARKLIZARD</li>
                    <li>Burned: 69,000 $SHARKLIZARD</li>
                    <li>Circulating: 351,069,000 $SHARKLIZARD</li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-md font-semibold text-pink-400">Hidden Features:</h5>
                  <p className="text-gray-300 mt-2">
                    This contract contains a secret function that can only be activated when the moon is full and
                    Jupiter aligns with Mars. Or maybe when enough degens buy in. Who knows?
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
