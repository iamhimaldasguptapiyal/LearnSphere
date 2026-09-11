<script setup>
import { useUiStore } from '@/stores/ui'

/**
 * Confirmation messages for actions the user takes. Rendered in a live region
 * so the confirmation is announced, not just shown.
 */
const ui = useUiStore()
</script>

<template>
  <div class="toasts" role="status" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="toast in ui.toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
        <span class="toast__icon" aria-hidden="true">
          {{ toast.type === 'error' ? '!' : toast.type === 'info' ? 'i' : '✓' }}
        </span>
        <span class="toast__text">{{ toast.message }}</span>
        <button type="button" class="toast__close" @click="ui.dismiss(toast.id)">
          <span aria-hidden="true">&times;</span>
          <span class="sr-only">Dismiss notification</span>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  left: var(--sp-4);
  right: var(--sp-4);
  bottom: var(--sp-4);
  z-index: 150;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-md);
  font-size: 0.875rem;
}

.toast--success {
  border-left-color: var(--success);
}
.toast--error {
  border-left-color: var(--danger);
}

.toast__icon {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: var(--r-full);
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--surface-2);
  color: var(--text);
}

.toast--success .toast__icon {
  background: var(--success-soft);
  color: var(--success);
}
.toast--error .toast__icon {
  background: var(--danger-soft);
  color: var(--danger);
}

.toast__text {
  flex: 1;
}

.toast__close {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: var(--r-sm);
}

.toast__close:hover {
  color: var(--text);
}

@media (min-width: 640px) {
  .toasts {
    left: auto;
    right: var(--sp-5);
    bottom: var(--sp-5);
    max-width: 380px;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
