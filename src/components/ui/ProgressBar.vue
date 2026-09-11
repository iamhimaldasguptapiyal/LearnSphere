<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  label: { type: String, default: 'Progress' },
  showValue: { type: Boolean, default: true },
  size: { type: String, default: 'md' },
})

const clamped = computed(() => Math.min(100, Math.max(0, Math.round(props.value))))
const complete = computed(() => clamped.value === 100)
</script>

<template>
  <div class="progress">
    <div v-if="showValue" class="progress__head">
      <span class="progress__label">{{ label }}</span>
      <span class="progress__value" :class="{ 'progress__value--done': complete }">
        {{ clamped }}%
      </span>
    </div>

    <div
      class="progress__track"
      :class="`progress__track--${size}`"
      role="progressbar"
      :aria-valuenow="clamped"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${label}: ${clamped} percent complete`"
    >
      <div
        class="progress__fill"
        :class="{ 'progress__fill--done': complete }"
        :style="{ width: clamped + '%' }"
      />
    </div>
  </div>
</template>

<style scoped>
.progress {
  width: 100%;
}

.progress__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--sp-2);
  margin-bottom: var(--sp-2);
  font-size: 0.8125rem;
}

.progress__label {
  color: var(--text-muted);
}

.progress__value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.progress__value--done {
  color: var(--success);
}

.progress__track {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r-full);
  overflow: hidden;
}

.progress__track--sm {
  height: 6px;
}
.progress__track--md {
  height: 10px;
}

.progress__fill {
  height: 100%;
  background: var(--accent);
  border-radius: inherit;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress__fill--done {
  background: var(--success);
}
</style>
