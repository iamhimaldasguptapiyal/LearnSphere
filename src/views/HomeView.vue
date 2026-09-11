<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatTile from '@/components/ui/StatTile.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import StateMessage from '@/components/ui/StateMessage.vue'
import CourseCard from '@/components/features/CourseCard.vue'
import { useCoursesStore } from '@/stores/courses'
import { useEnrolmentsStore } from '@/stores/enrolments'

const courses = useCoursesStore()
const enrolments = useEnrolmentsStore()

// storeToRefs keeps reactivity when pulling state out of the store.
const { isLoading, error, featured, items, totalStudents } = storeToRefs(courses)

const studentLabel = computed(() =>
  totalStudents.value >= 1000
    ? `${Math.round(totalStudents.value / 1000)}k+`
    : String(totalStudents.value),
)

const principles = [
  {
    title: 'Learn by building',
    body: 'Every course ends with a project you can put in front of an employer, not a certificate of attendance.',
  },
  {
    title: 'Track what you finish',
    body: 'Tick lessons off as you go and watch a real completion figure move, saved between visits.',
  },
  {
    title: 'Taught by practitioners',
    body: 'Instructors are working engineers, designers and researchers describing what they actually do.',
  },
]
</script>

<template>
  <div class="page">
    <!-- Hero -->
    <section class="hero">
      <div class="container hero__inner">
        <p class="hero__eyebrow">Frontend, design and data · self-paced</p>
        <h1 class="hero__title">
          Learn the skills the job description
          <span class="hero__accent">actually asks for</span>
        </h1>
        <p class="lead hero__lead">
          LearnSphere brings short, practical courses together in one place so you can find the
          right one, enrol in a minute, and keep track of everything you have finished.
        </p>

        <div class="hero__actions">
          <BaseButton :to="{ name: 'courses' }" size="lg">Browse the catalogue</BaseButton>
          <BaseButton :to="{ name: 'my-learning' }" variant="secondary" size="lg">
            {{ enrolments.count ? 'Continue learning' : 'See how progress works' }}
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- Headline numbers -->
    <section class="container stats" aria-label="Platform at a glance">
      <StatTile
        label="Courses"
        :value="isLoading ? '—' : items.length"
        caption="Across four subject areas"
      />
      <StatTile
        label="Learners"
        :value="isLoading ? '—' : studentLabel"
        caption="Enrolled worldwide"
      />
      <StatTile
        label="Your enrolments"
        :value="enrolments.count"
        caption="Saved on this device"
      />
      <StatTile
        label="Lessons completed"
        :value="enrolments.totalLessonsCompleted"
        caption="Keep the streak going"
      />
    </section>

    <!-- Featured -->
    <section class="container featured" aria-labelledby="featured-heading">
      <div class="section-head">
        <div>
          <h2 id="featured-heading">Highest rated right now</h2>
          <p class="muted featured__sub">The three courses learners score most highly.</p>
        </div>
        <BaseButton :to="{ name: 'courses' }" variant="ghost" size="sm">
          View all courses →
        </BaseButton>
      </div>

      <SkeletonCard v-if="isLoading" :count="3" />

      <StateMessage
        v-else-if="error"
        tone="error"
        title="We could not load the courses"
        :message="error"
      >
        <BaseButton variant="secondary" @click="courses.retry">Try again</BaseButton>
      </StateMessage>

      <div v-else class="grid-cards">
        <CourseCard v-for="course in featured" :key="course.id" :course="course" />
      </div>
    </section>

    <!-- Principles -->
    <section class="container principles" aria-labelledby="principles-heading">
      <h2 id="principles-heading">Why learners stay</h2>
      <ul class="principles__list">
        <li v-for="(p, i) in principles" :key="p.title" class="principle">
          <span class="principle__num" aria-hidden="true">0{{ i + 1 }}</span>
          <h3 class="principle__title">{{ p.title }}</h3>
          <p class="principle__body">{{ p.body }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page {
  padding-block: 0 var(--sp-8);
}

/* ---- Hero ---- */
.hero {
  background:
    radial-gradient(900px 380px at 12% -10%, var(--accent-soft), transparent 70%),
    var(--bg);
  border-bottom: 1px solid var(--border);
  padding-block: var(--sp-7) var(--sp-7);
}

.hero__inner {
  max-width: 780px;
  margin-inline: auto;
  text-align: center;
}

.hero__eyebrow {
  margin: 0 0 var(--sp-3);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
}

.hero__title {
  margin-bottom: var(--sp-4);
  text-wrap: balance;
}

.hero__accent {
  color: var(--accent);
}

.hero__lead {
  margin-inline: auto;
}

.hero__actions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-top: var(--sp-5);
}

/* ---- Stats ---- */
.stats {
  display: grid;
  gap: var(--sp-3);
  grid-template-columns: repeat(2, 1fr);
  margin-top: calc(var(--sp-6) * -1 + 8px);
  position: relative;
  z-index: 1;
  padding-top: var(--sp-6);
}

/* ---- Sections ---- */
.featured,
.principles {
  margin-top: var(--sp-7);
}

.featured__sub {
  margin: 0;
  font-size: 0.9375rem;
}

.principles__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--sp-4);
  grid-template-columns: 1fr;
}

.principle {
  padding: var(--sp-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
}

.principle__num {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: var(--sp-2);
}

.principle__title {
  margin: 0 0 var(--sp-2);
  font-size: 1rem;
}

.principle__body {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-muted);
}

@media (min-width: 640px) {
  .hero__actions {
    flex-direction: row;
    justify-content: center;
  }
}

@media (min-width: 900px) {
  .stats {
    grid-template-columns: repeat(4, 1fr);
  }

  .principles__list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
