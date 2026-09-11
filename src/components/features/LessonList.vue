<script setup>
import { computed } from 'vue'

const props = defineProps({
  lessons: { type: Array, required: true },
  completed: { type: Array, default: () => [] },
  interactive: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

const isDone = (id) => props.completed.includes(id)

const totalMinutes = computed(() => props.lessons.reduce((sum, l) => sum + l.minutes, 0))
</script>

<template>
  <div class="lessons">
    <div class="lessons__head">
      <h2 class="lessons__title">Course content</h2>
      <p class="lessons__meta">
        {{ lessons.length }} lessons · {{ Math.round(totalMinutes / 60) }}h
        {{ totalMinutes % 60 }}m total
      </p>
    </div>

    <ol class="lessons__list">
      <li v-for="(lesson, index) in lessons" :key="lesson.id" class="lesson">
        <!-- When enrolled each row becomes a real checkbox so progress can be
             ticked with the keyboard as well as the mouse. -->
        <label v-if="interactive" class="lesson__row lesson__row--interactive">
          <input
            type="checkbox"
            class="lesson__check"
            :checked="isDone(lesson.id)"
            @change="emit('toggle', lesson.id)"
          />
          <span class="lesson__index" aria-hidden="true">{{ index + 1 }}</span>
          <span class="lesson__title" :class="{ 'lesson__title--done': isDone(lesson.id) }">
            {{ lesson.title }}
          </span>
          <span class="lesson__time">{{ lesson.minutes }} min</span>
        </label>

        <div v-else class="lesson__row">
          <span class="lesson__index" aria-hidden="true">{{ index + 1 }}</span>
          <span class="lesson__title">{{ lesson.title }}</span>
          <span class="lesson__time">{{ lesson.minutes }} min</span>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.lessons {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
}

.lessons__head {
  padding: var(--sp-4);
  border-bottom: 1px solid var(--border);
}

.lessons__title {
  margin: 0;
  font-size: 1.0625rem;
}

.lessons__meta {
  margin: var(--sp-1) 0 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.lessons__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.lesson + .lesson {
  border-top: 1px solid var(--border);
}

.lesson__row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  font-size: 0.9375rem;
}

.lesson__row--interactive {
  grid-template-columns: auto auto 1fr auto;
  cursor: pointer;
}

.lesson__row--interactive:hover {
  background: var(--surface-2);
}

.lesson__check {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  cursor: pointer;
}

.lesson__index {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: var(--r-full);
  background: var(--surface-2);
  border: 1px solid var(--border);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
}

.lesson__title {
  min-width: 0;
}

.lesson__title--done {
  color: var(--text-muted);
  text-decoration: line-through;
}

.lesson__time {
  font-size: 0.8125rem;
  color: var(--text-muted);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
</style>
