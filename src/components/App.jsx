import { useState } from 'react'
import { useItems, getUrgency, getRachaStreak, getLast7Days } from '../hooks/useItems'
import { today } from '../data/defaults'
import './App.css'

import ProjectsView from './ProjectsView'

export default function App() {
  const { items, toggleDone, addItem } = useItems()
  const [filter, setFilter] = useState('todo')
  const [view, setView] = useState('hoy')
  const [modalOpen, setModalOpen] = useState(false)

  // Header info
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const now = new Date()
  const dateStr = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`
  const h = now.getHours()
  const greeting = h < 12 ? 'Buenos días 👋' : h < 19 ? 'Buenas tardes 👋' : 'Buenas noches 👋'

  // Progress
  const total = items.length
  const done = items.filter(i => i.lastDone === today()).length
  const pct = total ? done / total : 0
  const circ = 125.6
  const offset = circ - circ * pct

  // Filter + sort
  function getFiltered() {
    let list = [...items]
    if (filter === 'hogar') list = list.filter(i => i.type === 'hogar')
    else if (filter === 'habito') list = list.filter(i => i.type === 'habito')
    else if (filter === 'done') list = list.filter(i => i.lastDone === today())
    if (view === 'hoy') {
      list = list.filter(i => {
        const u = getUrgency(i)
        return u.level !== 'ok' || u.days === -1
      })
    }
    return list.sort((a, b) => {
      const ua = getUrgency(a), ub = getUrgency(b)
      const order = u => u.level === 'vencida' ? u.days : u.level === 'hoy' ? 0 : u.level === 'pronto' ? u.days : u.days === -1 ? 100 : u.days
      return order(ua) - order(ub)
    })
  }

  const filtered = getFiltered()
  const vencidas = filtered.filter(i => getUrgency(i).level === 'vencida')
  const hoyItems = filtered.filter(i => getUrgency(i).level === 'hoy')
  const pronto   = filtered.filter(i => getUrgency(i).level === 'pronto')
  const okItems  = filtered.filter(i => getUrgency(i).level === 'ok' && getUrgency(i).days > 2)
  const doneItems = filtered.filter(i => i.lastDone === today() && getUrgency(i).level === 'ok' && getUrgency(i).days === -1)

  return (
    <div className="app">

      {/* HEADER */}
      <div className="app-header">
        <div className="header-top">
          <div>
            <div className="greeting-date">{dateStr}</div>
            <div className="greeting-name">{greeting}</div>
          </div>
          <div className="progress-ring-wrap">
            <svg className="progress-ring" viewBox="0 0 48 48">
              <circle className="ring-bg" cx="24" cy="24" r="20"/>
              <circle className="ring-fill" cx="24" cy="24" r="20"
                strokeDasharray="125.6"
                strokeDashoffset={offset}/>
            </svg>
            <div className="progress-text">{done}/{total}</div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters">
        {[['todo','Todo'],['hogar','🏠 Hogar'],['habito','💪 Hábitos'],['done','✅ Hechos']].map(([k,l]) => (
          <button key={k} className={`filter-btn${filter===k?' active':''}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {/* LIST or STATS */}
      {view === 'stats' ? (
        <StatsView items={items} />
      ) : view === 'proyectos' ? (
        <ProjectsView />
      ) : (
        <div className="scroll-area">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="es-icon">✨</div>
              <div className="es-title">Todo al día</div>
              <div className="es-desc">No hay tareas pendientes para esta vista.</div>
            </div>
          ) : (
            <>
              {(vencidas.length > 0 || hoyItems.length > 0) && <>
                <div className="section-label">Vencido / Hoy</div>
                {[...vencidas, ...hoyItems].map(i => <TaskCard key={i.id} item={i} onToggle={toggleDone}/>)}
              </>}
              {pronto.length > 0 && <>
                <div className="section-label">Esta semana</div>
                {pronto.map(i => <TaskCard key={i.id} item={i} onToggle={toggleDone}/>)}
              </>}
              {okItems.length > 0 && <>
                <div className="section-label">Al día</div>
                {okItems.map(i => <TaskCard key={i.id} item={i} onToggle={toggleDone}/>)}
              </>}
              {doneItems.length > 0 && <>
                <div className="section-label">Completado hoy</div>
                {doneItems.map(i => <TaskCard key={i.id} item={i} onToggle={toggleDone}/>)}
              </>}
            </>
          )}
        </div>
      )}

      {/* ADD BUTTON */}
      {view !== 'stats' && (
        <button className="add-btn" onClick={() => setModalOpen(true)}>+</button>
      )}

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        {[['hoy','☀️','Hoy'],['todo','📋','Todo'],['proyectos','🗂','Proyectos'],['stats','📊','Progreso']].map(([k,icon,label]) => (
          <button key={k} className={`nav-item${view===k?' active':''}`} onClick={() => setView(k)}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen && <AddModal onClose={() => setModalOpen(false)} onAdd={addItem}/>}
    </div>
  )
}

