import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-full gradient-bg text-white font-bold">A</div>
      <span className="text-xl font-bold gradient-text">AllSwap</span>
    </Link>
  )
}
