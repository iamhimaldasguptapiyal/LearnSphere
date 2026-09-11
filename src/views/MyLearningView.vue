<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import ProgressDonut from '@/components/ui/ProgressDonut.vue'
import StatTile from '@/components/ui/StatTile.vue'
import StateMessage from '@/components/ui/StateMessage.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { useCoursesStore } from '@/stores/courses'
import { useEnrolmentsStore } from '@/stores/enrolments'
import { useUiStore } from '@/stores/ui'

const store = useCoursesStore()
const enrolments = useEnrolmentsStore()
const ui = useUiStore()

const { isLoading, error } = storeToRefs(store)

const filter = ref('all')
const confirmOpen = ref(false)

/**
 * Join the learner's enrolment records to the catalogue. Doing it here rather
 * than storing course data inside each enrolment keeps a single source of
 * truth: if a course changes, this view picks the change up automatically.
 */
const enrolledCourses = computed(() =>
  enrolments.items
    .map((enrolment) => {
      const course = store.getCourseById(enrolment.courseId)
      if (!course) return null
      const total = course.lessons.length
      const done = enrolment.completedLessons.length
      return {
        course,
        enrolment,
        done,
        total,
        percent: total ? Math.round((done / total) * 100) : 0,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.percent - a.percent),
)

const completed = computed(() => enrolledCourses.value.filter((e) => e.percent === 100))
const inProgress = computed(() => enrolledCourses.value.filter((e) => e.percent > 0 && e.percent < 100))
const notStarted = computed(() => enrolledCourses.value.filter((e) => e.percent === 0))

const visible = computed(() => {
  if (filter.value === 'in-progress') return inProgress.value
  if (filter.value === 'completed') return completed.value
  if (filter.value === 'not-started') return notStarted.value
  return enrolledCourses.value
})

const overallPercent = computed(() => {
  const totals = enrolledCourses.value.reduce(
    (acc, e) => ({ done: acc.done + e.done, total: acc.total + e.total }),
    { done: 0, total: 0 },
  )
  return totals.total ? Math.round((totals.done / totals.total) * 100) : 0
})

const hoursCommitted = computed(() =>
  enrolledCourses.value.reduce((sum, e) => sum + e.course.durationHours, 0),
)

const tabs = computed(() => [
  { key: 'all', label: 'All', count: enrolledCourses.value.length },
  { key: 'in-progress', label: 'In progress', count: inProgress.value.length },
  { key: 'completed', label: 'Completed', count: completed.value.length },
  { key: 'not-started', label: 'Not started', count: notStarted.value.length },
])

function removeCourse(courseId, title) {
  enrolments.unenrol(courseId)
  ui.notify(`Removed ${title} from your learning.`, 'info')
}

function resetEverything() {
  enrolments.resetAll()
  confirmOpen.value = false
  ui.notify('All enrolments and progress cleared.', 'info')
}

onMounted(() => store.load())
</script>

<template>
  <div class="container page">
    <header class="head">
      <div>
        <h1>My learning</h1>
        <p class="lead">
          Everything you have enrolled in, with the progress you have made. Your records are saved
          in this browser.
        </p>
      </div>
      <BaseButton
        v-if="enrolments.count"
        variant="ghost"
        size="sm"
        @click="confirmOpen = true"
      >
        Reset all progress
      </BaseButton>
    </header>

    <SkeletonCard v-if="isLoading" :count="3" />

    <StateMessage
      v-else-if="error"
      tone="error"
      title="We could not load your courses"
      :message="error"
    >
      <BaseButton variant="secondary" @click="store.retry">Try again</BaseButton>
    </StateMessage>

    <StateMessage
      v-else-if="enrolledCourses.length === 0"
      icon="+"
      title="You have not enrolled in anything yet"
      message="Find a course in the catalogue and enrol to start tracking your progress here."
    >
      <BaseButton :to="{ name: 'courses' }">Browse courses</BaseButton>
    </StateMessage>

    <template v-else>
      <!-- Summary -->
      <section class="summary" aria-labelledby="summary-heading">
        <h2 id="summary-heading" class="sr-only">Progress summary</h2>

        <div class="summary__donut">
          <ProgressDonut :value="overallPercent" label="Lessons completed overall" />
        </div>

        <div class="summary__tiles">
          <StatTile label="Enrolled" :value="enrolments.count" caption="Active courses" />
          <StatTile label="Completed" :value="completed.length" caption="Finished end to end" />
          <StatTile
            label="Lessons done"
            :value="enrolments.totalLessonsCompleted"
            caption="Across all courses"
          />
          <StatTile label="Hours committed" :value="`${hoursCommitted}h`" caption="Total course length" />
        </div>
      </section>

      <!-- Filter tabs -->
      <!--
        Toggle buttons rather than an ARIA tablist: there is one shared list
        below, not a panel per tab, so aria-pressed describes what is really
        happening.
      -->
      <div class="tabs" role="group" aria-label="Filter courses by status">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab"
          :class="{ 'tab--active': filter === tab.key }"
          :aria-pressed="filter === tab.key"
          @click="filter = tab.key"
        >
          {{ tab.label }}
          <span class="tab__count">{{ tab.count }}</span>
        </button>
      </div>

      <StateMessage
        v-if="visible.length === 0"
        icon="·"
        title="Nothing in this group yet"
        message="Switch to another tab, or tick some lessons off to move a course along."
      />

      <ul v-else class="enrolled">
        <li v-for="entry in visible" :key="entry.course.id" class="enrolled__item">
          <div class="enrolled__top">
            <div class="enrolled__info">
              <div class="enrolled__badges">
                <BaseBadge tone="neutral">{{ entry.course.category }}</BaseBadge>
                <BaseBadge v-if="entry.percent === 100" tone="success">Completed</BaseBadge>
                <BaseBadge v-else-if="entry.percent > 0" tone="accent">In progress</BaseBadge>
              </div>

              <h3 class="enrolled__title">
                <RouterLink :to="{ name: 'course-detail', params: { id: entry.course.id } }">
                  {{ entry.course.title }}
                </RouterLink>
              </h3>

              <p class="enrolled__meta">
                {{ entry.done }} of {{ entry.total }} lessons · {{ entry.course.instructor }}
              </p>

              <p v-if="entry.enrolment.goal" class="enrolled__goal">
                <span class="enrolled__goal-label">Your goal:</span> {{ entry.enrolment.goal }}
              </p>
            </div>

            <div class="enrolled__actions">
              <BaseButton
                :to="{ name: 'course-detail', params: { id: entry.course.id } }"
                size="sm"
                :variant="entry.percent === 100 ? 'secondary' : 'primary'"
              >
                {{ entry.percent === 100 ? 'Review' : entry.percent === 0 ? 'Start' : 'Continue' }}
              </BaseButton>
              <BaseButton
                variant="ghost"
                size="sm"
                @click="removeCourse(entry.course.id, entry.course.title)"
              >
                Remove
              </BaseButton>
            </div>
          </div>

          <ProgressBar :value="entry.percent" label="Progress" size="sm" />
        </li>
      </ul>
    </template>

    <BaseModal
      :open="confirmOpen"
      title="Reset all progress?"
      description="This removes every enrolment and the lessons you have ticked off."
      @close="confirmOpen = false"
    >
      <p class="confirm">
        You currently have <strong>{{ enrolments.count }}</strong> enrolments and
        <strong>{{ enrolments.totalLessonsCompleted }}</strong> completed lessons. This cannot be
        undone.
      </p>

      <template #footer>
        <BaseButton variant="secondary" @click="confirmOpen = false">Keep my progress</BaseButton>
        <BaseButton variant="danger" @click="resetEverything">Yes, reset everything</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--sp-5);
}

