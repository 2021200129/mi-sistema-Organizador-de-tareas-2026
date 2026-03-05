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
    lastDone: daysAgo(4), rachaHistory: []
  },
  {
    id: 2, type: 'hogar', name: 'Barrer sala',
    freqDays: 1, responsable: 'yo', racha: false,
    lastDone: daysAgo(1), rachaHistory: []
  },
  {
    id: 3, type: 'hogar', name: 'Limpiar baño',
    freqDays: 7, responsable: 'yo', racha: false,
    lastDone: daysAgo(5), rachaHistory: []
  },
  {
    id: 4, type: 'hogar', name: 'Cocinar almuerzo',
    freqDays: 1, responsable: 'compartido', racha: false,
    lastDone: today(), rachaHistory: []
  },
  {
    id: 5, type: 'habito', name: 'Ejercicio',
    freqDays: 1, responsable: '', racha: true,
    lastDone: daysAgo(1), rachaHistory: [daysAgo(4), daysAgo(3), daysAgo(2), daysAgo(1)]
  },
  {
    id: 6, type: 'habito', name: 'Leer',
    freqDays: 1, responsable: '', racha: true,
    lastDone: daysAgo(2), rachaHistory: [daysAgo(4), daysAgo(3), daysAgo(2)]
  },
  {
    id: 7, type: 'habito', name: 'Higiene personal',
    freqDays: 1, responsable: '', racha: false,
    lastDone: today(), rachaHistory: []
  },
  {
    id: 8, type: 'habito', name: 'Tomar agua',
    freqDays: 1, responsable: '', racha: false,
    lastDone: daysAgo(1), rachaHistory: []
  },
];