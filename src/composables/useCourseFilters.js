import { computed, ref, watch } from 'vue'

const SORTS = {
  popular: (a, b) => b.students - a.students,
  rating: (a, b) => b.rating - a.rating,
  shortest: (a, b) => a.durationHours - b.durationHours,
  'a-z': (a, b) => a.title.localeCompare(b.title),
}

/**
 * Search, filter and sort a list of courses.
 *
 * This is view-local state, so it lives in a composable rather than the Pinia
 * store: two views could filter the same catalogue independently without
 * treading on each other. The search term is debounced so that typing does not
 * re-run the filter on every keystroke.
 *
 * @param {import('vue').Ref<Array>} source reactive list of courses
 */
export function useCourseFilters(source) {
  const search = ref('')
  const debouncedSearch = ref('')
  const category = ref('All')
  const level = ref('All')
  const freeOnly = ref(false)
  const sortBy = ref('popular')

  let timer
  watch(search, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debouncedSearch.value = value.trim().toLowerCase()
    }, 250)
  })

  const results = computed(() => {
    const term = debouncedSearch.value
    const list = source.value.filter((course) => {
      if (category.value !== 'All' && course.category !== category.value) return false
      if (level.value !== 'All' && course.level !== level.value) return false
      if (freeOnly.value && course.price !== 0) return false
      if (!term) return true

      const haystack = [course.title, course.summary, course.instructor, ...course.tags]
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })

    return list.sort(SORTS[sortBy.value] ?? SORTS.popular)
  })

  const activeFilterCount = computed(() => {
    let n = 0
    if (category.value !== 'All') n++
    if (level.value !== 'All') n++
    if (freeOnly.value) n++
    if (debouncedSearch.value) n++
    return n
  })

  const hasActiveFilters = computed(() => activeFilterCount.value > 0)

  function reset() {
    search.value = ''
    debouncedSearch.value = ''
    category.value = 'All'
    level.value = 'All'
    freeOnly.value = false
    sortBy.value = 'popular'
  }

  return {
    search,
    category,
    level,
    freeOnly,
    sortBy,
    results,
    activeFilterCount,
    hasActiveFilters,
    reset,
  }
}
