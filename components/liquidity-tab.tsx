"use client"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddLiquidity from "@/components/add-liquidity"
import RemoveLiquidity from "@/components/remove-liquidity"
import SlippageSettings from "@/components/slippage-settings"
import { useSlippage } from "@/hooks/use-slippage"
import { useWeb3 } from "@/context/web3-context"

export default function LiquidityTab() {
  const { slippage, updateSlippage } = useSlippage()
  const { isConnected } = useWeb3()

  return (
    <div className="p-3 sm:p-5 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold">Liquidity</h2>
        {isConnected && <SlippageSettings slippage={slippage} onSlippageChange={updateSlippage} />}
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10 bg-muted/70 rounded-lg">
          <TabsTrigger 
            value="add" 
            className="rounded-md text-xs sm:text-sm font-medium transition-colors duration-150"
          >
            Add
          </TabsTrigger>
          <TabsTrigger 
            value="remove" 
            className="rounded-md text-xs sm:text-sm font-medium transition-colors duration-150"
          >
            Remove
          </TabsTrigger>
        </TabsList>
        <TabsContent value="add" className="animate-in pt-2 sm:pt-3">
          <AddLiquidity slippage={slippage} updateSlippage={updateSlippage} />
        </TabsContent>
        <TabsContent value="remove" className="animate-in pt-2 sm:pt-3">
          <RemoveLiquidity slippage={slippage} updateSlippage={updateSlippage} />
        </TabsContent>
      </Tabs>
    </div>
  )
}