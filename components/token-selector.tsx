"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, AlertCircle, Loader2, Check, X } from "lucide-react"
import Image from "next/image"
import tokenList from "@/data/tokens.json"
import networkConfig from "@/data/network.json"
import { useWeb3 } from "@/context/web3-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ethers } from "ethers"
import ERC20_ABI from "@/data/abis/erc20.json"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Token {
  address: string
  name: string
  symbol: string
  logoURI?: string
  decimals: number
  isNative?: boolean
  isCustom?: boolean
  chainId?: number
}

interface TokenBalance {
  balance: string
  isLoading: boolean
}

interface TokenSelectorProps {
  onSelect: (token: Token) => void
  selectedToken?: Token | null
  otherToken?: Token | null
  showBalance?: boolean
}

export default function TokenSelector({ onSelect, selectedToken, otherToken, showBalance = true }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoadingCustomToken, setIsLoadingCustomToken] = useState(false)
  const [customToken, setCustomToken] = useState<Token | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { isConnected, provider, signer, account, currentNetwork } = useWeb3()
  const [tokenBalances, setTokenBalances] = useState<Record<string, TokenBalance>>({})

  useEffect(() => {
    if (!currentNetwork) return
    const allTokens = [
      {
        address: "ETH",
        name: currentNetwork.nativeCurrency.name,
        symbol: currentNetwork.nativeCurrency.symbol,
        decimals: currentNetwork.nativeCurrency.decimals,
        logoURI: "https://token-icons.s3.amazonaws.com/eth.png",
        isNative: true,
        chainId: currentNetwork.chainId,
      },
      ...tokenList.tokens.filter(token => token.chainId === currentNetwork.chainId),
    ]
    setTokens(allTokens)
  }, [currentNetwork])

  useEffect(() => {
    if (!isConnected || !provider || !account || !tokens.length || !currentNetwork?.contracts?.WETH) {
      return
    }
    const fetchAllBalances = async () => {
      const balances: Record<string, TokenBalance> = {}
      tokens.forEach((token) => {
        balances[token.address] = { balance: "0", isLoading: true }
      })
      setTokenBalances(balances)
      for (const token of tokens) {
        try {
          let rawBalance: ethers.BigNumberish = "0"
          if (token.isNative) {
            rawBalance = await provider.getBalance(account)
          } else {
            const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider)
            rawBalance = await tokenContract.balanceOf(account)
          }
          const formatted = ethers.formatUnits(rawBalance, token.decimals)
          setTokenBalances((prev) => ({
            ...prev,
            [token.address]: { balance: formatted, isLoading: false },
          }))
        } catch (error) {
          console.error(`Error fetching balance for token ${token.symbol} on chain ${currentNetwork?.chainId}:`, error)
          setTokenBalances((prev) => ({
            ...prev,
            [token.address]: { balance: "0", isLoading: false },
          }))
        }
      }
    }
    fetchAllBalances()
    const intervalId = setInterval(fetchAllBalances, 30000)
    return () => clearInterval(intervalId)
  }, [isConnected, provider, account, tokens, currentNetwork])

  const isValidAddress = (address: string): boolean => {
    try {
      if (typeof address !== "string" || address.length !== 42) {
        return false
      }
      if (!address.startsWith("0x")) {
        return false
      }
      const hexRegex = /^0x[0-9a-fA-F]{40}$/
      return hexRegex.test(address)
    } catch (error) {
      console.error("Error validating address:", error)
      return false
    }
  }

  const fetchTokenInfo = async (address: string) => {
    setIsLoadingCustomToken(true)
    setError(null)
    if (!provider && !window.ethereum) {
       setError("No web3 provider available.")
       setIsLoadingCustomToken(false)
       return null
    }
    try {
      console.log("Fetching token info for address:", address)
      let tokenContract
      if (signer) {
        tokenContract = new ethers.Contract(address, ERC20_ABI, signer)
      } else if (provider) {
        tokenContract = new ethers.Contract(address, ERC20_ABI, provider)
      } else if (typeof window !== "undefined" && window.ethereum) {
        const tempProvider = new ethers.BrowserProvider(window.ethereum)
        tokenContract = new ethers.Contract(address, ERC20_ABI, tempProvider)
      } else {
         throw new Error("No provider available")
      }
      const name = await tokenContract.name()
      const symbol = await tokenContract.symbol()
      const decimals = await tokenContract.decimals()
      console.log("Token info fetched:", { name, symbol, decimals })
      const tokenInfo = {
        address,
        name,
        symbol,
        decimals: Number(decimals),
        isCustom: true,
        chainId: currentNetwork?.chainId,
      }
      setCustomToken(tokenInfo)
      if (isConnected && provider && account) {
        try {
          const rawBalance = await tokenContract.balanceOf(account)
          const formatted = ethers.formatUnits(rawBalance, decimals)
          setTokenBalances((prev) => ({
            ...prev,
            [address]: { balance: formatted, isLoading: false },
          }))
        } catch (error) {
          console.error(`Error fetching custom token balance for ${address}:`, error)
          setTokenBalances((prev) => ({
            ...prev,
            [address]: { balance: "0", isLoading: false },
          }))
        }
      }
      return tokenInfo
    } catch (error) {
      console.error("Error fetching token info:", error)
      setError("Invalid token address or not an ERC20 token on the current network.")
      setCustomToken(null)
      return null
    } finally {
      setIsLoadingCustomToken(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value !== searchQuery) {
      setError(null)
      if (!isValidAddress(value)) {
        setCustomToken(null)
      }
    }
    if (isValidAddress(value)) {
      console.log("Valid address detected:", value)
      fetchTokenInfo(value)
    }
  }

  const filteredTokens = tokens.filter((token) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = (
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      (!token.isNative && token.address.toLowerCase().includes(query))
    )
    const matchesNetwork = token.chainId === currentNetwork?.chainId || (token.isCustom && !token.chainId)
    return matchesSearch && matchesNetwork
  })

  const displayTokens = customToken && (customToken.chainId === currentNetwork?.chainId || !customToken.chainId)
    ? [customToken, ...filteredTokens.filter((t) => t.address.toLowerCase() !== customToken.address.toLowerCase())]
    : filteredTokens

  displayTokens.sort((a, b) => {
    if (a.isNative) return -1
    if (b.isNative) return 1
    return a.symbol.localeCompare(b.symbol)
  })

  const selectedTokenBalance = selectedToken ? tokenBalances[selectedToken.address]?.balance : "0"
  const isSelectedTokenBalanceLoading = selectedToken ? tokenBalances[selectedToken.address]?.isLoading : false

  const handleSelect = (token: Token) => {
    onSelect(token)
    setIsOpen(false)
    setSearchQuery("")
    setCustomToken(null)
    setError(null)
  }

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string) => {
    if (!balance || balance === "0") return "0"
    const num = Number(balance);
    // If balance is less than 0.0001, show it in scientific notation
    if (num < 0.0001 && num > 0) {
      return num.toExponential(2);
    }
    // Truncate to 4 significant digits for large numbers
    return num.toLocaleString(undefined, { maximumSignificantDigits: 4 });
  }

  const formatBalanceUSD = (balance: string) => {
    if (!balance || balance === "0") return "$0.00"
    const num = Number(balance);
    if (num < 0.01) return "<$0.01"
    return `$${num.toFixed(2)}`
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="modern-token-selector-btn"
      >
        {selectedToken ? (
          <div className="token-selector-content">
            {selectedToken.logoURI ? (
              <div className="token-logo">
                <Image
                  src={selectedToken.logoURI}
                  alt={selectedToken.symbol}
                  width={24}
                  height={24}
                  className="token-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
              </div>
            ) : (
              <div className="token-logo-fallback">
                {selectedToken.symbol.charAt(0)}
              </div>
            )}
            <span className="token-symbol">{selectedToken.symbol}</span>
          </div>
        ) : (
          "Select Token"
        )}
        <ChevronDown className="selector-arrow" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="modern-token-dialog" hideCloseButton={true}>
          {/* Accessible Dialog Title - hidden visually but available for screen readers */}
          <DialogTitle className="sr-only">Select Token Dialog</DialogTitle>
          
          {/* Custom Header */}
          <div className="dialog-header">
            <h2 className="dialog-title">Select Token</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="close-btn"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search name or paste address"
                className="search-input"
                value={searchQuery}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoadingCustomToken && (
            <div className="loading-state">
              <Loader2 className="loading-icon" />
              <span>Fetching token info...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Network Warning */}
          {isConnected && !currentNetwork && !isLoadingCustomToken && !error && searchQuery && isValidAddress(searchQuery) && (
            <div className="warning-state">
              <AlertCircle className="warning-icon" />
              <span>Connect to a supported network to add this token.</span>
            </div>
          )}

          {/* Tokens Section */}
          <div className="tokens-section">
            {/* Popular Tokens Header */}
            {!searchQuery && (
              <div className="section-header">
                <h3 className="section-title">Your Tokens</h3>
              </div>
            )}

            {/* Token List */}
            <div className="token-list">
              {displayTokens.length === 0 && !isLoadingCustomToken && !error ? (
                <div className="empty-state">
                  <p>No tokens found.</p>
                </div>
              ) : (
                displayTokens.map((token) => (
                  <div
                    key={token.address}
                    className={`token-item ${
                      selectedToken?.address === token.address ? "selected" : ""
                    } ${otherToken?.address === token.address ? "disabled" : ""}`}
                    onClick={() => otherToken?.address !== token.address && handleSelect(token)}
                    role="button"
                    aria-disabled={otherToken?.address === token.address}
                  >
                    <div className="token-info">
                      {token.logoURI ? (
                        <div className="token-item-logo">
                          <Image
                            src={token.logoURI}
                            alt={token.symbol}
                            width={40}
                            height={40}
                            className="token-item-img"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                          {/* Network Badge */}
                          <div className="network-badge">
                            <div className="network-icon" />
                          </div>
                        </div>
                      ) : (
                        <div className="token-item-logo-fallback">
                          {token.symbol.charAt(0)}
                        </div>
                      )}
                      <div className="token-details">
                        <div className="token-name-row">
                          <h4 className="token-name">{token.symbol}</h4>
                          {token.isCustom && (
                            <span className="custom-badge">Custom</span>
                          )}
                        </div>
                        <p className="token-full-name">{token.name}</p>
                        {!token.isNative && (
                          <p className="token-address">{truncateAddress(token.address)}</p>
                        )}
                      </div>
                    </div>
                    
                    {isConnected && showBalance && (
                      <div className="token-balance">
                        {tokenBalances[token.address]?.isLoading ? (
                          <div className="balance-loading">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        ) : (
                          <div className="balance-info">
                            <span className="balance-amount">
                              {formatBalance(tokenBalances[token.address]?.balance || "0")}
                            </span>
                            <span className="balance-usd">
                              {formatBalanceUSD("0")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}