.head h1 {
  margin-bottom: var(--sp-2);
}

/* ---- Summary ---- */
.summary {
  display: grid;
  gap: var(--sp-4);
  grid-template-columns: 1fr;
  align-items: center;
  padding: var(--sp-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  margin-bottom: var(--sp-5);
}

.summary__donut {
  display: flex;
  justify-content: center;
}

.summary__tiles {
  display: grid;
  gap: var(--sp-3);
  grid-template-columns: repeat(2, 1fr);
}

/* ---- Tabs ---- */
.tabs {
  display: flex;
  gap: var(--sp-2);
  overflow-x: auto;
  padding-bottom: var(--sp-2);
  margin-bottom: var(--sp-4);
  scrollbar-width: thin;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0.45rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--r-full);
  background: var(--surface);
  color: var(--text-muted);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.tab:hover {
  color: var(--text);
  background: var(--surface-2);
}

.tab--active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.tab__count {
  font-size: 0.75rem;
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
}

/* ---- Enrolled list ---- */
.enrolled {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--sp-3);
}

.enrolled__item {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
}

.enrolled__top {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  justify-content: space-between;
}

.enrolled__badges {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
  margin-bottom: var(--sp-2);
}

.enrolled__title {
  margin: 0 0 var(--sp-1);
  font-size: 1.0625rem;
}

.enrolled__title a {
  color: var(--text);
}

.enrolled__title a:hover {
  color: var(--accent);
  text-decoration: none;
}

.enrolled__meta {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.enrolled__goal {
  margin: var(--sp-2) 0 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
  padding: var(--sp-2) var(--sp-3);
  background: var(--surface-2);
  border-radius: var(--r-md);
  border-left: 3px solid var(--accent);
}

.enrolled__goal-label {
  font-weight: 700;
  color: var(--text);
}

.enrolled__actions {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
  align-items: flex-start;
}

.confirm {
  margin: 0;
  color: var(--text-muted);
}

@media (min-width: 720px) {
  .summary {
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--sp-6);
  }

  .summary__tiles {
    grid-template-columns: repeat(4, 1fr);
  }

  .enrolled__top {
    flex-direction: row;
    align-items: flex-start;
  }
}
</style>
