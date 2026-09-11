import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'learnsphere:enrolments'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * The learner's own records: which courses they joined and which lessons they
 * have ticked off. Persisted to localStorage so progress survives a refresh,
 * which is what makes the progress dashboard feel real.
 *
 * An enrolment is:
 *   { courseId, enrolledAt, goal, experience, completedLessons: string[] }
 */
export const useEnrolmentsStore = defineStore('enrolments', () => {
  const items = ref(loadFromStorage())

  const count = computed(() => items.value.length)

  const isEnrolled = computed(() => (courseId) => items.value.some((e) => e.courseId === courseId))

  const enrolmentFor = computed(
    () => (courseId) => items.value.find((e) => e.courseId === courseId) ?? null,
  )

  const enrolledCourseIds = computed(() => items.value.map((e) => e.courseId))

  /** Completion percentage for one course, 0–100. */
  const progressFor = computed(() => (courseId, totalLessons) => {
    if (!totalLessons) return 0
    const enrolment = items.value.find((e) => e.courseId === courseId)
    if (!enrolment) return 0
    return Math.round((enrolment.completedLessons.length / totalLessons) * 100)
  })

  const totalLessonsCompleted = computed(() =>
    items.value.reduce((sum, e) => sum + e.completedLessons.length, 0),
  )

  function enrol({ courseId, goal = '', experience = 'Beginner' }) {
    if (isEnrolled.value(courseId)) return false
    items.value.push({
      courseId,
      goal,
      experience,
      enrolledAt: new Date().toISOString(),
      completedLessons: [],
    })
    return true
  }

  function unenrol(courseId) {
    items.value = items.value.filter((e) => e.courseId !== courseId)
  }

  /** Tick a lesson on or off. Returns the new completed state. */
  function toggleLesson(courseId, lessonId) {
    const enrolment = items.value.find((e) => e.courseId === courseId)
    if (!enrolment) return false

    const index = enrolment.completedLessons.indexOf(lessonId)
    if (index === -1) {
      enrolment.completedLessons.push(lessonId)
      return true
    }
    enrolment.completedLessons.splice(index, 1)
    return false
  }

  function resetAll() {
    items.value = []
  }

  watch(
    items,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* storage full or blocked — progress simply will not persist */
      }
    },
    { deep: true },
  )

  return {
    items,
    count,
    isEnrolled,
    enrolmentFor,
    enrolledCourseIds,
    progressFor,
    totalLessonsCompleted,
    enrol,
    unenrol,
    toggleLesson,
    resetAll,
  }
})