function TaskCard({ item, onToggle }) {
  const u = getUrgency(item)
  const isDone = item.lastDone === today()
  const streak = getRachaStreak(item)
  const days7 = item.racha ? getLast7Days(item) : null

  return (
    <div className={`task-card ${isDone ? 'done' : u.level}`} onClick={() => onToggle(item.id)}>
      <div className="cb">
        {isDone && <span className="cb-check">✓</span>}
      </div>
      <div className="task-info">
        <div className="task-top">
          <span className="task-name">{item.name}</span>
          <span className={`type-tag tag-${item.type}`}>{item.type === 'hogar' ? 'Hogar' : 'Hábito'}</span>
        </div>
        <div className="task-meta">
          <span className={`urgency-label u-${u.level}`}>{u.label}</span>
          {item.type === 'hogar' && item.responsable && (
            <span>· cada {item.freqDays === 1 ? 'día' : `${item.freqDays} días`} · {item.responsable}</span>
          )}
        </div>
        {item.racha && days7 && (
          <div className="racha-wrap">
            <div className="racha-days">
              {days7.map((d, i) => (
                <div key={i} className={`rd${d.done ? ' done' : ''}${d.isToday && !d.done ? ' today' : ''}`}/>
              ))}
            </div>
            <div className="racha-info"><strong>{streak}</strong> días seguidos</div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatsView({ items }) {
  const habitos = items.filter(i => i.type === 'habito' && i.racha)
  const hogar = items.filter(i => i.type === 'hogar')
  return (
    <div className="stats-view">
      <div className="stat-card">
        <div className="stat-title">Rachas de hábitos</div>
        {habitos.length === 0
          ? <div className="stat-empty">No tienes hábitos con racha todavía.</div>
          : habitos.map(h => (
            <div className="stat-row" key={h.id}>
              <span className="stat-item-name">{h.name}</span>
              <span><strong>{getRachaStreak(h)}</strong> <span className="stat-streak-label">días</span></span>
            </div>
          ))}
      </div>
      <div className="stat-card">
        <div className="stat-title">Estado del hogar</div>
        {hogar.map(h => {
          const u = getUrgency(h)
          return (
            <div className="stat-row" key={h.id}>
              <span className="stat-item-name">{h.name}</span>
              <span className={`urgency-label u-${u.level}`}>{u.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AddModal({ onClose, onAdd }) {
  const [type, setType] = useState('hogar')
  const [name, setName] = useState('')
  const [freq, setFreq] = useState(1)
  const [responsable, setResponsable] = useState('')
  const [racha, setRacha] = useState(false)

  function handleAdd() {
    if (!name.trim()) return
    onAdd({ type, name: name.trim(), freqDays: parseInt(freq), responsable, racha, lastDone: null })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <div className="modal-title">Nueva actividad</div>

        <div className="form-group">
          <label className="form-label">Tipo</label>
          <div className="type-selector">
            <div className={`type-opt hogar${type==='hogar'?' selected':''}`} onClick={() => setType('hogar')}>🏠 Hogar</div>
            <div className={`type-opt habito${type==='habito'?' selected':''}`} onClick={() => setType('habito')}>💪 Hábito</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nombre</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Barrer sala" autoFocus/>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Frecuencia</label>
            <select className="form-select" value={freq} onChange={e => setFreq(e.target.value)}>
              <option value={1}>Diario</option>
              <option value={2}>Cada 2 días</option>
              <option value={3}>Cada 3 días</option>
              <option value={7}>Semanal</option>
              <option value={14}>Cada 2 semanas</option>
              <option value={30}>Mensual</option>
            </select>
          </div>
          {type === 'hogar' && (
            <div className="form-group">
              <label className="form-label">Responsable</label>
              <input className="form-input" value={responsable} onChange={e => setResponsable(e.target.value)} placeholder="yo"/>
            </div>
          )}
        </div>

        {type === 'habito' && (
          <div className="form-group">
            <div className="toggle-row" onClick={() => setRacha(r => !r)}>
              <span className="toggle-label">Seguimiento de racha</span>
              <div className={`toggle${racha?' on':''}`}/>
            </div>
          </div>
        )}

        <button className="submit-btn" onClick={handleAdd}>Agregar</button>
      </div>
    </div>
  )
}