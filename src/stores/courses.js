import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchCourses } from '@/services/courseService'

/**
 * Owns the course catalogue: the raw records plus the request lifecycle
 * (idle / loading / error) that the views render around.
 *
 * Filtering is deliberately NOT here — it is view-local concern handled by
 * the useCourseFilters composable, so the store stays a single source of
 * truth for server data rather than a dumping ground for UI state.
 */
export const useCoursesStore = defineStore('courses', () => {
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const hasLoaded = ref(false)

  /** Set true to make the next load fail — powers the error-state demo. */
  const simulateFailure = ref(false)

  const categories = computed(() => [...new Set(items.value.map((c) => c.category))].sort())

  const levels = computed(() => {
    const order = ['Beginner', 'Intermediate', 'Advanced']
    const present = new Set(items.value.map((c) => c.level))
    return order.filter((l) => present.has(l))
  })

  const featured = computed(() => [...items.value].sort((a, b) => b.rating - a.rating).slice(0, 3))

  const totalStudents = computed(() => items.value.reduce((sum, c) => sum + c.students, 0))

  const getCourseById = computed(() => (id) => items.value.find((c) => c.id === id) ?? null)

  /**
   * Load the catalogue. Safe to call from several views: it will not refetch
   * data that is already in memory unless `force` is passed.
   */
  async function load({ force = false } = {}) {
    if (isLoading.value) return
    if (hasLoaded.value && !force) return

    isLoading.value = true
    error.value = null

    try {
      items.value = await fetchCourses({ shouldFail: simulateFailure.value })
      hasLoaded.value = true
    } catch (err) {
      error.value = err.message || 'Something went wrong while loading courses.'
      items.value = []
      hasLoaded.value = false
    } finally {
      isLoading.value = false
    }
  }

  function retry() {
    simulateFailure.value = false
    return load({ force: true })
  }

  function breakNextLoad() {
    simulateFailure.value = true
    return load({ force: true })
  }

  return {
    items,
    isLoading,
    error,
    hasLoaded,
    simulateFailure,
    categories,
    levels,
    featured,
    totalStudents,
    getCourseById,
    load,
    retry,
    breakNextLoad,
  }
})
