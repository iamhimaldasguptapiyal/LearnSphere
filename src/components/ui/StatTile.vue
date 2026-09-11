<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  caption: { type: String, default: '' },
})
</script>

<template>
  <div class="tile">
    <p class="tile__label">{{ label }}</p>
    <p class="tile__value">{{ value }}</p>
    <p v-if="caption" class="tile__caption">{{ caption }}</p>
  </div>
</template>

<style scoped>
.tile {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-4);
  box-shadow: var(--shadow-sm);
}

.tile__label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.tile__value {
  margin: var(--sp-1) 0 0;
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.tile__caption {
  margin: var(--sp-1) 0 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}
</style>
