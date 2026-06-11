import { Calendar, FileText, Archive, DollarSign, BookOpen } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/posts', label: 'Posts', icon: FileText },
  { to: '/vault', label: 'Vault', icon: Archive },
  { to: '/finances', label: 'Finances', icon: DollarSign },
  { to: '/strategy', label: 'Strategy', icon: BookOpen },
]
