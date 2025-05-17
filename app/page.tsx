"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import AncientScroll from "@/components/ancient-scroll"
import WalletContextProvider from "@/components/wallet-provider"
import { motion } from "framer-motion"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function Home() {
  return (
    <WalletContextProvider>
      <HomeContent />
    </WalletContextProvider>
  )
}

function HomeContent() {
  const [contractAddress, setContractAddress] = useState("")
  const [isAddressVerified, setIsAddressVerified] = useState(false)
  const [isTransactionSigned, setIsTransactionSigned] = useState(false)
  const [tokenName, setTokenName] = useState("Ancient Cryptic Scroll")
  const { toast } = useToast()
  const wallet = useWallet()

  // Set the token name
  useEffect(() => {
    setTokenName("Ancient Cryptic Scroll")
  }, [])

  const verifyContractAddress = () => {
    if (!contractAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter the sacred contract address",
        variant: "destructive",
      })
      return
    }

    // Only accept the specific token address - make sure it's an exact match
    if (contractAddress.trim() !== "0x0000000000000000pump") {
      toast({
        title: "Unknown Scroll",
        description: "This address is not recognized by the ancient ones. Seek the true scroll address.",
        variant: "destructive",
      })
      return
    }

    setIsAddressVerified(true)
    toast({
      title: "Scroll Address Verified",
      description: "The ancient ones have recognized your scroll. Connect your wallet to proceed.",
    })
  }

  const signMessage = async () => {
    if (!wallet.publicKey || !wallet.signMessage) {
      toast({
        title: "Wallet Error",
        description: "Your mystical pouch doesn't support message signing",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a message to sign
      const message = new TextEncoder().encode(
        `I pledge my allegiance to the Ancient Cryptic Scroll at address ${contractAddress}`,
      )

      // Sign the message
      await wallet.signMessage(message)

      setIsTransactionSigned(true)
      toast({
        title: "Oath Sworn",
        description: "You have been granted access to the ancient knowledge!",
      })
    } catch (error) {
      console.error("Error signing message:", error)
      toast({
        title: "Oath Failed",
        description: "The ancient ones rejected your pledge. Try again.",
        variant: "destructive",
      })
    }
  }

  // Show the ancient scroll interface if wallet is connected and transaction is signed
  if (wallet.connected && isTransactionSigned) {
    return <AncientScroll tokenName={tokenName} contractAddress={contractAddress} wallet={wallet} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-950 to-black text-amber-100">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 max-w-3xl"
        >
          <div className="mb-8 flex justify-center">
            <div className="w-64 h-64 relative">
              <div className="absolute inset-0 bg-amber-600/20 rounded-full animate-pulse"></div>
              <Image
                src="/ancient-mystical-scroll.png"
                alt="Ancient Cryptic Scroll"
                width={300}
                height={300}
                className="animate-pulse-slow"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300">
            Ancient Cryptic Scroll
          </h1>
          <p className="text-xl text-amber-200 max-w-2xl mx-auto font-serif">
            Enter the sacred contract address and connect your mystical pouch to unlock the ancient wisdom
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-gradient-to-b from-amber-100 to-amber-200 border-4 border-amber-900/70 rounded-lg p-8 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-amber-900">Enter The Sacred Address</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-amber-900 mb-2 text-sm font-medium">Scroll Contract Address</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      className="bg-amber-100/90 border-amber-900/50 text-amber-900 placeholder:text-amber-700/50 font-mono"
                      placeholder="Enter the sacred contract address..."
                      disabled={isAddressVerified}
                    />
                    {!isAddressVerified && (
                      <Button
                        onClick={verifyContractAddress}
                        className="bg-amber-900 hover:bg-amber-800 text-amber-100"
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg text-amber-900 mb-4">
                    {isAddressVerified && !wallet.connected && <span>Connect your wallet to proceed.</span>}
                    {wallet.connected && !isTransactionSigned && (
                      <span>Sign the message to unlock the ancient knowledge.</span>
                    )}
                  </p>

                  {isAddressVerified && !wallet.connected && (
                    <div className="flex justify-center">
                      <WalletMultiButton className="!bg-gradient-to-r from-amber-800 to-amber-600 hover:from-amber-700 hover:to-amber-500 !rounded-md !h-12 !text-amber-100" />
                    </div>
                  )}
                </div>

                {wallet.connected && isAddressVerified && !isTransactionSigned && (
                  <div className="flex justify-center">
                    <Button onClick={signMessage} className="bg-amber-900 hover:bg-amber-800 text-amber-100">
                      Sign Message
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
