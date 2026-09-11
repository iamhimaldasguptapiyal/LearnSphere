<script setup>
defineProps({
  tone: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'accent', 'success', 'warning'].includes(v),
  },
})
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 0.15rem 0.55rem;
  border-radius: var(--r-full);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  border: 1px solid transparent;
}

.badge--neutral {
  background: var(--surface-2);
  color: var(--text-muted);
  border-color: var(--border);
}

.badge--accent {
  background: var(--accent-soft);
  color: var(--accent);
}

.badge--success {
  background: var(--success-soft);
  color: var(--success);
}

.badge--warning {
  background: var(--surface-2);
  color: var(--warning);
  border-color: var(--border);
}
</style>
