<script setup>
import { computed } from 'vue'

/**
 * A small SVG ring used for the overall-completion figure.
 * Drawn by hand rather than pulled from a charting library: one number does
 * not justify a dependency, and this keeps the bundle small.
 */
const props = defineProps({
  value: { type: Number, required: true },
  label: { type: String, default: 'Overall completion' },
  size: { type: Number, default: 132 },
})

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const clamped = computed(() => Math.min(100, Math.max(0, Math.round(props.value))))
const dashOffset = computed(() => CIRCUMFERENCE * (1 - clamped.value / 100))
</script>

<template>
  <figure class="donut">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 128 128"
      role="img"
      :aria-label="`${label}: ${clamped} percent`"
    >
      <circle class="donut__track" cx="64" cy="64" :r="RADIUS" />
      <circle
        class="donut__value"
        :class="{ 'donut__value--done': clamped === 100 }"
        cx="64"
        cy="64"
        :r="RADIUS"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashOffset"
      />
      <text class="donut__text" x="64" y="64" text-anchor="middle" dominant-baseline="central">
        {{ clamped }}%
      </text>
    </svg>
    <figcaption class="donut__caption">{{ label }}</figcaption>
  </figure>
</template>

<style scoped>
.donut {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
}

.donut svg {
  transform: rotate(-90deg);
}

.donut__track {
  fill: none;
  stroke: var(--surface-2);
  stroke-width: 12;
}

.donut__value {
  fill: none;
  stroke: var(--accent);
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.donut__value--done {
  stroke: var(--success);
}

.donut__text {
  transform: rotate(90deg);
  transform-origin: 64px 64px;
  fill: var(--text);
  font-size: 26px;
  font-weight: 800;
  font-family: var(--font);
}

.donut__caption {
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-align: center;
}
</style>
