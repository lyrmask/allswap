import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SwapTab from "@/components/swap-tab"
import LiquidityTab from "@/components/liquidity-tab"
import { ArrowRight, Shield, Zap, TrendingUp, Users, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            {/* Main Heading */}
            <h1 className="hero-title">
              The Future of
              <br />
              <span className="hero-highlight">
                Professional DeFi
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="hero-subtitle">
              Experience lightning-fast swaps, deep liquidity, and institutional-grade security 
              on the most advanced decentralized exchange platform.
            </p>
          </div>
        </div>
      </section>

      {/* Trading Interface */}
      <section className="trading-section">
        <div className="trading-container">
          <div className="trading-card-wrapper">
            <div className="trading-card-container">
              {/* Decorative Background */}
              <div className="trading-card-bg" />
              
              {/* Main Trading Card */}
              <div className="trading-card">
                <Tabs defaultValue="swap" className="trading-tabs">
                  {/* Enhanced Tab Header */}
                  <TabsList className="tabs-header">
                    <TabsTrigger 
                      value="swap" 
                      className="tab-trigger"
                    >
                      <Zap className="tab-icon" />
                      Swap
                    </TabsTrigger>
                    <TabsTrigger 
                      value="liquidity" 
                      className="tab-trigger"
                    >
                      <TrendingUp className="tab-icon" />
                      Liquidity
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Tab Content */}
                  <TabsContent value="swap" className="tab-content animate-fade-in">
                    <SwapTab />
                  </TabsContent>
                  <TabsContent value="liquidity" className="tab-content animate-fade-in">
                    <LiquidityTab />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Zap />
              </div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-description">
                Execute trades in milliseconds with our optimized smart contracts
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Shield />
              </div>
              <h3 className="feature-title">Secure & Audited</h3>
              <p className="feature-description">
                Battle-tested smart contracts audited by leading security firms
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp />
              </div>
              <h3 className="feature-title">Deep Liquidity</h3>
              <p className="feature-description">
                Access deep liquidity pools for minimal slippage on large trades
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}