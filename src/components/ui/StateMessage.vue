<script setup>
/**
 * One component for every "nothing to show here" situation: request failures,
 * empty search results and empty collections. Keeping them in a single
 * component is what makes the three states look like they belong to the same
 * product rather than three different afternoons of work.
 */
defineProps({
  tone: {
    type: String,
    default: 'empty',
    validator: (v) => ['empty', 'error'].includes(v),
  },
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  message: { type: String, default: '' },
})
</script>

<template>
  <div
    class="state"
    :class="`state--${tone}`"
    :role="tone === 'error' ? 'alert' : 'status'"
  >
    <div class="state__icon" aria-hidden="true">
      {{ icon || (tone === 'error' ? '!' : '·') }}
    </div>
    <h3 class="state__title">{{ title }}</h3>
    <p v-if="message" class="state__message">{{ message }}</p>
    <div v-if="$slots.default" class="state__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--sp-2);
  padding: var(--sp-7) var(--sp-4);
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--r-lg);
}

.state--error {
  border-style: solid;
  border-color: var(--danger);
  background: var(--danger-soft);
}

.state__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--r-full);
  font-size: 1.25rem;
  font-weight: 700;
  background: var(--surface-2);
  color: var(--text-muted);
  margin-bottom: var(--sp-2);
}

.state--error .state__icon {
  background: var(--danger);
  color: var(--surface);
}

.state__title {
  margin: 0;
  font-size: 1.0625rem;
}

.state--error .state__title {
  color: var(--danger);
}

.state__message {
  margin: 0;
  color: var(--text-muted);
  max-width: 46ch;
}

.state--error .state__message {
  color: var(--danger);
}

.state__actions {
  margin-top: var(--sp-3);
  display: flex;
  gap: var(--sp-3);
  flex-wrap: wrap;
  justify-content: center;
}
</style>
