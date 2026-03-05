import { useItems, getUrgency, getRachaStreak } from '../hooks/useItems'
import { useTiempoFijo } from '../hooks/useTiempoFijo'
import { today } from '../data/defaults'

export default function DashboardView({ onNavigate }) {
  const { items, toggleDone } = useItems()
  const { getMinutosLibres, getBloquesHoy } = useTiempoFijo()

  const todayStr = today()
  const total = items.length
  const done = items.filter(i => i.lastDone === todayStr).length
  const pct = total ? Math.round(done / total * 100) : 0

  const minutosLibres = getMinutosLibres()
  const hLibres = Math.floor(minutosLibres / 60)
  const mLibres = minutosLibres % 60
  const tiempoLibreStr = mLibres === 0 ? `${hLibres}h` : `${hLibres}h ${mLibres}min`

  const bloquesHoy = getBloquesHoy()
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))

  const urgentes = items
    .filter(i => {
      const u = getUrgency(i)
      return (u.level === 'vencida' || u.level === 'hoy') && i.lastDone !== todayStr
    })
    .slice(0, 3)

  const habitosConRacha = items
    .filter(i => i.type === 'habito' && i.racha)
    .map(i => ({ ...i, streak: getRachaStreak(i) }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3)

  const hogar = items.filter(i => i.type === 'hogar')
  const habitos = items.filter(i => i.type === 'habito')
  const hogarDone = hogar.filter(i => i.lastDone === todayStr).length
  const habitosDone = habitos.filter(i => i.lastDone === todayStr).length

  return (
    <div className="scroll-area">

      {/* Progreso general */}
      <div className="dash-progress-card">
        <div className="dash-progress-info">
          <div className="dash-progress-title">Progreso de hoy</div>
          <div className="dash-progress-num">{done}<span>/{total}</span></div>
        </div>
        <div className="dash-progress-bar">
          <div className="dash-progress-fill" style={{ width: `${pct}%` }}/>
        </div>
        <div className="dash-progress-pct">{pct}% completado</div>
      </div>

      {/* Tiempo disponible */}
      <div className="dash-row">
        <div className="dash-mini-card">
          <div className="dmc-icon">⏱</div>
          <div className="dmc-val">{tiempoLibreStr}</div>
          <div className="dmc-label">Tiempo libre hoy</div>
        </div>
        <div className="dash-mini-card">
          <div className="dmc-icon">🏠</div>
          <div className="dmc-val">{hogarDone}/{hogar.length}</div>
          <div className="dmc-label">Hogar al día</div>
        </div>
        <div className="dash-mini-card">
          <div className="dmc-icon">💪</div>
          <div className="dmc-val">{habitosDone}/{habitos.length}</div>
          <div className="dmc-label">Hábitos al día</div>
        </div>
      </div>

      {/* Urgentes */}
      {urgentes.length > 0 && <>
        <div className="section-label">Urgente ahora</div>
        {urgentes.map(item => {
          const u = getUrgency(item)
          const isDone = item.lastDone === todayStr
          return (
            <div key={item.id} className={`task-card ${isDone ? 'done' : u.level}`} onClick={() => toggleDone(item.id)}>
              <div className="cb">{isDone && <span className="cb-check">✓</span>}</div>
              <div className="task-info">
                <div className="task-top">
                  <span className="task-name">{item.name}</span>
                  <span className={`type-tag tag-${item.type}`}>{item.type === 'hogar' ? 'Hogar' : 'Hábito'}</span>
                </div>
                <div className="task-meta">
                  <span className={`urgency-label u-${u.level}`}>{u.label}</span>
                </div>
              </div>
            </div>
          )
        })}
        {items.filter(i => { const u = getUrgency(i); return (u.level==='vencida'||u.level==='hoy') && i.lastDone !== todayStr }).length > 3 && (
          <button className="dash-ver-mas" onClick={() => onNavigate('hoy')}>
            Ver todas las urgentes →
          </button>
        )}
      </>}

      {/* Rachas */}
      {habitosConRacha.length > 0 && <>
        <div className="section-label">Rachas activas</div>
        <div className="dash-rachas">
          {habitosConRacha.map(h => (
            <div key={h.id} className="dash-racha-item">
              <div className="dri-name">{h.name}</div>
              <div className="dri-streak">
                <span className="dri-num">{h.streak}</span>
                <span className="dri-label">días</span>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* Bloques de hoy */}
      {bloquesHoy.length > 0 && <>
        <div className="section-label">Bloques fijos hoy</div>
        <div className="dash-bloques">
          {bloquesHoy.map(b => (
            <div key={b.id} className="dash-bloque">
              <span className="db-emoji">{b.emoji}</span>
              <span className="db-nombre">{b.nombre}</span>
              <span className="db-hora">{b.horaInicio}</span>
            </div>
          ))}
        </div>
      </>}

      {/* Accesos rápidos */}
      <div className="section-label">Accesos rápidos</div>
      <div className="dash-accesos">
        {[
          ['energia', '⚡', 'Qué hacer ahora'],
          ['proyectos', '🗂', 'Proyectos'],
          ['horizonte', '⏳', 'Próximos días'],
          ['realidad', '🌍', 'Tiempo real'],
        ].map(([v, icon, label]) => (
          <button key={v} className="dash-acceso" onClick={() => onNavigate(v)}>
            <span className="da-icon">{icon}</span>
            <span className="da-label">{label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}