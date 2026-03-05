import { useState, useEffect } from 'react'
import { DEFAULT_ITEMS, today } from '../data/defaults'

const STORAGE_KEY = 'mi-sistema-v1'

export function getUrgency(item) {
  const todayStr = today()
  if (!item.lastDone) return { level: 'vencida', label: 'Nunca hecho', days: 999 }
  const last = new Date(item.lastDone)
  const now = new Date(todayStr)
  const diff = Math.round((now - last) / 86400000)
  const daysLeft = item.freqDays - diff

  if (item.lastDone === todayStr) return { level: 'ok', label: 'Hecho hoy', days: -1 }
  if (daysLeft < 0) return { level: 'vencida', label: `Vencida hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) > 1 ? 's' : ''}`, days: daysLeft }
  if (daysLeft === 0) return { level: 'hoy', label: 'Toca hoy', days: 0 }
  if (daysLeft <= 2) return { level: 'pronto', label: `En ${daysLeft} día${daysLeft > 1 ? 's' : ''}`, days: daysLeft }
  return { level: 'ok', label: `En ${daysLeft} días`, days: daysLeft }
}

export function getRachaStreak(item) {
  if (!item.racha || !item.rachaHistory?.length) return 0
  const sorted = [...item.rachaHistory].sort().reverse()
  let streak = 0
  const check = new Date()
  check.setHours(0, 0, 0, 0)
  if (item.lastDone !== today()) check.setDate(check.getDate() - 1)
  for (let i = 0; i < 60; i++) {
    const ds = check.toISOString().split('T')[0]
    if (sorted.includes(ds)) { streak++; check.setDate(check.getDate() - 1) }
    else break
  }
  return streak
}

export function getLast7Days(item) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (6 - i))
    const ds = d.toISOString().split('T')[0]
    return {
      ds,
      isToday: ds === today(),
      done: item.rachaHistory?.includes(ds) ?? false
    }
  })
}

export function useItems() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_ITEMS
    } catch { return DEFAULT_ITEMS }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function toggleDone(id) {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const todayStr = today()
      if (item.lastDone === todayStr) {
        return {
          ...item,
          lastDone: item._prevLastDone ?? null,
          rachaHistory: item.rachaHistory?.filter(d => d !== todayStr) ?? []
        }
      }
      return {
        ...item,
        _prevLastDone: item.lastDone,
        lastDone: todayStr,
        rachaHistory: item.racha && !item.rachaHistory?.includes(todayStr)
          ? [...(item.rachaHistory ?? []), todayStr]
          : item.rachaHistory ?? []
      }
    }))
  }

  function addItem(newItem) {
    setItems(prev => [...prev, { ...newItem, id: Date.now(), rachaHistory: [] }])
  }

  return { items, toggleDone, addItem }
}