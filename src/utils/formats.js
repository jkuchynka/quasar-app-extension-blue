
import { date } from 'quasar'

function dateShort (val) {
  return date.formatDate(val, 'MMM D YYYY')
}

function dateTime (val) {
  return date.formatDate(val, 'MMM D YYYY h:mm a')
}

function titleCase (str) {
  return (str + '')
    .replace('_', ' ')
    .replace(/^(.)|\s+(.)/g, function ($1) {
      return $1.toUpperCase()
    })
}

export default {
  date: dateShort,
  dateTime: dateTime,
  titleCase
}
