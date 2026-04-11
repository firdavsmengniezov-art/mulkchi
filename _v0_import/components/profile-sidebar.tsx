"use client"

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { User, Wallet, MessageCircle, Settings, FileText, Heart, ShoppingBag, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
  icon: React.ElementType
  label: string
  href: string
  badge?: number
}

const sidebarItems: SidebarItem[] = [
  { icon: User, label: 'Profil', href: '/profile' },
  { icon: Wallet, label: 'Balans', href: '/profile?tab=balance' },
  { icon: MessageCircle, label: 'Xabarlar', href: '/chat', badge: 3 },
  { icon: Settings, label: 'Sozlamalar', href: '/profile?tab=settings' },
]

export function ProfileSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')

  const isActive = (href: string) => {
    if (href === '/profile' && pathname === '/profile' && !currentTab) return true
    if (href.includes('?tab=')) {
      const tab = href.split('?tab=')[1]
      return currentTab === tab
    }
    return pathname === href
  }

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="bg-card rounded-xl p-2" style={{ boxShadow: 'var(--shadow)' }}>
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      'ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full text-xs font-medium px-1.5',
                      active 
                        ? 'bg-primary-foreground text-primary' 
                        : 'bg-primary text-primary-foreground'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
        
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href="/auth/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Chiqish</span>
          </Link>
        </div>
      </nav>
    </aside>
  )
}
