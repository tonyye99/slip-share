'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User, Receipt, Menu, X } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// Navigation items configuration
const navigationItems = [
  { name: 'Home', href: '/', icon: Receipt },
  { name: 'All Receipts', href: '/receipts', icon: Receipt },
]

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push('/auth/sign-in')
    }
  }

  const getUserInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-4 bg-slate-50">
        <nav className="bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-2xl px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <Link
              href="/"
              className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200"
            >
              <div className="p-2 bg-primary/10 rounded-xl">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Slip Share
              </span>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105',
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden p-2 hover:bg-gray-100 rounded-xl"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              )}

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" alt={user.email || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.email ? (
                            getUserInitials(user.email)
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-60 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mt-2"
                    align="end"
                    forceMount
                  >
                    <div className="flex items-center justify-start gap-3 p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={user.email || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.email ? (
                            getUserInitials(user.email)
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-gray-900">
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-600">Signed in</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="mx-2 bg-gray-200" />
                    <div className="p-2">
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-xl px-3 py-2 transition-colors"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    className="rounded-xl hover:bg-gray-100"
                    asChild
                  >
                    <Link href="/auth/sign-in">Sign In</Link>
                  </Button>
                  <Button
                    className="rounded-xl bg-primary hover:bg-primary/90"
                    asChild
                  >
                    <Link href="/auth/sign-up">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-2xl p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
