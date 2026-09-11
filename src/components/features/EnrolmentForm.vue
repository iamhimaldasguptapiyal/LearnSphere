<script setup>
import { ref, useId } from 'vue'
import BaseField from '@/components/ui/BaseField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useProfileStore } from '@/stores/profile'
import {
  useFormValidation,
  required,
  minLength,
  maxLength,
  email as emailRule,
} from '@/composables/useFormValidation'

const props = defineProps({
  course: { type: Object, required: true },
})

const emit = defineEmits(['submit', 'cancel'])

const profileStore = useProfileStore()
const submitting = ref(false)
const summaryRef = ref(null)
const uid = useId()

// Pre-filled from the saved profile: the learner should not retype details the
// application already knows.
const { values, errors, isValid, errorCount, submitted, touch, validate } = useFormValidation(
  {
    fullName: profileStore.profile.fullName,
    email: profileStore.profile.email,
    experience: 'Beginner',
    goal: '',
    terms: false,
  },
  {
    fullName: [required('Full name'), minLength(2, 'Full name')],
    email: [required('Email address'), emailRule()],
    experience: [required('Experience level')],
    goal: [
      required('Learning goal'),
      minLength(10, 'Learning goal'),
      maxLength(240, 'Learning goal'),
    ],
    terms: [required('The course agreement')],
  },
)

async function onSubmit() {
  if (!validate()) {
    // Move focus to the summary so keyboard and screen-reader users are told
    // why the submission did not go through.
    await Promise.resolve()
    summaryRef.value?.focus()
    return
  }

  submitting.value = true
  // Stand-in for a POST to an enrolment endpoint.
  await new Promise((resolve) => setTimeout(resolve, 600))
  submitting.value = false

  emit('submit', {
    courseId: props.course.id,
    goal: values.goal.trim(),
    experience: values.experience,
  })
}
</script>

<template>
  <form class="enrol" novalidate @submit.prevent="onSubmit">
    <div
      v-if="submitted && !isValid"
      ref="summaryRef"
      class="enrol__summary"
      role="alert"
      tabindex="-1"
    >
      <strong>
        {{ errorCount }} {{ errorCount === 1 ? 'field needs' : 'fields need' }} your attention
      </strong>
      <p>Please correct the highlighted fields below and submit again.</p>
    </div>

    <BaseField v-slot="slot" label="Full name" required :error="errors.fullName">
      <input
        :id="slot.id"
        v-model="values.fullName"
        class="control"
        type="text"
        autocomplete="name"
        :aria-invalid="slot.invalid"
        :aria-describedby="slot.describedBy"
        @blur="touch('fullName')"
      />
    </BaseField>

    <BaseField
      v-slot="slot"
      label="Email address"
      hint="Your confirmation and course reminders are sent here."
      required
      :error="errors.email"
    >
      <input
        :id="slot.id"
        v-model="values.email"
        class="control"
        type="email"
        autocomplete="email"
        :aria-invalid="slot.invalid"
        :aria-describedby="slot.describedBy"
        @blur="touch('email')"
      />
    </BaseField>

    <BaseField
      v-slot="slot"
      label="Your experience with this topic"
      required
      :error="errors.experience"
    >
      <select
        :id="slot.id"
        v-model="values.experience"
        class="control"
        :aria-invalid="slot.invalid"
        :aria-describedby="slot.describedBy"
        @blur="touch('experience')"
      >
        <option value="Beginner">New to this topic</option>
        <option value="Intermediate">Some working knowledge</option>
        <option value="Advanced">Confident, looking to go deeper</option>
      </select>
    </BaseField>

    <BaseField
      v-slot="slot"
      label="What do you want to get out of this course?"
      :hint="`${values.goal.length}/240 characters`"
      required
      :error="errors.goal"
    >
      <textarea
        :id="slot.id"
        v-model="values.goal"
        class="control"
        rows="3"
        maxlength="240"
        placeholder="For example: build a portfolio project I can show in interviews."
        :aria-invalid="slot.invalid"
        :aria-describedby="slot.describedBy"
        @blur="touch('goal')"
      />
    </BaseField>

    <div class="enrol__terms">
      <input
        :id="`terms-${uid}`"
        v-model="values.terms"
        type="checkbox"
        class="enrol__checkbox"
        :aria-invalid="!!errors.terms"
        :aria-describedby="errors.terms ? `terms-error-${uid}` : undefined"
        @blur="touch('terms')"
      />
      <label :for="`terms-${uid}`" class="enrol__terms-label">
        I understand this course takes about
        <strong>{{ course.durationHours }} hours</strong> and I agree to the course agreement.
        <span class="enrol__req" aria-hidden="true">*</span>
      </label>
    </div>

    <p v-if="errors.terms" :id="`terms-error-${uid}`" class="enrol__error" role="alert">
      <span aria-hidden="true">&#9888;</span> {{ errors.terms }}
    </p>

    <div class="enrol__actions">
      <BaseButton variant="secondary" type="button" :disabled="submitting" @click="emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" :disabled="submitting">
        {{ submitting ? 'Enrolling…' : 'Confirm enrolment' }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.enrol {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.enrol__summary {
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--r-md);
  background: var(--danger-soft);
  border: 1px solid var(--danger);
  color: var(--danger);
  font-size: 0.875rem;
}

.enrol__summary p {
  margin: var(--sp-1) 0 0;
}

.enrol__terms {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
}

.enrol__checkbox {
  width: 18px;
  height: 18px;
  margin-top: 3px;
  flex-shrink: 0;
  accent-color: var(--accent);
}

.enrol__terms-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  cursor: pointer;
}

.enrol__req {
  color: var(--danger);
}

.enrol__error {
  margin: calc(var(--sp-3) * -1) 0 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--danger);
}

.enrol__actions {
  display: flex;
  gap: var(--sp-3);
  justify-content: flex-end;
  flex-wrap: wrap;
  padding-top: var(--sp-2);
}
</style>
