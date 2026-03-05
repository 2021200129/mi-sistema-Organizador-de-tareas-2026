import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'

export default function ProjectsView() {
  const { projects, addProject, addStep, toggleStep, setNextAction, updateProjectStatus, reorderSteps, editStep } = useProjects()
  const [selected, setSelected] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [addingStep, setAddingStep] = useState(false)
  const [newStepName, setNewStepName] = useState('')
  const [editingStep, setEditingStep] = useState(null)
const [editingName, setEditingName] = useState('')

  const activeProjects = projects.filter(p => p.status === 'activo')
  const pausedProjects = projects.filter(p => p.status === 'pausado')
  const doneProjects = projects.filter(p => p.status === 'terminado')

  const selectedProject = projects.find(p => p.id === selected)

  function handleAddStep() {
    if (!newStepName.trim()) return
    addStep(selected, newStepName.trim())
    setNewStepName('')
    setAddingStep(false)
  }

  function progressOf(p) {
    if (!p.steps.length) return 0
    return Math.round(p.steps.filter(s => s.done).length / p.steps.length * 100)
  }

  const areaColors = {
    hogar: { bg: 'rgba(201,107,58,0.1)', color: '#c96b3a' },
    trabajo: { bg: 'rgba(58,127,201,0.1)', color: '#3a7fc9' },
    creativo: { bg: 'rgba(130,58,201,0.1)', color: '#823ac9' },
    salud: { bg: 'rgba(58,158,106,0.1)', color: '#3a9e6a' },
  }

  if (selectedProject) {
    const progress = progressOf(selectedProject)
    const nextStep = selectedProject.steps.find(s => s.isNext && !s.done)
    const ac = areaColors[selectedProject.area] || areaColors.hogar

    return (
      <div className="scroll-area">

        <div className="proj-back" onClick={() => setSelected(null)}>
          ← Proyectos
        </div>

        <div className="proj-detail-header">
          <span className="proj-area-tag" style={{ background: ac.bg, color: ac.color }}>
            {selectedProject.area}
          </span>
          <h2 className="proj-detail-name">{selectedProject.name}</h2>
          {selectedProject.why && (
            <div className="proj-why">
              <span className="proj-why-label">Por qué</span>
              {selectedProject.why}
            </div>
          )}
          {selectedProject.doneWhen && (
            <div className="proj-why">
              <span className="proj-why-label">Terminado cuando</span>
              {selectedProject.doneWhen}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="proj-progress-wrap">
          <div className="proj-progress-bar">
            <div className="proj-progress-fill" style={{ width: `${progress}%` }}/>
          </div>
          <span className="proj-progress-label">{progress}% completado</span>
        </div>

        {/* Next action */}
        {nextStep && (
          <div className="next-action-card">
            <div className="na-label">⚡ Siguiente acción</div>
            <div className="na-name">{nextStep.name}</div>
          </div>
        )}

        {/* Steps */}
        <div className="section-label" style={{ marginTop: 20 }}>Pasos</div>

        {selectedProject.steps.map((step, index) => (
        <div
            key={step.id}
            className={`step-card ${step.done ? 'done' : ''} ${step.isNext && !step.done ? 'next' : ''}`}
            draggable={!step.done}
            onDragStart={e => e.dataTransfer.setData('text/plain', index)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
            e.preventDefault()
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
            reorderSteps(selectedProject.id, fromIndex, index)
            }}
        >
            <div className="cb" onClick={() => toggleStep(selectedProject.id, step.id)}>
            {step.done && <span className="cb-check">✓</span>}
            </div>
            <div className="step-info" onClick={() => {
            if (!step.done) setNextAction(selectedProject.id, step.id)
            }}>
            {editingStep === step.id ? (
                <div className="add-step-form">
                <input
                    className="form-input"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => {
                    if (e.key === 'Enter') {
                        editStep(selectedProject.id, step.id, editingName)
                        setEditingStep(null)
                    }
                    if (e.key === 'Escape') setEditingStep(null)
                    }}
                    autoFocus
                />
                <div className="add-step-btns">
                    <button className="step-btn-cancel" onClick={() => setEditingStep(null)}>Cancelar</button>
                    <button className="step-btn-add" onClick={() => {
                    editStep(selectedProject.id, step.id, editingName)
                    setEditingStep(null)
                    }}>Guardar</button>
                </div>
                </div>
            ) : (
                <>
                <div className="step-name">{step.name}</div>
                {step.isNext && !step.done && <div className="step-next-label">siguiente acción</div>}
                {!step.isNext && !step.done && <div className="step-set-next">toca para marcar como siguiente</div>}
                </>
            )}
            </div>
            {!step.done && editingStep !== step.id && (
            <button className="step-edit-btn" onClick={e => {
                e.stopPropagation()
                setEditingStep(step.id)
                setEditingName(step.name)
            }}>✏️</button>
            )}
            {!step.done && (
            <span className="drag-handle">⠿</span>
            )}
        </div>
        ))}

        {/* Add step */}
        {addingStep ? (
          <div className="add-step-form">
            <input
              className="form-input"
              value={newStepName}
              onChange={e => setNewStepName(e.target.value)}
              placeholder="Nombre del paso"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddStep()}
            />
            <div className="add-step-btns">
              <button className="step-btn-cancel" onClick={() => setAddingStep(false)}>Cancelar</button>
              <button className="step-btn-add" onClick={handleAddStep}>Agregar</button>
            </div>
          </div>
        ) : (
          <button className="add-step-trigger" onClick={() => setAddingStep(true)}>
            + Agregar paso
          </button>
        )}

        {/* Status */}
        <div className="section-label" style={{ marginTop: 24 }}>Estado del proyecto</div>
        <div className="status-row">
          {['activo', 'pausado', 'terminado'].map(s => (
            <button
              key={s}
              className={`status-btn ${selectedProject.status === s ? 'active' : ''}`}
              onClick={() => updateProjectStatus(selectedProject.id, s)}
            >
              {s}
            </button>
          ))}
        </div>

      </div>
    )
  }

  return (
    <div className="scroll-area">

      {activeProjects.length === 0 && pausedProjects.length === 0 && doneProjects.length === 0 ? (
        <div className="empty-state">
          <div className="es-icon">🗂</div>
          <div className="es-title">Sin proyectos todavía</div>
          <div className="es-desc">Crea tu primer proyecto con el botón +</div>
        </div>
      ) : (
        <>
          {activeProjects.length > 0 && <>
            <div className="section-label">Activos</div>
            {activeProjects.map(p => <ProjectCard key={p.id} project={p} onClick={() => setSelected(p.id)} progress={progressOf(p)} areaColors={areaColors} />)}
          </>}
          {pausedProjects.length > 0 && <>
            <div className="section-label">Pausados</div>
            {pausedProjects.map(p => <ProjectCard key={p.id} project={p} onClick={() => setSelected(p.id)} progress={progressOf(p)} areaColors={areaColors} />)}
          </>}
          {doneProjects.length > 0 && <>
            <div className="section-label">Terminados</div>
            {doneProjects.map(p => <ProjectCard key={p.id} project={p} onClick={() => setSelected(p.id)} progress={progressOf(p)} areaColors={areaColors} />)}
          </>}
        </>
      )}

      {modalOpen && <AddProjectModal onClose={() => setModalOpen(false)} onAdd={addProject} />}
      <button className="add-btn" onClick={() => setModalOpen(true)}>+</button>
    </div>
  )
}

