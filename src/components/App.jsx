import { useState } from 'react'
import { useItems, getUrgency, getRachaStreak, getLast7Days } from '../hooks/useItems'
import { today } from '../data/defaults'
import ProjectsView from './ProjectsView'
import EnergiaView from './EnergiaView'
import './App.css'

const NAV_MAIN = [
  ['hoy', '☀️', 'Hoy'],
  ['energia', '⚡', 'Energía'],
  ['todo', '📋', 'Todo'],
]

const NAV_MORE = [
  ['proyectos', '🗂', 'Proyectos', 'Organiza tus metas en pasos'],
  ['progreso', '📊', 'Progreso', 'Rachas y estado del hogar'],
  ['limbo', '🌫', 'Limbo', 'Ideas sin clasificar todavía'],
  ['balance', '⚖️', 'Balance', 'Carga por área esta semana'],
  ['horizonte', '⏳', 'Horizonte', 'Lo que se viene próximamente'],
]

export default function App() {
  const { items, toggleDone, addItem } = useItems()
  const [filter, setFilter] = useState('todo')
  const [view, setView] = useState('hoy')
  const [modalOpen, setModalOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const now = new Date()
  const dateStr = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`
  const h = now.getHours()
  const greeting = h < 12 ? 'Buenos días 👋' : h < 19 ? 'Buenas tardes 👋' : 'Buenas noches 👋'

  const total = items.length
  const done = items.filter(i => i.lastDone === today()).length
  const pct = total ? done / total : 0
  const circ = 125.6
  const offset = circ - circ * pct

  function switchView(v) {
    setView(v)
    setMoreOpen(false)
  }

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

  const isListView = ['hoy', 'todo'].includes(view)

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

      {/* FILTERS — solo en vistas de lista */}
      {isListView && (
        <div className="filters">
          {[['todo','Todo'],['hogar','🏠 Hogar'],['habito','💪 Hábitos'],['done','✅ Hechos']].map(([k,l]) => (
            <button key={k} className={`filter-btn${filter===k?' active':''}`} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      )}

      {/* CONTENT */}
      {view === 'proyectos' ? (
        <ProjectsView />
      ) : view === 'energia' ? (
        <EnergiaView />
      ) : view === 'progreso' ? (
        <StatsView items={items} />
      ) : view === 'limbo' ? (
        <LimboView items={items} addItem={addItem} />
      ) : view === 'balance' ? (
        <BalanceView items={items} />
      ) : view === 'horizonte' ? (
        <HorizonteView items={items} />
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

      {/* ADD BUTTON — solo en vistas de lista */}
      {isListView && (
        <button className="add-btn" onClick={() => setModalOpen(true)}>+</button>
      )}

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        {NAV_MAIN.map(([k, icon, label]) => (
          <button key={k} className={`nav-item${view===k?' active':''}`} onClick={() => switchView(k)}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </button>
        ))}
        <button className={`nav-item${moreOpen || NAV_MORE.some(([k])=>k===view) ?' active':''}`} onClick={() => setMoreOpen(o => !o)}>
          <span className="nav-icon">◉</span>
          <span className="nav-label">Más</span>
        </button>
      </div>

      {/* MORE MENU */}
      {moreOpen && (
        <div className="more-overlay" onClick={() => setMoreOpen(false)}>
          <div className="more-panel" onClick={e => e.stopPropagation()}>
            <div className="more-handle"/>
            <div className="more-title">Explorar</div>
            <div className="more-grid">
              {NAV_MORE.map(([k, icon, label, desc]) => (
                <button
                  key={k}
                  className={`more-item${view===k?' active':''}`}
                  onClick={() => switchView(k)}
                >
                  <span className="more-icon">{icon}</span>
                  <span className="more-label">{label}</span>
                  <span className="more-desc">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
          {item.energia && (
            <span>· {{ baja:'🟢', media:'🟡', alta:'🔴' }[item.energia]} {item.duracion}min</span>
          )}
        </div>
        {item.racha && days7 && (
          <div className="racha-wrap">
            <div className="racha-days">
              {days7.map((d, i) => (
                <div key={i} className={`rd${d.done?' done':''}${d.isToday&&!d.done?' today':''}`}/>
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
        <div class="stat-title">Rachas de hábitos</div>
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

function LimboView({ items, addItem }) {
  const [name, setName] = useState('')
  const limboItems = items.filter(i => i.estado === 'limbo')

  function handleAdd() {
    if (!name.trim()) return
    addItem({ type: 'hogar', name: name.trim(), freqDays: 1, responsable: '', racha: false, lastDone: null, energia: 'media', duracion: 15, estado: 'limbo' })
    setName('')
  }

  return (
    <div className="scroll-area">
      <div className="energia-header">
        <div className="energia-title">Limbo</div>
        <div className="energia-sub">Ideas sin clasificar — sin compromiso todavía</div>
      </div>
      <div className="add-step-form" style={{ marginBottom: 20 }}>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)}
          placeholder="Escribe una idea..." onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <div className="add-step-btns" style={{ marginTop: 8 }}>
          <button className="step-btn-add" onClick={handleAdd}>Capturar</button>
        </div>
      </div>
      {limboItems.length === 0 ? (
        <div className="empty-state">
          <div className="es-icon">🌫</div>
          <div className="es-title">Limbo vacío</div>
          <div className="es-desc">Las ideas que captures aquí esperan hasta que les des forma.</div>
        </div>
      ) : (
        limboItems.map(i => (
          <div key={i.id} className="task-card">
            <div className="cb"/>
            <div className="task-info">
              <div className="task-name">{i.name}</div>
              <div className="task-meta"><span className="u-muted">Sin clasificar</span></div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function BalanceView({ items }) {
  const areas = [
    { key: 'hogar', label: '🏠 Hogar', color: '#c96b3a' },
    { key: 'habito', label: '💪 Hábitos', color: '#3a7fc9' },
  ]
  return (
    <div className="scroll-area">
      <div className="energia-header">
        <div className="energia-title">Balance</div>
        <div className="energia-sub">Carga de actividades por área</div>
      </div>
      {areas.map(area => {
        const aItems = items.filter(i => i.type === area.key)
        const pending = aItems.filter(i => i.lastDone !== today()).length
        const done = aItems.filter(i => i.lastDone === today()).length
        const pct = aItems.length ? Math.round(done / aItems.length * 100) : 0
        return (
          <div key={area.key} className="stat-card" style={{ marginBottom: 10 }}>
            <div className="stat-title">{area.label}</div>
            <div className="proj-progress-wrap">
              <div className="proj-progress-bar">
                <div className="proj-progress-fill" style={{ width: `${pct}%`, background: area.color }}/>
              </div>
              <span className="proj-progress-label">{done}/{aItems.length}</span>
            </div>
            <div className="stat-row">
              <span className="stat-item-name">Pendientes hoy</span>
              <span className="u-hoy" style={{ fontWeight: 700 }}>{pending}</span>
            </div>
            <div className="stat-row">
              <span className="stat-item-name">Completadas hoy</span>
              <span className="u-ok" style={{ fontWeight: 700 }}>{done}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HorizonteView({ items }) {
  const upcoming = items
    .filter(i => {
      const u = getUrgency(i)
      return u.level !== 'ok' || u.days === -1 || (u.days > 0 && u.days <= 14)
    })
    .sort((a, b) => getUrgency(a).days - getUrgency(b).days)

  return (
    <div className="scroll-area">
      <div className="energia-header">
        <div className="energia-title">Horizonte</div>
        <div className="energia-sub">Lo que se viene en los próximos 14 días</div>
      </div>
      {upcoming.length === 0 ? (
        <div className="empty-state">
          <div className="es-icon">⏳</div>
          <div className="es-title">Todo al día</div>
          <div className="es-desc">No hay nada que venza pronto.</div>
        </div>
      ) : (
        upcoming.map(i => {
          const u = getUrgency(i)
          return (
            <div key={i.id} className="task-card">
              <div className="task-info">
                <div className="task-top">
                  <span className="task-name">{i.name}</span>
                  <span className={`type-tag tag-${i.type}`}>{i.type === 'hogar' ? 'Hogar' : 'Hábito'}</span>
                </div>
                <div className="task-meta">
                  <span className={`urgency-label u-${u.level}`}>{u.label}</span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function AddModal({ onClose, onAdd }) {
  const [type, setType] = useState('hogar')
  const [name, setName] = useState('')
  const [freq, setFreq] = useState(1)
  const [responsable, setResponsable] = useState('')
  const [racha, setRacha] = useState(false)
  const [energia, setEnergia] = useState('media')
  const [duracion, setDuracion] = useState(15)

  function handleAdd() {
    if (!name.trim()) return
    onAdd({ type, name: name.trim(), freqDays: parseInt(freq), responsable, racha, lastDone: null, energia, duracion: parseInt(duracion) })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
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
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Energía</label>
            <select className="form-select" value={energia} onChange={e => setEnergia(e.target.value)}>
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🔴 Alta</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Duración (min)</label>
            <input className="form-input" type="number" value={duracion} onChange={e => setDuracion(e.target.value)} min={1} max={180}/>
          </div>
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