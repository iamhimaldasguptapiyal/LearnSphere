<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import StarRating from '@/components/ui/StarRating.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import StateMessage from '@/components/ui/StateMessage.vue'
import LessonList from '@/components/features/LessonList.vue'
import EnrolmentForm from '@/components/features/EnrolmentForm.vue'
import { useCoursesStore } from '@/stores/courses'
import { useEnrolmentsStore } from '@/stores/enrolments'
import { useUiStore } from '@/stores/ui'

const props = defineProps({
  id: { type: String, required: true },
})

const store = useCoursesStore()
const enrolments = useEnrolmentsStore()
const ui = useUiStore()

const { isLoading, error, hasLoaded } = storeToRefs(store)

const course = computed(() => store.getCourseById(props.id))
const enrolment = computed(() => enrolments.enrolmentFor(props.id))
const enrolled = computed(() => !!enrolment.value)
const progress = computed(() =>
  course.value ? enrolments.progressFor(props.id, course.value.lessons.length) : 0,
)
const priceLabel = computed(() =>
  course.value?.price === 0 ? 'Free' : `$${course.value?.price ?? 0}`,
)

const modalOpen = ref(false)

function handleEnrol(payload) {
  enrolments.enrol(payload)
  modalOpen.value = false
  ui.notify(`You are enrolled in ${course.value.title}.`)
}

function handleUnenrol() {
  enrolments.unenrol(props.id)
  ui.notify('Enrolment removed. Your progress for this course was cleared.', 'info')
}

function handleToggleLesson(lessonId) {
  const done = enrolments.toggleLesson(props.id, lessonId)
  if (done && progress.value === 100) {
    ui.notify('Course complete. Nice work.', 'success')
  }
}

onMounted(() => store.load())
</script>

<template>
  <div class="container page">
    <!-- Loading -->
    <div v-if="isLoading" class="skeleton" aria-hidden="true">
      <div class="skeleton__bar skeleton__bar--crumb"></div>
      <div class="skeleton__bar skeleton__bar--title"></div>
      <div class="skeleton__bar skeleton__bar--text"></div>
      <div class="skeleton__bar skeleton__bar--block"></div>
    </div>
    <p v-if="isLoading" class="sr-only" role="status">Loading course details.</p>

    <!-- Request failed -->
    <StateMessage
      v-else-if="error"
      tone="error"
      title="We could not load this course"
      :message="error"
    >
      <BaseButton variant="secondary" @click="store.retry">Try again</BaseButton>
      <BaseButton :to="{ name: 'courses' }" variant="ghost">Back to catalogue</BaseButton>
    </StateMessage>

    <!-- Loaded, but the id does not exist -->
    <StateMessage
      v-else-if="hasLoaded && !course"
      icon="?"
      title="That course does not exist"
      :message="`We could not find a course with the id &quot;${id}&quot;. It may have been retired.`"
    >
      <BaseButton :to="{ name: 'courses' }">Browse all courses</BaseButton>
    </StateMessage>

    <!-- Course -->
    <article v-else-if="course" class="detail">
      <nav class="crumbs" aria-label="Breadcrumb">
        <RouterLink :to="{ name: 'courses' }">Courses</RouterLink>
        <span aria-hidden="true">/</span>
        <span class="crumbs__current" aria-current="page">{{ course.category }}</span>
      </nav>

      <header class="detail__head" :style="{ '--accent-course': course.accent }">
        <div class="detail__tags">
          <BaseBadge tone="accent">{{ course.level }}</BaseBadge>
          <BaseBadge v-for="tag in course.tags" :key="tag">{{ tag }}</BaseBadge>
          <BaseBadge v-if="enrolled" tone="success">Enrolled</BaseBadge>
        </div>

        <h1 class="detail__title">{{ course.title }}</h1>
        <p class="lead detail__summary">{{ course.summary }}</p>

        <div class="detail__meta">
          <StarRating :rating="course.rating" :reviews="course.reviews" />
          <span class="detail__dot" aria-hidden="true">·</span>
          <span>{{ course.students.toLocaleString() }} learners</span>
          <span class="detail__dot" aria-hidden="true">·</span>
          <span>{{ course.durationHours }} hours</span>
        </div>
      </header>

      <div class="detail__body">
        <div class="detail__main">
          <section aria-labelledby="about-heading" class="panel">
            <h2 id="about-heading">About this course</h2>
            <p>{{ course.description }}</p>

            <h3 class="panel__sub">What you will be able to do</h3>
            <ul class="outcomes">
              <li v-for="outcome in course.outcomes" :key="outcome" class="outcome">
                <span class="outcome__tick" aria-hidden="true">✓</span>
                <span>{{ outcome }}</span>
              </li>
            </ul>
          </section>

          <LessonList
            :lessons="course.lessons"
            :completed="enrolment?.completedLessons ?? []"
            :interactive="enrolled"
            @toggle="handleToggleLesson"
          />
        </div>

        <!-- Sticky enrolment panel -->
        <aside class="detail__aside" aria-labelledby="enrol-heading">
          <div class="enrol-card">
            <h2 id="enrol-heading" class="sr-only">Enrolment</h2>

            <p class="enrol-card__price" :class="{ 'enrol-card__price--free': course.price === 0 }">
              {{ priceLabel }}
            </p>

            <template v-if="enrolled">
              <ProgressBar :value="progress" label="Your progress" />
              <p class="enrol-card__note">
                {{ enrolment.completedLessons.length }} of {{ course.lessons.length }} lessons
                complete. Tick lessons off in the list to update this.
              </p>
              <BaseButton :to="{ name: 'my-learning' }" block>Go to my learning</BaseButton>
              <BaseButton variant="danger" block @click="handleUnenrol">
                Leave this course
              </BaseButton>
            </template>

            <template v-else>
              <p class="enrol-card__note">
                Enrol to unlock lesson tracking and add this course to your dashboard.
              </p>
              <BaseButton block size="lg" @click="modalOpen = true">Enrol now</BaseButton>
            </template>

            <dl class="enrol-card__facts">
              <div>
                <dt>Instructor</dt>
                <dd>{{ course.instructor }}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{{ course.instructorRole }}</dd>
              </div>
              <div>
                <dt>Lessons</dt>
                <dd>{{ course.lessons.length }}</dd>
              </div>
              <div>
                <dt>Level</dt>
                <dd>{{ course.level }}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <BaseModal
        :open="modalOpen"
        :title="`Enrol in ${course.title}`"
        description="Confirm your details and tell us what you want to achieve."
        @close="modalOpen = false"
      >
        <EnrolmentForm :course="course" @submit="handleEnrol" @cancel="modalOpen = false" />
      </BaseModal>
    </article>
  </div>
