import { useState, useEffect } from 'react'
import { DEFAULT_PROJECTS } from '../data/defaults'

const STORAGE_KEY = 'mi-sistema-projects-v1'

export function useProjects() {
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_PROJECTS
    } catch { return DEFAULT_PROJECTS }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  function addProject(project) {
    setProjects(prev => [...prev, {
      ...project,
      id: Date.now(),
      status: 'activo',
      steps: []
    }])
  }

  function addStep(projectId, stepName) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const newStep = {
        id: Date.now(),
        name: stepName,
        done: false,
        isNext: p.steps.filter(s => !s.done).length === 0
      }
      return { ...p, steps: [...p.steps, newStep] }
    }))
  }

  function toggleStep(projectId, stepId) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const steps = p.steps.map(s =>
        s.id === stepId ? { ...s, done: !s.done, isNext: false } : s
      )
      // Auto-assign next action to first undone step
      const firstUndone = steps.findIndex(s => !s.done)
      const updatedSteps = steps.map((s, i) => ({ ...s, isNext: i === firstUndone }))
      return { ...p, steps: updatedSteps }
    }))
  }

  function setNextAction(projectId, stepId) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      return {
        ...p,
        steps: p.steps.map(s => ({ ...s, isNext: s.id === stepId }))
      }
    }))
  }

  function updateProjectStatus(projectId, status) {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status } : p
    ))
  }

  function reorderSteps(projectId, fromIndex, toIndex) {
    setProjects(prev => prev.map(p => {
        if (p.id !== projectId) return p
        const steps = [...p.steps]
        const [moved] = steps.splice(fromIndex, 1)
        steps.splice(toIndex, 0, moved)
        return { ...p, steps }
    }))
    }

    function editStep(projectId, stepId, newName) {
    setProjects(prev => prev.map(p => {
        if (p.id !== projectId) return p
        return {
        ...p,
        steps: p.steps.map(s => s.id === stepId ? { ...s, name: newName } : s)
        }
    }))
    }

  return { projects, addProject, addStep, toggleStep, setNextAction, updateProjectStatus, reorderSteps, editStep }
}