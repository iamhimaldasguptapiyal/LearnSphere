import { computed, reactive, ref } from 'vue'

/**
 * A small, dependency-free form helper.
 *
 * Rules are plain functions: given the field value and the whole form, return
 * an error string, or a falsy value when the field is acceptable. Errors are
 * only surfaced once a field has been blurred or the form submitted, so the
 * user is not shouted at while they are still typing their first character.
 *
 * @param {object} initial      initial field values
 * @param {object} rules        map of field name -> array of rule functions
 */
/** Copy field values, duplicating arrays so the form never aliases its source. */
function cloneValues(source) {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value]),
  )
}

export function useFormValidation(initial, rules) {
  const values = reactive(cloneValues(initial))
  const touched = reactive({})
  const submitted = ref(false)

  const allErrors = computed(() => {
    const result = {}
    for (const field of Object.keys(rules)) {
      for (const rule of rules[field]) {
        const message = rule(values[field], values)
        if (message) {
          result[field] = message
          break
        }
      }
    }
    return result
  })

  /** Errors the user should actually see right now. */
  const errors = computed(() => {
    const visible = {}
    for (const [field, message] of Object.entries(allErrors.value)) {
      if (submitted.value || touched[field]) visible[field] = message
    }
    return visible
  })

  const isValid = computed(() => Object.keys(allErrors.value).length === 0)
  const errorCount = computed(() => Object.keys(allErrors.value).length)

  function touch(field) {
    touched[field] = true
  }

  /** Call on submit. Returns true when the form may proceed. */
  function validate() {
    submitted.value = true
    return isValid.value
  }

  function reset(next = initial) {
    Object.assign(values, cloneValues({ ...initial, ...next }))
    for (const key of Object.keys(touched)) delete touched[key]
    submitted.value = false
  }

  return { values, errors, isValid, errorCount, submitted, touch, validate, reset }
}

/* ---------------- Reusable rule builders ---------------- */

export const required =
  (label = 'This field') =>
  (value) => {
    if (value === null || value === undefined) return `${label} is required.`
    if (typeof value === 'string' && !value.trim()) return `${label} is required.`
    if (Array.isArray(value) && value.length === 0) return `${label} is required.`
    if (value === false) return `${label} is required.`
    return ''
  }

export const minLength = (n, label = 'This field') => (value) =>
  value && value.trim().length < n ? `${label} must be at least ${n} characters.` : ''

export const maxLength = (n, label = 'This field') => (value) =>
  value && value.trim().length > n ? `${label} must be ${n} characters or fewer.` : ''

export const email = () => (value) =>
  value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
    ? 'Enter a valid email address, for example name@example.com.'
    : ''

export const numberRange = (min, max, label = 'Value') => (value) => {
  const n = Number(value)
  if (value === '' || Number.isNaN(n)) return `${label} must be a number.`
  if (n < min || n > max) return `${label} must be between ${min} and ${max}.`
  return ''
}
