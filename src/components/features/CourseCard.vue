<script setup>
import { computed } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import StarRating from '@/components/ui/StarRating.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useEnrolmentsStore } from '@/stores/enrolments'

const props = defineProps({
  course: { type: Object, required: true },
  showProgress: { type: Boolean, default: false },
})

const enrolments = useEnrolmentsStore()

const enrolled = computed(() => enrolments.isEnrolled(props.course.id))
const progress = computed(() =>
  enrolments.progressFor(props.course.id, props.course.lessons.length),
)
const priceLabel = computed(() => (props.course.price === 0 ? 'Free' : `$${props.course.price}`))
</script>

<template>
  <article class="card" :style="{ '--card-accent': course.accent }">
    <div class="card__top">
      <BaseBadge tone="neutral">{{ course.category }}</BaseBadge>
      <BaseBadge v-if="enrolled" tone="success">Enrolled</BaseBadge>
    </div>

    <h3 class="card__title">
      <!--
        The whole card is clickable via the stretched pseudo-element on this
        link, which keeps a single, properly-labelled link in the tab order
        instead of nesting interactive elements.
      -->
      <RouterLink :to="{ name: 'course-detail', params: { id: course.id } }" class="card__link">
        {{ course.title }}
      </RouterLink>
    </h3>

    <p class="card__summary">{{ course.summary }}</p>

    <p class="card__meta">
      <span>{{ course.instructor }}</span>
      <span aria-hidden="true">·</span>
      <span>{{ course.level }}</span>
      <span aria-hidden="true">·</span>
      <span>{{ course.durationHours }}h</span>
    </p>

    <ProgressBar
      v-if="showProgress && enrolled"
      class="card__progress"
      :value="progress"
      label="Course progress"
      size="sm"
    />

    <footer class="card__foot">
      <StarRating :rating="course.rating" :reviews="course.reviews" />
      <span class="card__price" :class="{ 'card__price--free': course.price === 0 }">
        {{ priceLabel }}
      </span>
    </footer>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

/* A coloured rule ties the card to the course's own accent without relying on
   colour alone to convey any information. */
.card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  border-radius: var(--r-lg) var(--r-lg) 0 0;
  background: var(--card-accent, var(--accent));
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--card-accent, var(--accent));
}

.card:focus-within {
  border-color: var(--accent);
}

.card__top {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
  margin-top: var(--sp-1);
}

.card__title {
  margin: 0;
  font-size: 1.0625rem;
  line-height: 1.35;
}

.card__link {
  color: var(--text);
}

.card__link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--r-lg);
}

.card__link:hover {
  color: var(--accent);
  text-decoration: none;
}

.card__summary {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__meta {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.card__progress {
  margin-top: var(--sp-1);
}

.card__foot {
  margin-top: auto;
  padding-top: var(--sp-3);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
}

.card__price {
  font-weight: 700;
  font-size: 0.9375rem;
}

.card__price--free {
  color: var(--success);
}
</style>
