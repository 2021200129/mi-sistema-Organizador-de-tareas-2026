import { useState } from 'react'
import { useItems, getUrgency } from '../hooks/useItems'
import { today } from '../data/defaults'

const DURACIONES = [
  { label: '5–15 min', min: 0, max: 15 },
  { label: '15–45 min', min: 15, max: 45 },
  { label: '45 min+', min: 45, max: 999 },
]

const ENERGIAS = [
  { label: '🟢 Baja', value: 'baja' },
  { label: '🟡 Media', value: 'media' },
  { label: '🔴 Alta', value: 'alta' },
]

export default function EnergiaView() {
  const { items, toggleDone } = useItems()
  const [energia, setEnergia] = useState(null)
  const [duracion, setDuracion] = useState(null)

  const pending = items.filter(i => i.lastDone !== today())

  const filtered = pending.filter(i => {
    const eOk = !energia || i.energia === energia
    const dOk = !duracion || (i.duracion >= duracion.min && i.duracion <= duracion.max)
    return eOk && dOk
  }).sort((a, b) => {
    const ua = getUrgency(a), ub = getUrgency(b)
    const order = u => u.level === 'vencida' ? -999 : u.level === 'hoy' ? 0 : u.days
    return order(ua) - order(ub)
  })

  return (
    <div className="scroll-area">

      <div className="energia-header">
        <div className="energia-title">¿Qué puedo hacer ahora?</div>
        <div className="energia-sub">Filtra según tu energía y tiempo disponible</div>
      </div>

      <div className="section-label">¿Cuánta energía tienes?</div>
      <div className="energia-opts">
        {ENERGIAS.map(e => (
          <button
            key={e.value}
            className={`energia-btn${energia === e.value ? ' active' : ''}`}
            onClick={() => setEnergia(prev => prev === e.value ? null : e.value)}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="section-label">¿Cuánto tiempo tienes?</div>
      <div className="energia-opts">
        {DURACIONES.map(d => (
          <button
            key={d.label}
            className={`energia-btn${duracion?.label === d.label ? ' active' : ''}`}
            onClick={() => setDuracion(prev => prev?.label === d.label ? null : d)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="section-label">
        {filtered.length} tarea{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="es-icon">✨</div>
          <div className="es-title">
            {energia || duracion ? 'Sin coincidencias' : 'Todo al día'}
          </div>
          <div className="es-desc">
            {energia || duracion
              ? 'Prueba ajustando los filtros'
              : 'No hay tareas pendientes ahora mismo'}
          </div>
        </div>
      ) : (
        filtered.map(item => {
          const u = getUrgency(item)
          const energiaIcon = { baja: '🟢', media: '🟡', alta: '🔴' }[item.energia] || ''
          return (
            <div
              key={item.id}
              className={`task-card ${u.level}`}
              onClick={() => toggleDone(item.id)}
            >
              <div className="cb"/>
              <div className="task-info">
                <div className="task-top">
                  <span className="task-name">{item.name}</span>
                  <span className={`type-tag tag-${item.type}`}>
                    {item.type === 'hogar' ? 'Hogar' : 'Hábito'}
                  </span>
                </div>
                <div className="task-meta">
                  <span className={`urgency-label u-${u.level}`}>{u.label}</span>
                  <span>· {energiaIcon} {item.duracion} min</span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}