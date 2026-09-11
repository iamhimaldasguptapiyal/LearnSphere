<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import StateMessage from '@/components/ui/StateMessage.vue'
import CourseCard from '@/components/features/CourseCard.vue'
import CourseFilters from '@/components/features/CourseFilters.vue'
import { useCoursesStore } from '@/stores/courses'
import { useCourseFilters } from '@/composables/useCourseFilters'

const store = useCoursesStore()
const { items, isLoading, error, categories, levels } = storeToRefs(store)

// Filtering is local to this view, so it lives in a composable driven by the
// store's data rather than in the store itself.
const { search, category, level, freeOnly, sortBy, results, hasActiveFilters, reset } =
  useCourseFilters(items)

onMounted(() => store.load())
</script>

<template>
  <div class="container page">
    <header class="head">
      <h1>Browse courses</h1>
      <p class="lead">
        Twelve self-paced courses in web development, design, data and career skills. Filter by
        subject, level or price to find the one that fits.
      </p>
    </header>

    <CourseFilters
      v-model:search="search"
      v-model:category="category"
      v-model:level="level"
      v-model:freeOnly="freeOnly"
      v-model:sortBy="sortBy"
      :categories="categories"
      :levels="levels"
      :result-count="results.length"
      :has-active-filters="hasActiveFilters"
      @reset="reset"
    />

    <!-- Loading -->
    <template v-if="isLoading">
      <p class="sr-only" role="status">Loading courses, please wait.</p>
      <SkeletonCard :count="6" />
    </template>

    <!-- Request failed -->
    <StateMessage
      v-else-if="error"
      tone="error"
      title="We could not load the catalogue"
      :message="error"
    >
      <BaseButton variant="secondary" @click="store.retry">Try again</BaseButton>
    </StateMessage>

    <!-- Loaded, but nothing matches the filters -->
    <StateMessage
      v-else-if="results.length === 0"
      icon="?"
      title="No courses match those filters"
      message="Try a different subject or level, or clear the filters to see everything again."
    >
      <BaseButton variant="secondary" @click="reset">Clear all filters</BaseButton>
    </StateMessage>

    <!-- Results -->
    <TransitionGroup v-else name="fade" tag="div" class="grid-cards">
      <CourseCard v-for="course in results" :key="course.id" :course="course" show-progress />
    </TransitionGroup>

    <!-- A deliberate hook for demonstrating the error path during assessment. -->
    <p class="demo">
      <button type="button" class="demo__link" @click="store.breakNextLoad">
        Simulate a failed request
      </button>
      to see how the application handles a service outage.
    </p>
  </div>
</template>

<style scoped>
.head {
  margin-bottom: var(--sp-5);
}

.head h1 {
  margin-bottom: var(--sp-2);
}

.demo {
  margin-top: var(--sp-6);
  padding-top: var(--sp-4);
  border-top: 1px dashed var(--border);
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-align: center;
}

.demo__link {
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  color: var(--accent);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}
</style>
