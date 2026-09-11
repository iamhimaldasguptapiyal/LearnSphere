/**
 * Data access layer.
 *
 * Every network call the application makes goes through this module, so if the
 * mock JSON is later swapped for a real backend only this file changes. The
 * artificial latency is intentional: it lets the loading skeletons be seen and
 * assessed rather than flashing past in a single frame.
 */

const ENDPOINT = `${import.meta.env.BASE_URL}data/courses.json`
const LATENCY_MS = 700

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * @param {{ shouldFail?: boolean, signal?: AbortSignal }} options
 * @returns {Promise<Array>} the course catalogue
 */
export async function fetchCourses({ shouldFail = false, signal } = {}) {
  await delay(LATENCY_MS)

  if (shouldFail) {
    throw new Error('The course service is not responding. Please try again.')
  }

  const response = await fetch(ENDPOINT, { signal })

  if (!response.ok) {
    throw new Error(`Could not load courses (HTTP ${response.status}).`)
  }

  const data = await response.json()

  if (!Array.isArray(data)) {
    throw new Error('The course service returned an unexpected response.')
  }

  return data
}
