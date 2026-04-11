"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Search, Bell, Menu, X, Plus, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/types'

interface HeaderProps {
  currentLang?: Language
  onLangChange?: (lang: Language) => void
}

export function Header({ currentLang = 'uz', onLangChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll for sticky header
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 10)
    })
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        isScrolled 
          ? 'bg-card/95 backdrop-blur-sm shadow-md' 
          : 'bg-card'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">M</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">Mulkchi</span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Qidirish: kvartira, uy, ofis..."
                className="w-full pl-10 bg-secondary border-0"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium">
                  {currentLang.toUpperCase()}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onLangChange?.('uz')}>
                  <span className={cn(currentLang === 'uz' && 'font-semibold')}>O&apos;zbekcha</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLangChange?.('ru')}>
                  <span className={cn(currentLang === 'ru' && 'font-semibold')}>Русский</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                3
              </span>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/chat">Xabarlar</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile?tab=favorites">Tanlanganlar</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/login">Chiqish</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA Button */}
            <Button className="hidden sm:flex gap-2 bg-primary hover:bg-primary-dark text-primary-foreground">
              <Plus className="h-4 w-4" />
              <span>E&apos;lon qo&apos;shish</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Qidirish..."
              className="w-full pl-10 bg-secondary border-0"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Bosh sahifa
            </Link>
            <Link
              href="/profile"
              className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Profil
            </Link>
            <Link
              href="/chat"
              className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Xabarlar
            </Link>
            <Button className="w-full gap-2 bg-primary hover:bg-primary-dark text-primary-foreground mt-2">
              <Plus className="h-4 w-4" />
              <span>E&apos;lon qo&apos;shish</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
