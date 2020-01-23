import { patterns } from 'quasar'

const validation = {
  required: val => !!val || val === 0 || 'Field is required',
  isMin: (val, options) => console.log('testing isMin') && val.length >= options[0] || `Field should be at least ${options[0]} characters`,
  date: patterns.date || 'Field should be a date'
}

export default validation
