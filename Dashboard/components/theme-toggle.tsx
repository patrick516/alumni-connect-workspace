'use client'

import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'light', label: 'Light Mode', icon: Sun },
  { value: 'dark', label: 'Dark Mode', icon: Moon },
  { value: 'system', label: 'System Default', icon: Laptop },
] as const

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted ? resolvedTheme === 'dark' : true
  const active = mounted ? theme ?? 'system' : 'system'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change color theme"
        className={cn(
          'group relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/60',
          'transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        <Sun
          className={cn(
            'h-4 w-4 text-[var(--crimson)] transition-all duration-300',
            isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
          )}
        />
        <Moon
          className={cn(
            'absolute h-4 w-4 text-[var(--gold)] transition-all duration-300',
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0',
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Appearance
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className="cursor-pointer gap-2 text-sm"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{label}</span>
              {active === value && (
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--crimson)]" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
