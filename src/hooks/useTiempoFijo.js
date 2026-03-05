import { useState, useEffect } from 'react'
import { DEFAULT_TIEMPO_FIJO } from '../data/defaults'

const STORAGE_KEY = 'mi-sistema-tiempo-fijo-v1'

export function useTiempoFijo() {
  const [bloques, setBloques] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_TIEMPO_FIJO
    } catch { return DEFAULT_TIEMPO_FIJO }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bloques))
  }, [bloques])

  function addBloque(bloque) {
    setBloques(prev => [...prev, { ...bloque, id: Date.now() }])
  }

  function removeBloque(id) {
    setBloques(prev => prev.filter(b => b.id !== id))
  }

  function getBloquesHoy() {
    const hoy = new Date().getDay()
    return bloques.filter(b => b.dias.includes(hoy))
  }

  function getMinutosOcupados() {
    return getBloquesHoy().reduce((total, b) => {
      const [hi, mi] = b.horaInicio.split(':').map(Number)
      const [hf, mf] = b.horaFin.split(':').map(Number)
      let inicio = hi * 60 + mi
      let fin = hf * 60 + mf
      if (fin < inicio) fin += 24 * 60 // overnight
      return total + (fin - inicio)
    }, 0)
  }

  function getMinutosLibres() {
    return 24 * 60 - getMinutosOcupados()
  }

  return { bloques, addBloque, removeBloque, getBloquesHoy, getMinutosOcupados, getMinutosLibres }
}