<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  type: { type: String, default: 'button' },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

// Renders as a router-link, an anchor or a button depending on what it is for,
// so navigation stays a real link and remains keyboard and screen-reader
// friendly instead of being faked with a click handler.
const tag = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})

const bindings = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return { type: props.type, disabled: props.disabled }
})
</script>

<template>
  <component
    :is="tag"
    v-bind="bindings"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
  >
    <slot />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  border: 1px solid transparent;
  border-radius: var(--r-md);
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.08s ease;
}

.btn:hover {
  text-decoration: none;
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Sizes */
.btn--sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8125rem;
}
.btn--md {
  padding: 0.6rem 1.1rem;
  font-size: 0.9375rem;
}
.btn--lg {
  padding: 0.8rem 1.6rem;
  font-size: 1rem;
}

.btn--block {
  display: flex;
  width: 100%;
}

/* Variants */
.btn--primary {
  background: var(--accent);
  color: var(--on-accent);
}
.btn--primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn--secondary {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border);
}
.btn--secondary:hover:not(:disabled) {
  background: var(--surface-2);
}

.btn--ghost {
  background: transparent;
  color: var(--text-muted);
}
.btn--ghost:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text);
}

.btn--danger {
  background: var(--danger-soft);
  color: var(--danger);
  border-color: transparent;
}
.btn--danger:hover:not(:disabled) {
  border-color: var(--danger);
}
</style>
