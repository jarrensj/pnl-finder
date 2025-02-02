'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function PnLLinkGenerator() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [queryHistory, setQueryHistory] = useState<{ tokenAddress: string, walletAddress: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTokenAddress = localStorage.getItem('tokenAddress') || ''
      const storedWalletAddress = localStorage.getItem('walletAddress') || ''
      const storedHistory = JSON.parse(localStorage.getItem('queryHistory') || '[]')
      setTokenAddress(storedTokenAddress)
      setWalletAddress(storedWalletAddress)
      setQueryHistory(storedHistory)
    }
  }, [])

  const updateQueryHistory = (newQuery: { tokenAddress: string, walletAddress: string }) => {
    const updatedHistory = [newQuery, ...queryHistory].slice(0, 10)
    setQueryHistory(updatedHistory)
    localStorage.setItem('queryHistory', JSON.stringify(updatedHistory))
  }

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
    updateQueryHistory({ tokenAddress, walletAddress })
  }

  const populateForm = (query: { tokenAddress: string, walletAddress: string }) => {
    setTokenAddress(query.tokenAddress)
    setWalletAddress(query.walletAddress)
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

  const removeQueryFromHistory = (index: number) => {
    const updatedHistory = queryHistory.filter((_, i) => i !== index)
    setQueryHistory(updatedHistory)
    localStorage.setItem('queryHistory', JSON.stringify(updatedHistory))
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
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Generated Link:</p>
            <div className="text-xs break-all bg-muted p-2 rounded hover:bg-muted/80 transition-colors">
              <AnimatePresence mode="wait">
                <motion.span
                  key={generatedLink}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={generatedLink} target="_blank" rel="noopener noreferrer">
                    {generatedLink}
                  </Link>
                </motion.span>
              </AnimatePresence>
            </div>
            <Button onClick={copyToClipboard} variant="outline" className="w-full">Copy to Clipboard</Button>
          </CardFooter>
        )}
      </Card>
      <div className="mt-4">
        <h2 className="text-lg font-medium mb-2">Query History</h2>
        <ul className="space-y-2">
          {queryHistory.map((query, index) => (
            <li
              key={index}
              className="bg-gray-100 p-3 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition-colors duration-200 relative"
              onClick={() => populateForm(query)}
            >
              <Card className="p-2">
                <div className="font-semibold">token: {query.tokenAddress}</div>
                <div className="text-sm text-gray-600">
                  wallet: {query.walletAddress.slice(0, 4)}...{query.walletAddress.slice(-4)}
                </div>
              </Card>
              <button
                className="absolute top-0 right-0 mt-1 mr-1 text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation()
                  removeQueryFromHistory(index)
                }}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Toaster />
    </div>
  )
}