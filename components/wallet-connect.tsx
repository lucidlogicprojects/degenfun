"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface WalletConnectProps {
  onWalletConnected: (connected: boolean) => void
  onTransactionSigned: () => void
  isConnected: boolean
}

export default function WalletConnect({ onWalletConnected, onTransactionSigned, isConnected }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const { toast } = useToast()

  const connectWallet = async () => {
    setIsConnecting(true)

    try {
      // Check if Phantom is installed
      const isPhantomInstalled = window.phantom?.solana?.isPhantom

      if (!isPhantomInstalled) {
        toast({
          title: "Phantom not installed",
          description: "Please install Phantom wallet to continue",
          variant: "destructive",
        })
        window.open("https://phantom.app/", "_blank")
        setIsConnecting(false)
        return
      }

      // Simulate connection
      await new Promise((resolve) => setTimeout(resolve, 1500))

      onWalletConnected(true)

      toast({
        title: "Wallet Connected",
        description: "Your Phantom wallet has been connected successfully!",
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const signTransaction = async () => {
    setIsSigning(true)

    try {
      // Simulate signing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      onTransactionSigned()

      toast({
        title: "Transaction Signed",
        description: "You've successfully signed the transaction!",
      })
    } catch (error) {
      console.error("Error signing transaction:", error)
      toast({
        title: "Signing Failed",
        description: "Failed to sign transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        Phantom Wallet
      </h3>

      {!isConnected ? (
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-6 text-lg"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Phantom Wallet"
          )}
        </Button>
      ) : (
        <div className="w-full space-y-4">
          <div className="bg-green-900/30 border border-green-500 rounded-md p-3 text-center">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Wallet Connected
          </div>

          <Button
            onClick={signTransaction}
            disabled={isSigning}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6 text-lg"
          >
            {isSigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing Transaction...
              </>
            ) : (
              "Sign Transaction"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
