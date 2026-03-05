import { useState } from 'react'
import { useTiempoFijo } from '../hooks/useTiempoFijo'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function RealidadView() {
  const { bloques, addBloque, removeBloque, getBloquesHoy, getMinutosOcupados, getMinutosLibres } = useTiempoFijo()
  const [modalOpen, setModalOpen] = useState(false)
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date().getDay())

  const bloquesHoy = getBloquesHoy()
  const minutosOcupados = getMinutosOcupados()
  const minutosLibres = getMinutosLibres()
  const pctOcupado = Math.round(minutosOcupados / (24 * 60) * 100)

  const bloquesDia = bloques.filter(b => b.dias.includes(diaSeleccionado))

  function formatMin(min) {
    const h = Math.floor(min / 60)
    const m = min % 60
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
  }

  return (
    <div className="scroll-area">

      <div className="energia-header">
        <div className="energia-title">Vista de Realidad</div>
        <div className="energia-sub">Tu tiempo real después de lo no negociable</div>
      </div>

      {/* Resumen de hoy */}
      <div className="realidad-resumen">
        <div className="realidad-stat">
          <div className="rs-valor">{formatMin(minutosOcupados)}</div>
          <div className="rs-label">Tiempo fijo hoy</div>
        </div>
        <div className="realidad-divider"/>
        <div className="realidad-stat">
          <div className="rs-valor u-ok">{formatMin(minutosLibres)}</div>
          <div className="rs-label">Tiempo disponible</div>
        </div>
        <div className="realidad-divider"/>
        <div className="realidad-stat">
          <div className="rs-valor">{pctOcupado}%</div>
          <div className="rs-label">Del día ocupado</div>
        </div>
      </div>

      {/* Barra visual */}
      <div className="realidad-barra-wrap">
        <div className="realidad-barra">
          <div className="realidad-barra-fill" style={{ width: `${pctOcupado}%` }}/>
        </div>
        <div className="realidad-barra-labels">
          <span>Ocupado</span>
          <span>Libre</span>
        </div>
      </div>

      {/* Selector de día */}
      <div className="section-label">Ver por día</div>
      <div className="dias-selector">
        {DIAS.map((d, i) => (
          <button
            key={i}
            className={`dia-btn${diaSeleccionado === i ? ' active' : ''}`}
            onClick={() => setDiaSeleccionado(i)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Bloques del día seleccionado */}
      <div className="section-label">{DIAS_FULL[diaSeleccionado]}</div>

      {bloquesDia.length === 0 ? (
        <div className="empty-state" style={{ padding: '24px' }}>
          <div className="es-icon">🌅</div>
          <div className="es-title">Día libre</div>
          <div className="es-desc">No hay bloques fijos este día.</div>
        </div>
      ) : (
        bloquesDia
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
          .map(b => (
            <div key={b.id} className="bloque-card">
              <div className="bloque-emoji">{b.emoji}</div>
              <div className="bloque-info">
                <div className="bloque-nombre">{b.nombre}</div>
                <div className="bloque-hora">{b.horaInicio} — {b.horaFin}</div>
              </div>
              <button className="bloque-delete" onClick={() => removeBloque(b.id)}>✕</button>
            </div>
          ))
      )}

      {/* Agregar bloque */}
      <button className="add-step-trigger" style={{ marginTop: 8 }} onClick={() => setModalOpen(true)}>
        + Agregar bloque fijo
      </button>

      {modalOpen && <AddBloqueModal onClose={() => setModalOpen(false)} onAdd={addBloque} />}
    </div>
  )
}

function AddBloqueModal({ onClose, onAdd }) {
  const [nombre, setNombre] = useState('')
  const [emoji, setEmoji] = useState('📌')
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFin, setHoraFin] = useState('09:00')
  const [dias, setDias] = useState([1, 2, 3, 4, 5])

  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  function toggleDia(i) {
    setDias(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])
  }

  function handleAdd() {
    if (!nombre.trim() || dias.length === 0) return
    onAdd({ nombre: nombre.trim(), emoji, horaInicio, horaFin, dias })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-handle"/>
        <div className="modal-title">Nuevo bloque fijo</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Emoji</label>
            <input className="form-input" value={emoji} onChange={e => setEmoji(e.target.value)} style={{ fontSize: 20, textAlign: 'center' }}/>
          </div>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Clases" autoFocus/>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hora inicio</label>
            <input className="form-input" type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Hora fin</label>
            <input className="form-input" type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)}/>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Días</label>
          <div className="dias-selector">
            {DIAS.map((d, i) => (
              <button
                key={i}
                className={`dia-btn${dias.includes(i) ? ' active' : ''}`}
                onClick={() => toggleDia(i)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button className="submit-btn" onClick={handleAdd}>Agregar bloque</button>
      </div>
    </div>
  )
}