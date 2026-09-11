import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'learnsphere:profile'

const DEFAULT_PROFILE = {
  fullName: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  headline: 'Frontend developer in training',
  weeklyGoalHours: 5,
  interests: ['Web Development'],
  emailUpdates: true,
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_PROFILE }
  } catch {
    return { ...DEFAULT_PROFILE }
  }
}

/** The learner's own account details, edited through the profile form. */
export const useProfileStore = defineStore('profile', () => {
  const profile = ref(loadFromStorage())

  const initials = computed(() =>
    profile.value.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  )

  function update(changes) {
    profile.value = { ...profile.value, ...changes }
  }

  watch(
    profile,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* non-fatal */
      }
    },
    { deep: true },
  )

  return { profile, initials, update }
})
