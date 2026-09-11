<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

/**
 * An accessible dialog.
 *
 * A modal is the easiest component in an application to get wrong, so this one
 * does the four things that matter: it traps Tab inside the dialog, closes on
 * Escape, returns focus to whatever opened it, and locks the background from
 * scrolling underneath.
 */
const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const uid = useId()
const titleId = `modal-title-${uid}`
const descId = `modal-desc-${uid}`

const panel = ref(null)
let previouslyFocused = null

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableItems() {
  if (!panel.value) return []
  return Array.from(panel.value.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    emit('close')
    return
  }

  if (event.key !== 'Tab') return

  const items = focusableItems()
  if (items.length === 0) {
    event.preventDefault()
    return
  }

  const first = items[0]
  const last = items[items.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function lockScroll(locked) {
  document.body.style.overflow = locked ? 'hidden' : ''
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      previouslyFocused = document.activeElement
      lockScroll(true)
      await nextTick()
      const items = focusableItems()
      ;(items[0] ?? panel.value)?.focus()
    } else {
      lockScroll(false)
      previouslyFocused?.focus?.()
      previouslyFocused = null
    }
  },
)

onBeforeUnmount(() => lockScroll(false))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal"
        @click.self="emit('close')"
        @keydown="onKeydown"
      >
        <div
          ref="panel"
          class="modal__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="description ? descId : undefined"
          tabindex="-1"
        >
          <header class="modal__head">
            <div>
              <h2 :id="titleId" class="modal__title">{{ title }}</h2>
              <p v-if="description" :id="descId" class="modal__desc">{{ description }}</p>
            </div>
            <button type="button" class="modal__close" @click="emit('close')">
              <span aria-hidden="true">&times;</span>
              <span class="sr-only">Close dialog</span>
            </button>
          </header>

          <div class="modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal__foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  background: rgba(9, 11, 16, 0.55);
  backdrop-filter: blur(2px);
}

.modal__panel {
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg) var(--r-lg) 0 0;
  box-shadow: var(--shadow-lg);
}

.modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-5) var(--sp-3);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--surface);
}

.modal__title {
  margin: 0;
  font-size: 1.1875rem;
}

.modal__desc {
  margin: var(--sp-1) 0 0;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.modal__close {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  line-height: 1;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
}

.modal__close:hover {
  background: var(--surface-2);
  color: var(--text);
}

.modal__body {
  padding: var(--sp-5);
}

.modal__foot {
  padding: var(--sp-4) var(--sp-5) var(--sp-5);
  border-top: 1px solid var(--border);
  display: flex;
  gap: var(--sp-3);
  justify-content: flex-end;
  flex-wrap: wrap;
}

@media (min-width: 640px) {
  .modal {
    align-items: center;
    padding: var(--sp-5);
  }

  .modal__panel {
    max-width: 560px;
    border-radius: var(--r-lg);
  }
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal__panel,
.modal-leave-active .modal__panel {
  transition:
    transform 0.22s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal__panel,
.modal-leave-to .modal__panel {
  transform: translateY(16px) scale(0.98);
  opacity: 0;
}
</style>
