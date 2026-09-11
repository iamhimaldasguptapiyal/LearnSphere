<script setup>
import { computed, useId } from 'vue'

/**
 * Wraps any form control with a real <label>, optional hint and an error
 * message that is announced to assistive technology. Children receive the
 * generated ids through the default slot so the label/aria wiring is
 * impossible to forget at the call site.
 */
const props = defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
})

const uid = useId()
const fieldId = computed(() => `field-${uid}`)
const hintId = computed(() => `hint-${uid}`)
const errorId = computed(() => `error-${uid}`)

const describedBy = computed(() => {
  const ids = []
  if (props.hint) ids.push(hintId.value)
  if (props.error) ids.push(errorId.value)
  return ids.length ? ids.join(' ') : undefined
})
</script>

<template>
  <div class="field" :class="{ 'field--invalid': !!error }">
    <label :for="fieldId" class="field__label">
      {{ label }}
      <span v-if="required" class="field__req" aria-hidden="true">*</span>
      <span v-if="required" class="sr-only">(required)</span>
    </label>

    <p v-if="hint" :id="hintId" class="field__hint">{{ hint }}</p>

    <slot
      :id="fieldId"
      :described-by="describedBy"
      :invalid="!!error"
    />

    <p v-if="error" :id="errorId" class="field__error" role="alert">
      <span aria-hidden="true">&#9888;</span> {{ error }}
    </p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.field__label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text);
}

.field__req {
  color: var(--danger);
  margin-left: 2px;
}

.field__hint {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.field__error {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--danger);
}
</style>
