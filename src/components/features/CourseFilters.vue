<script setup>
import { useId } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

/**
 * The filter toolbar. It owns no state of its own: every control is bound with
 * defineModel back to the useCourseFilters composable in the parent view, so
 * this component stays purely presentational and reusable.
 */
defineProps({
  categories: { type: Array, required: true },
  levels: { type: Array, required: true },
  resultCount: { type: Number, required: true },
  hasActiveFilters: { type: Boolean, default: false },
})

defineEmits(['reset'])

const search = defineModel('search', { type: String, required: true })
const category = defineModel('category', { type: String, required: true })
const level = defineModel('level', { type: String, required: true })
const freeOnly = defineModel('freeOnly', { type: Boolean, required: true })
const sortBy = defineModel('sortBy', { type: String, required: true })

const uid = useId()
const id = (name) => `${name}-${uid}`
</script>

<template>
  <section class="filters" aria-labelledby="filters-heading">
    <h2 id="filters-heading" class="sr-only">Filter and sort courses</h2>

    <div class="filters__row">
      <div class="filters__group filters__group--search">
        <label class="filters__label" :for="id('search')">Search</label>
        <input
          :id="id('search')"
          v-model="search"
          class="control"
          type="search"
          placeholder="Search by title, topic or instructor"
          autocomplete="off"
        />
      </div>

      <div class="filters__group">
        <label class="filters__label" :for="id('category')">Category</label>
        <select :id="id('category')" v-model="category" class="control">
          <option value="All">All categories</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="filters__group">
        <label class="filters__label" :for="id('level')">Level</label>
        <select :id="id('level')" v-model="level" class="control">
          <option value="All">All levels</option>
          <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
        </select>
      </div>

      <div class="filters__group">
        <label class="filters__label" :for="id('sort')">Sort by</label>
        <select :id="id('sort')" v-model="sortBy" class="control">
          <option value="popular">Most popular</option>
          <option value="rating">Highest rated</option>
          <option value="shortest">Shortest first</option>
          <option value="a-z">Title A–Z</option>
        </select>
      </div>
    </div>

    <div class="filters__row filters__row--foot">
      <label class="switch">
        <input v-model="freeOnly" type="checkbox" class="switch__input" />
        <span class="switch__track" aria-hidden="true"><span class="switch__thumb"></span></span>
        <span class="switch__text">Free courses only</span>
      </label>

      <div class="filters__result" role="status" aria-live="polite">
        <strong>{{ resultCount }}</strong>
        {{ resultCount === 1 ? 'course' : 'courses' }} found
      </div>

      <BaseButton v-if="hasActiveFilters" variant="ghost" size="sm" @click="$emit('reset')">
        Clear filters
      </BaseButton>
    </div>
  </section>
</template>

<style scoped>
.filters {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-4);
  margin-bottom: var(--sp-5);
  box-shadow: var(--shadow-sm);
}

.filters__row {
  display: grid;
  gap: var(--sp-3);
  grid-template-columns: 1fr;
}

.filters__row--foot {
  margin-top: var(--sp-4);
  padding-top: var(--sp-4);
  border-top: 1px solid var(--border);
  align-items: center;
}

.filters__group {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.filters__label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.filters__result {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.filters__result strong {
  color: var(--text);
}

/* ---- Toggle switch ---- */
.switch {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
}

.switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch__track {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: var(--r-full);
  background: var(--surface-2);
  border: 1px solid var(--border);
  transition: background-color 0.18s ease;
  flex-shrink: 0;
}

.switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: var(--r-full);
  background: var(--text-muted);
  transition: transform 0.18s ease;
}

.switch__input:checked + .switch__track {
  background: var(--accent);
  border-color: var(--accent);
}

.switch__input:checked + .switch__track .switch__thumb {
  background: var(--on-accent);
  transform: translateX(18px);
}

.switch__input:focus-visible + .switch__track {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

@media (min-width: 700px) {
  .filters__row {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }

  .filters__row--foot {
    grid-template-columns: auto 1fr auto;
    justify-items: start;
  }

  .filters__row--foot .filters__result {
    justify-self: end;
  }
}
</style>