</template>

<style scoped>
/* ---- Loading placeholder ---- */
.skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.skeleton__bar {
  border-radius: var(--r-md);
  background: var(--surface-2);
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton__bar--crumb {
  height: 14px;
  width: 160px;
}
.skeleton__bar--title {
  height: 38px;
  width: min(100%, 620px);
}
.skeleton__bar--text {
  height: 16px;
  width: min(100%, 460px);
}
.skeleton__bar--block {
  height: 320px;
  width: 100%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}

/* ---- Breadcrumb ---- */
.crumbs {
  display: flex;
  gap: var(--sp-2);
  align-items: center;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: var(--sp-4);
}

.crumbs__current {
  color: var(--text-muted);
}

/* ---- Header ---- */
.detail__head {
  padding-bottom: var(--sp-5);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--sp-5);
}

.detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-bottom: var(--sp-3);
}

.detail__title {
  margin-bottom: var(--sp-3);
  text-wrap: balance;
}

.detail__summary {
  margin-bottom: var(--sp-4);
}

.detail__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.detail__dot {
  opacity: 0.6;
}

/* ---- Body layout ---- */
.detail__body {
  display: grid;
  gap: var(--sp-5);
  grid-template-columns: 1fr;
  align-items: start;
}

.detail__main {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  min-width: 0;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
}

.panel h2 {
  margin-top: 0;
  font-size: 1.0625rem;
}

.panel__sub {
  margin-top: var(--sp-5);
  font-size: 0.9375rem;
}

.panel p {
  color: var(--text-muted);
  margin-bottom: 0;
}

.outcomes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--sp-3);
}

.outcome {
  display: flex;
  gap: var(--sp-3);
  align-items: flex-start;
  font-size: 0.9375rem;
}

.outcome__tick {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  border-radius: var(--r-full);
  background: var(--success-soft);
  color: var(--success);
  font-size: 0.6875rem;
  font-weight: 800;
}

/* ---- Enrolment panel ---- */
.enrol-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
  box-shadow: var(--shadow-sm);
}

.enrol-card__price {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.enrol-card__price--free {
  color: var(--success);
}

.enrol-card__note {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.enrol-card__facts {
  margin: var(--sp-2) 0 0;
  padding-top: var(--sp-4);
  border-top: 1px solid var(--border);
  display: grid;
  gap: var(--sp-3);
  font-size: 0.875rem;
}

.enrol-card__facts > div {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-3);
}

.enrol-card__facts dt {
  color: var(--text-muted);
}

.enrol-card__facts dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}

@media (min-width: 940px) {
  .detail__body {
    grid-template-columns: minmax(0, 1fr) 330px;
    gap: var(--sp-6);
  }

  .detail__aside {
    position: sticky;
    top: calc(var(--header-h) + var(--sp-4));
  }
}
</style>
