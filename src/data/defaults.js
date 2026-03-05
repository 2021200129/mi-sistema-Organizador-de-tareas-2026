export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export const DEFAULT_ITEMS = [
  {
    id: 1, type: 'hogar', name: 'Lavar ropa',
    freqDays: 3, responsable: 'mamá', racha: false,
    lastDone: daysAgo(4), rachaHistory: [],
    energia: 'media', duracion: 30
  },
  {
    id: 2, type: 'hogar', name: 'Barrer sala',
    freqDays: 1, responsable: 'yo', racha: false,
    lastDone: daysAgo(1), rachaHistory: [],
    energia: 'baja', duracion: 15
  },
  {
    id: 3, type: 'hogar', name: 'Limpiar baño',
    freqDays: 7, responsable: 'yo', racha: false,
    lastDone: daysAgo(5), rachaHistory: [],
    energia: 'media', duracion: 20
  },
  {
    id: 4, type: 'hogar', name: 'Cocinar almuerzo',
    freqDays: 1, responsable: 'compartido', racha: false,
    lastDone: today(), rachaHistory: [],
    energia: 'media', duracion: 45
  },
  {
    id: 5, type: 'habito', name: 'Ejercicio',
    freqDays: 1, responsable: '', racha: true,
    lastDone: daysAgo(1), rachaHistory: [daysAgo(4), daysAgo(3), daysAgo(2), daysAgo(1)],
    energia: 'alta', duracion: 45
  },
  {
    id: 6, type: 'habito', name: 'Leer',
    freqDays: 1, responsable: '', racha: true,
    lastDone: daysAgo(2), rachaHistory: [daysAgo(4), daysAgo(3), daysAgo(2)],
    energia: 'baja', duracion: 20
  },
  {
    id: 7, type: 'habito', name: 'Higiene personal',
    freqDays: 1, responsable: '', racha: false,
    lastDone: today(), rachaHistory: [],
    energia: 'baja', duracion: 10
  },
  {
    id: 8, type: 'habito', name: 'Tomar agua',
    freqDays: 1, responsable: '', racha: false,
    lastDone: daysAgo(1), rachaHistory: [],
    energia: 'baja', duracion: 1
  },
]

export const DEFAULT_PROJECTS = [
  {
    id: 101,
    name: 'Sistema de limpieza del hogar',
    why: 'Vivir en un espacio ordenado sin tener que recordar qué falta',
    doneWhen: 'Tengo una lista de tareas recurrentes con frecuencia definida',
    area: 'hogar',
    status: 'activo',
    steps: [
      { id: 1, name: 'Identificar todas las zonas del hogar', done: true },
      { id: 2, name: 'Listar tareas de limpieza por zona', done: true },
      { id: 3, name: 'Asignar frecuencia a cada tarea', done: false, isNext: true },
      { id: 4, name: 'Decidir quién hace cada tarea', done: false },
      { id: 5, name: 'Elegir dónde vivirá el sistema', done: false },
    ]
  }
]