function ProjectCard({ project, onClick, progress, areaColors }) {
  const nextStep = project.steps.find(s => s.isNext && !s.done)
  const ac = areaColors[project.area] || areaColors.hogar

  return (
    <div className="proj-card" onClick={onClick}>
      <div className="proj-card-top">
        <span className="proj-area-tag" style={{ background: ac.bg, color: ac.color }}>
          {project.area}
        </span>
        <span className="proj-step-count">
          {project.steps.filter(s => s.done).length}/{project.steps.length} pasos
        </span>
      </div>
      <div className="proj-name">{project.name}</div>
      {nextStep && (
        <div className="proj-next">⚡ {nextStep.name}</div>
      )}
      <div className="proj-bar-wrap">
        <div className="proj-bar">
          <div className="proj-bar-fill" style={{ width: `${progress}%` }}/>
        </div>
        <span className="proj-pct">{progress}%</span>
      </div>
    </div>
  )
}

function AddProjectModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [why, setWhy] = useState('')
  const [doneWhen, setDoneWhen] = useState('')
  const [area, setArea] = useState('hogar')

  function handleAdd() {
    if (!name.trim()) return
    onAdd({ name: name.trim(), why, doneWhen, area })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-handle"/>
        <div className="modal-title">Nuevo proyecto</div>

        <div className="form-group">
          <label className="form-label">Nombre</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Organizar el estudio" autoFocus/>
        </div>

        <div className="form-group">
          <label className="form-label">Área</label>
          <select className="form-select" value={area} onChange={e => setArea(e.target.value)}>
            <option value="hogar">🏠 Hogar</option>
            <option value="trabajo">🏢 Trabajo</option>
            <option value="creativo">🎨 Creativo</option>
            <option value="salud">💪 Salud</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">¿Por qué importa?</label>
          <input className="form-input" value={why} onChange={e => setWhy(e.target.value)} placeholder="Motivación del proyecto"/>
        </div>

        <div className="form-group">
          <label className="form-label">Terminado cuando...</label>
          <input className="form-input" value={doneWhen} onChange={e => setDoneWhen(e.target.value)} placeholder="Criterio de cierre"/>
        </div>

        <button className="submit-btn" onClick={handleAdd}>Crear proyecto</button>
      </div>
    </div>
  )
}