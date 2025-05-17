"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Copy, ExternalLink, Rocket, Lock, Users, Coins } from "lucide-react"

interface TokenInfoProps {
  tokenName: string
  contractAddress: string
}

export default function TokenInfo({ tokenName, contractAddress }: TokenInfoProps) {
  const [activeTab, setActiveTab] = useState("tokenomics")
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Contract address copied to clipboard",
    })
  }

  // Generate random token data based on contract address
  const totalSupply = 1000000000 // 1 billion
  const circulatingSupply = Math.floor(totalSupply * 0.7) // 70% circulating
  const burned = Math.floor(totalSupply * 0.1) // 10% burned
  const locked = totalSupply - circulatingSupply - burned // 20% locked

  // Distribution data
  const distribution = [
    { name: "Community", percentage: 40, color: "bg-pink-500" },
    { name: "Liquidity", percentage: 30, color: "bg-purple-500" },
    { name: "Team", percentage: 15, color: "bg-blue-500" },
    { name: "Marketing", percentage: 10, color: "bg-cyan-500" },
    { name: "Reserves", percentage: 5, color: "bg-green-500" },
  ]

  // Generate random lore based on token name
  const generateLore = () => {
    const parts = tokenName.split(" ")
    const creature = parts[0]
    const animal = parts[1]
    const accessory = parts.slice(2).join(" ")

    return `
    In the distant corners of the Solana blockchain, a legend was born. The ${creature} ${animal} ${accessory} emerged from a chaotic fusion of memes and code.
    
    It is said that when the moon is full and the charts are green, the ${creature} ${animal} appears to those who truly believe, bringing untold riches to diamond-handed holders.
    
    The ancient blockchain prophecies foretold of a token so outlandish, so absurd, that it would transcend the boundaries of normal memecoins and ascend to legendary status.
    
    Those who mock the ${creature} ${animal} are doomed to watch from the sidelines as it moons beyond their wildest dreams. Those who embrace it join the ranks of the enlightened degens.
    
    The contract address ${contractAddress} is said to contain hidden powers, activated only when enough believers have joined the cause.
    `
  }

  const lore = generateLore()

  return (
    <Card className="bg-black/40 border-2 border-gradient-to-r from-green-500 to-emerald-500 overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.2)]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
            {tokenName.toUpperCase().replace(/\s+/g, "")}
          </h3>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-green-700 text-green-400 hover:bg-green-900/20 text-xs h-8"
              onClick={() => copyToClipboard(contractAddress)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy CA
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-green-700 text-green-400 hover:bg-green-900/20 text-xs h-8"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Explorer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-black/30 border border-green-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center text-green-400">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Supply</p>
                <p className="text-white font-bold">{totalSupply.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border border-green-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center text-green-400">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Circulating</p>
                <p className="text-white font-bold">{circulatingSupply.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border border-green-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center text-green-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Burned/Locked</p>
                <p className="text-white font-bold">{(burned + locked).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tokenomics" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
            <TabsTrigger value="lore">Token Lore</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="tokenomics" className="mt-0">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">Token Distribution</h4>
                <div className="space-y-4">
                  {distribution.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">{item.name}</span>
                        <span className="text-gray-300">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" indicatorClassName={item.color} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">Token Details</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-green-900/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Token Name</p>
                      <p className="text-white">{tokenName.toUpperCase().replace(/\s+/g, "")}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Blockchain</p>
                      <p className="text-white">Solana</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Launch Date</p>
                      <p className="text-white">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Token Type</p>
                      <p className="text-white">SPL</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 text-sm">Contract Address</p>
                      <p className="text-white text-sm font-mono break-all">{contractAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lore" className="mt-0">
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg p-6 border border-green-900/50">
              <h4 className="text-lg font-semibold text-green-400 mb-4">The Legend of {tokenName}</h4>

              <div className="relative">
                <div className="absolute -top-6 -left-6 w-12 h-12 text-green-500 opacity-30 text-4xl">"</div>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">{lore}</p>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 text-green-500 opacity-30 text-4xl rotate-180">
                  "
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-green-900/50">
                <h5 className="text-md font-semibold text-green-400 mb-2">Hidden Message</h5>
                <p className="text-gray-300">
                  Legend says that if you stare at the contract address long enough, you'll see a hidden message that
                  reveals the exact moment this token will moon.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="community" className="mt-0">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">Join the Community</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-black/30 border border-green-900 hover:bg-green-900/20 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Twitter</p>
                        <p className="text-gray-400 text-sm">Follow for updates</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/30 border border-green-900 hover:bg-green-900/20 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="4"></circle>
                          <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                          <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                          <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                          <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                          <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Telegram</p>
                        <p className="text-gray-400 text-sm">Join the community</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/30 border border-green-900 hover:bg-green-900/20 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="4"></circle>
                          <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                          <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                          <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                          <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                          <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Discord</p>
                        <p className="text-gray-400 text-sm">Chat with holders</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/30 border border-green-900 hover:bg-green-900/20 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center text-red-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Holders</p>
                        <p className="text-gray-400 text-sm">{Math.floor(Math.random() * 1000) + 500} holders</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">Upcoming Events</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-green-900/50">
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-gray-300">CoinMarketCap Listing</span>
                      <span className="text-green-400">Soon™</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-300">CoinGecko Listing</span>
                      <span className="text-green-400">Soon™</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-300">Major CEX Listing</span>
                      <span className="text-green-400">Soon™</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-300">Moon Mission</span>
                      <span className="text-green-400">Imminent</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
