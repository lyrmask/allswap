"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, AlertTriangle, Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SlippageSettingsProps {
  slippage: number
  onSlippageChange: (slippage: number) => void
  className?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SlippageSettings({ slippage, onSlippageChange, className, open, onOpenChange }: SlippageSettingsProps) {
  const [customSlippage, setCustomSlippage] = useState<string>("")
  const [isCustom, setIsCustom] = useState(false)

  useEffect(() => {
    const presets = [0.1, 0.5, 1, 3]
    if (presets.includes(slippage)) {
      setIsCustom(false)
      setCustomSlippage("")
    } else {
      setIsCustom(true)
      setCustomSlippage(slippage.toString())
    }
  }, [slippage])

  const handlePresetClick = (preset: number) => {
    onSlippageChange(preset)
    setIsCustom(false)
    setCustomSlippage("")
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCustomSlippage(value)
      setIsCustom(true)
      if (value !== "" && !isNaN(Number.parseFloat(value))) {
        const numValue = Number.parseFloat(value)
        if (numValue <= 50) {
          onSlippageChange(numValue)
        }
      }
    }
  }

  const getSlippageWarning = () => {
    if (slippage < 0.05) {
      return {
        type: "warning",
        message: "Your transaction may fail due to low slippage tolerance",
      }
    } else if (slippage > 5) {
      return {
        type: "danger",
        message: "High slippage tolerance may result in unfavorable rates",
      }
    }
    return null
  }

  const warning = getSlippageWarning()

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-1 h-7 sm:h-8 px-2 rounded-lg", className)}>
          <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="text-xs sm:text-sm">Slippage: {slippage}%</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] sm:w-[320px] p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-medium">Slippage Tolerance</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 sm:h-6 px-1.5 sm:px-2 text-xs"
              onClick={() => {
                onSlippageChange(0.5)
                setIsCustom(false)
                setCustomSlippage("")
                onOpenChange(false)
              }}
            >
              Auto (0.5%)
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <Button
              variant={!isCustom && slippage === 0.1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(0.1)}
              className="text-xs sm:text-sm h-8 rounded-lg"
            >
              0.1%
            </Button>
            <Button
              variant={!isCustom && slippage === 0.5 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(0.5)}
              className="text-xs sm:text-sm h-8 rounded-lg"
            >
              0.5%
            </Button>
            <Button
              variant={!isCustom && slippage === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(1)}
              className="text-xs sm:text-sm h-8 rounded-lg"
            >
              1%
            </Button>
            <Button
              variant={!isCustom && slippage === 3 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(3)}
              className="text-xs sm:text-sm h-8 rounded-lg"
            >
              3%
            </Button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex-1">
              <Input
                value={customSlippage}
                onChange={handleCustomChange}
                placeholder="Custom"
                className={cn("pr-7 h-8 sm:h-9 text-xs sm:text-sm rounded-lg", isCustom ? "border-primary" : "")}
              />
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {warning && (
            <div
              className={cn(
                "p-2 rounded-lg text-xs sm:text-sm flex items-start gap-1.5 animate-in",
                warning.type === "warning"
                  ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{warning.message}</span>
            </div>
          )}

          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-xs sm:text-sm flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>Your transaction will revert if the price changes unfavorably by more than this percentage.</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}