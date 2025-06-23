import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Web3Provider } from "@/context/web3-context";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap'
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space-grotesk",
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Allswap - Professional DeFi Trading Platform",
  description:
    "Experience seamless token swaps and liquidity provision on Allswap - the next-generation decentralized exchange built for professionals",
  keywords: "DeFi, DEX, token swap, liquidity, Soneium, decentralized exchange",
  authors: [{ name: "Allswap Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Allswap - Professional DeFi Trading Platform",
    description: "Experience seamless token swaps and liquidity provision",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} layout-body`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Web3Provider>
            {/* Enhanced Header with backdrop blur */}
            <header className="layout-header">
              <Header />
            </header>
            
            {/* Main Content Area */}
            <main className="layout-main">
              {/* Background Pattern */}
              <div className="layout-bg-pattern" />
              
              {/* Content Container */}
              <div className="layout-content">
                {children}
              </div>
            </main>
            
            {/* Enhanced Footer */}
            <footer className="layout-footer">
              <div className="footer-container">
                <div className="footer-content">
                  {/* Brand Section */}
                  <div className="footer-brand">
                    <div className="brand-header">
                      <div className="brand-logo">
                        <span className="brand-icon">A</span>
                      </div>
                      <span className="brand-name">
                        Allswap
                      </span>
                    </div>
                    <p className="brand-description">
                      Professional DeFi trading platform built for the future of finance.
                    </p>
                  </div>
                  
                  {/* Navigation Links */}
                  <nav className="footer-nav">
                    <div className="nav-section">
                      <h4 className="nav-title">Resources</h4>
                      <div className="nav-links">
                        <a href="/docs" className="nav-link">
                          Documentation
                        </a>
                      </div>
                    </div>
                    
                    <div className="nav-section">
                      <h4 className="nav-title">Legal</h4>
                      <div className="nav-links">
                        <a href="/terms" className="nav-link">
                          Terms of Service
                        </a>
                        <a href="/privacy" className="nav-link">
                          Privacy Policy
                        </a>
                      </div>
                    </div>
                  </nav>
                </div>
                
                {/* Bottom Section */}
                <div className="footer-bottom">
                  <p className="footer-copyright">
                    © {new Date().getFullYear()} Allswap Protocol. All rights reserved.
                  </p>
                  <div className="footer-status">
                    <div className="status-indicator">
                      <div className="status-dot status-connected" />
                      <span className="status-text">Network</span>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
            
            <Toaster />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}