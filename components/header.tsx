"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/context/web3-context"
import { AlertTriangle, ChevronDown, ExternalLink, LogOut, CheckCircle2, Wallet } from "lucide-react"
import networksConfig from "@/data/networks.json"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"

export default function Header() {
  const { isConnected, connect, disconnect, account, isCorrectNetwork, switchNetwork, chainId, currentNetwork, isConnecting } = useWeb3()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getExplorerUrl = () => {
    return currentNetwork?.explorerUrl ? `${currentNetwork.explorerUrl}/address/${account}` : "#"
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] w-full backdrop-blur-md supports-[backdrop-filter]:bg-background/90 border-b transition-all duration-200 ${
        isScrolled ? "shadow-lg bg-background/95" : "bg-background/80"
      }`}
    >
      <div className="container flex h-16 md:h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          {/* Network Selector - Always visible on desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2 h-9 px-3 text-sm rounded-lg hover:bg-accent"
              >
                {currentNetwork?.logoUrl && (
                  <img 
                    src={currentNetwork.logoUrl} 
                    alt={currentNetwork.name} 
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span className="truncate max-w-[100px]">{currentNetwork?.name || "Select Network"}</span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {!isConnected && (
                <>
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    Connect wallet to switch networks
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              {networksConfig.networks.map((network) => (
                <DropdownMenuItem
                  key={network.chainId}
                  onClick={() => isConnected ? switchNetwork(network.chainId) : null}
                  className={`flex items-center justify-between gap-2 py-2 ${
                    !isConnected ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  disabled={!isConnected}
                >
                  <div className="flex items-center gap-2">
                    {network.logoUrl && (
                      <img 
                        src={network.logoUrl} 
                        alt={network.name} 
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="truncate">{network.name}</span>
                  </div>
                  {isConnected && chainId === network.chainId && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wrong Network Warning */}
          {isConnected && !isCorrectNetwork && (
            <Button
              variant="destructive"
              onClick={() => switchNetwork()}
              size="sm"
              className="flex items-center gap-2 h-10 md:h-9 px-3 text-sm rounded-lg"
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="hidden md:inline">Switch Network</span>
              <span className="md:hidden">Switch</span>
            </Button>
          )}

          {/* Wallet Connection */}
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-primary/30 bg-primary/10 hover:bg-primary/20 h-10 md:h-9 px-3 text-sm rounded-lg min-w-0"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"></div>
                  <Wallet className="h-4 w-4 flex-shrink-0 sm:hidden" />
                  <span className="hidden sm:inline truncate max-w-[120px]">
                    {account ? formatAddress(account) : "Connected"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 md:w-56">
                {/* Account Info */}
                <div className="px-3 py-2 border-b">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {account ? formatAddress(account) : "No account"}
                  </div>
                </div>

                {/* Network Info */}
                <div className="px-3 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network</span>
                    <div className="flex items-center gap-2">
                      {currentNetwork?.logoUrl && (
                        <img 
                          src={currentNetwork.logoUrl} 
                          alt={currentNetwork.name} 
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {currentNetwork?.name}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Mobile Network Selector - Always visible */}
                <div className="sm:hidden border-b">
                  <div className="px-3 py-2">
                    <span className="text-sm font-medium">Networks</span>
                    {!isConnected && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Connect wallet to switch
                      </div>
                    )}
                  </div>
                  {networksConfig.networks.map((network) => (
                    <DropdownMenuItem
                      key={network.chainId}
                      onClick={() => isConnected ? switchNetwork(network.chainId) : null}
                      className={`flex items-center justify-between gap-2 px-3 py-2 ${
                        !isConnected ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      disabled={!isConnected}
                    >
                      <div className="flex items-center gap-2">
                        {network.logoUrl && (
                          <img 
                            src={network.logoUrl} 
                            alt={network.name} 
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        <span className="truncate">{network.name}</span>
                      </div>
                      {isConnected && chainId === network.chainId && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </div>

                {/* Actions */}
                <DropdownMenuItem asChild>
                  <a
                    href={getExplorerUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={disconnect}
                  className="flex items-center justify-between text-destructive px-3 py-2"
                >
                  <span>Disconnect</span>
                  <LogOut className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={connect} 
              className="h-10 md:h-9 px-4 text-sm rounded-lg font-medium" 
              disabled={isConnecting}
            >
              <Wallet className="h-4 w-4 mr-2 sm:hidden" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}