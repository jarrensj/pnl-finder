'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

export default function PnLLinkGenerator() {
  const [tokenAddress, setTokenAddress] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tokenAddress') || ''
    }
    return ''
  })
  const [walletAddress, setWalletAddress] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('walletAddress') || ''
    }
    return ''
  })
  const [generatedLink, setGeneratedLink] = useState('')
  const { toast } = useToast()

  const handleTokenAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTokenAddress(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tokenAddress', value)
    }
  }

  const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWalletAddress(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletAddress', value)
    }
  }

  const generateLink = () => {
    if (!tokenAddress || !walletAddress) {
      toast({
        title: "Error",
        description: "Both token address and wallet address are required.",
        variant: "destructive",
      })
      return
    }

    const baseUrl = 'https://dexscreener.com/solana'
    const link = `${baseUrl}/${tokenAddress}?maker=${walletAddress}`
    setGeneratedLink(link)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink).then(() => {
      toast({
        title: "Copied!",
        description: "Link copied to clipboard.",
      })
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      })
    })
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>DEX Screener PnL Link Generator</CardTitle>
          <CardDescription>Generate a link to view PnL for a specific token and wallet on DexScreener</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenAddress">Token Address</Label>
            <Input
              id="tokenAddress"
              placeholder="Enter token address"
              value={tokenAddress}
              onChange={handleTokenAddressChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              placeholder="Enter wallet address"
              value={walletAddress}
              onChange={handleWalletAddressChange}
            />
          </div>
          <Button onClick={generateLink} className="w-full">Generate Link</Button>
        </CardContent>
        {generatedLink && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
          >
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm font-medium">Generated Link:</p>
              <Link 
                href={generatedLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs break-all bg-muted p-2 rounded hover:bg-muted/80 transition-colors"
              >
                {generatedLink}
              </Link>
              <Button onClick={copyToClipboard} variant="outline" className="w-full">Copy to Clipboard</Button>
            </CardFooter>
          </motion.div>
        )}
      </Card>
      <Toaster />
    </div>
  )
}