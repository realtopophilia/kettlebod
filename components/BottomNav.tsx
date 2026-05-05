'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path = usePathname()
  const isHome    = path === '/'
  const isJournal = path.startsWith('/journal')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center h-16 z-50">
      <Link href="/" className={`flex flex-col items-center gap-0.5 text-xs px-6 py-2 rounded-lg ${isHome ? 'text-amber-400' : 'text-zinc-500'}`}>
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <span>Train</span>
      </Link>
      <Link href="/journal" className={`flex flex-col items-center gap-0.5 text-xs px-6 py-2 rounded-lg ${isJournal ? 'text-amber-400' : 'text-zinc-500'}`}>
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <span>Journal</span>
      </Link>
    </nav>
  )
}
