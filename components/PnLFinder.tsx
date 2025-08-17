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
import { X, Plus, Edit2, Trash2 } from "lucide-react"

interface SavedWallet {
  id: string
  nickname: string
  address: string
}

export default function PnLLinkGenerator() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [queryHistory, setQueryHistory] = useState<{ tokenAddress: string, walletAddress: string }[]>([])
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([])
  const [showAddWallet, setShowAddWallet] = useState(false)
  const [newWalletNickname, setNewWalletNickname] = useState('')
  const [newWalletAddress, setNewWalletAddress] = useState('')
  const [editingWallet, setEditingWallet] = useState<string | null>(null)
  const { toast } = useToast()
  const [animateForm, setAnimateForm] = useState(false)
  const [animateWalletField, setAnimateWalletField] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTokenAddress = localStorage.getItem('tokenAddress') || ''
      const storedWalletAddress = localStorage.getItem('walletAddress') || ''
      const storedHistory = JSON.parse(localStorage.getItem('queryHistory') || '[]')
      const storedWallets = JSON.parse(localStorage.getItem('savedWallets') || '[]')
      setTokenAddress(storedTokenAddress)
      setWalletAddress(storedWalletAddress)
      setQueryHistory(storedHistory)
      setSavedWallets(storedWallets)
    }
  }, [])

  const updateQueryHistory = (newQuery: { tokenAddress: string, walletAddress: string }) => {
    const existingIndex = queryHistory.findIndex(
      query => query.tokenAddress === newQuery.tokenAddress && query.walletAddress === newQuery.walletAddress
    );

    let updatedHistory;
    if (existingIndex !== -1) {
      // if the query already exists, remove it from its current position
      updatedHistory = [
        newQuery,
        ...queryHistory.slice(0, existingIndex),
        ...queryHistory.slice(existingIndex + 1)
      ];
    } else {
      // if the query is new, add it to the top
      updatedHistory = [newQuery, ...queryHistory];
    }

    // limit to 10
    updatedHistory = updatedHistory.slice(0, 10);

    setQueryHistory(updatedHistory);
    localStorage.setItem('queryHistory', JSON.stringify(updatedHistory));
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
    setAnimateForm(true)
    setTimeout(() => setAnimateForm(false), 300)
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

  const saveWallet = () => {
    if (!newWalletNickname.trim() || !newWalletAddress.trim()) {
      toast({
        title: "Error",
        description: "Both nickname and wallet address are required.",
        variant: "destructive",
      })
      return
    }

    const newWallet: SavedWallet = {
      id: Date.now().toString(),
      nickname: newWalletNickname.trim(),
      address: newWalletAddress.trim()
    }

    const updatedWallets = [...savedWallets, newWallet]
    setSavedWallets(updatedWallets)
    localStorage.setItem('savedWallets', JSON.stringify(updatedWallets))
    
    setNewWalletNickname('')
    setNewWalletAddress('')
    setShowAddWallet(false)
    
    toast({
      title: "Success",
      description: "Wallet saved successfully!",
    })
  }

  const deleteWallet = (id: string) => {
    const updatedWallets = savedWallets.filter(wallet => wallet.id !== id)
    setSavedWallets(updatedWallets)
    localStorage.setItem('savedWallets', JSON.stringify(updatedWallets))
    
    toast({
      title: "Success",
      description: "Wallet deleted successfully!",
    })
  }

  const updateWallet = (id: string, nickname: string, address: string) => {
    if (!nickname.trim() || !address.trim()) {
      toast({
        title: "Error",
        description: "Both nickname and wallet address are required.",
        variant: "destructive",
      })
      return
    }

    const updatedWallets = savedWallets.map(wallet => 
      wallet.id === id 
        ? { ...wallet, nickname: nickname.trim(), address: address.trim() }
        : wallet
    )
    setSavedWallets(updatedWallets)
    localStorage.setItem('savedWallets', JSON.stringify(updatedWallets))
    setEditingWallet(null)
    
    toast({
      title: "Success",
      description: "Wallet updated successfully!",
    })
  }

  const selectWallet = (wallet: SavedWallet) => {
    setWalletAddress(wallet.address)
    setAnimateWalletField(true)
    setTimeout(() => setAnimateWalletField(false), 300)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletAddress', wallet.address)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto mb-4">
        <CardHeader>
          <CardTitle>DEX Screener PnL Link Generator</CardTitle>
          <CardDescription>Generate a link to view PnL for a specific token and wallet on DexScreener</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            animate={animateForm ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="tokenAddress">Token Address</Label>
            <Input
              id="tokenAddress"
              placeholder="Enter token address"
              value={tokenAddress}
              onChange={handleTokenAddressChange}
            />
          </motion.div>
          <motion.div
            animate={animateWalletField ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNewWalletAddress(walletAddress)
                  setShowAddWallet(true)
                }}
                className="h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Save Wallet
              </Button>
            </div>
            <Input
              id="walletAddress"
              placeholder="Enter wallet address"
              value={walletAddress}
              onChange={handleWalletAddressChange}
            />
            {savedWallets.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Saved Wallets:</Label>
                <div className="flex flex-wrap gap-1">
                  {savedWallets.map((wallet) => (
                    <Button
                      key={wallet.id}
                      variant="outline"
                      size="sm"
                      onClick={() => selectWallet(wallet)}
                      className="h-7 text-xs"
                    >
                      {wallet.nickname}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
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

      {/* Add Wallet Modal */}
      <AnimatePresence>
        {showAddWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddWallet(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>Save Wallet</CardTitle>
                  <CardDescription>Add a nickname for easy wallet selection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="walletNickname">Wallet Nickname</Label>
                    <Input
                      id="walletNickname"
                      placeholder="e.g., Main Wallet"
                      value={newWalletNickname}
                      onChange={(e) => setNewWalletNickname(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newWalletAddress">Wallet Address</Label>
                    <Input
                      id="newWalletAddress"
                      placeholder="Enter wallet address"
                      value={newWalletAddress}
                      onChange={(e) => setNewWalletAddress(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddWallet(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveWallet}>Save Wallet</Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Query History</CardTitle>
          <CardDescription>Your recent queries</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {queryHistory.map((query, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="mb-2 cursor-pointer hover:bg-accent transition-colors duration-200"
                  onClick={() => populateForm(query)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">
                        Token: {query.tokenAddress.slice(0, 6)}...{query.tokenAddress.slice(-4)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Wallet: {query.walletAddress.slice(0, 6)}...{query.walletAddress.slice(-4)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeQueryFromHistory(index)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Saved Wallets Management */}
      {savedWallets.length > 0 && (
        <Card className="w-full max-w-md mx-auto mt-4">
          <CardHeader>
            <CardTitle>Saved Wallets</CardTitle>
            <CardDescription>Manage your saved wallet addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {savedWallets.map((wallet) => (
                <motion.div
                  key={wallet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="mb-2">
                    <CardContent className="p-4">
                      {editingWallet === wallet.id ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Wallet nickname"
                            defaultValue={wallet.nickname}
                            onBlur={(e) => {
                              const target = e.target as HTMLInputElement
                              if (target.value.trim()) {
                                const addressInput = target.parentElement?.querySelector('input:nth-child(2)') as HTMLInputElement
                                if (addressInput?.value.trim()) {
                                  updateWallet(wallet.id, target.value, addressInput.value)
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              const target = e.target as HTMLInputElement
                              if (e.key === 'Enter') {
                                const addressInput = target.parentElement?.querySelector('input:nth-child(2)') as HTMLInputElement
                                if (addressInput?.value.trim()) {
                                  updateWallet(wallet.id, target.value, addressInput.value)
                                }
                              }
                              if (e.key === 'Escape') {
                                setEditingWallet(null)
                              }
                            }}
                          />
                          <Input
                            placeholder="Wallet address"
                            defaultValue={wallet.address}
                            onBlur={(e) => {
                              const target = e.target as HTMLInputElement
                              if (target.value.trim()) {
                                const nicknameInput = target.parentElement?.querySelector('input:first-child') as HTMLInputElement
                                if (nicknameInput?.value.trim()) {
                                  updateWallet(wallet.id, nicknameInput.value, target.value)
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              const target = e.target as HTMLInputElement
                              if (e.key === 'Enter') {
                                const nicknameInput = target.parentElement?.querySelector('input:first-child') as HTMLInputElement
                                if (nicknameInput?.value.trim()) {
                                  updateWallet(wallet.id, nicknameInput.value, target.value)
                                }
                              }
                              if (e.key === 'Escape') {
                                setEditingWallet(null)
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => setEditingWallet(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="cursor-pointer flex-1" onClick={() => selectWallet(wallet)}>
                            <p className="font-medium text-sm">{wallet.nickname}</p>
                            <p className="text-sm text-muted-foreground">
                              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingWallet(wallet.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteWallet(wallet.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
      <Toaster />
    </div>
  )
}