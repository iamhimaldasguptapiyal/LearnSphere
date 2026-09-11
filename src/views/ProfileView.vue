<script setup>
import { computed, ref, useId } from 'vue'
import BaseField from '@/components/ui/BaseField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatTile from '@/components/ui/StatTile.vue'
import { useProfileStore } from '@/stores/profile'
import { useEnrolmentsStore } from '@/stores/enrolments'
import { useCoursesStore } from '@/stores/courses'
import { useUiStore } from '@/stores/ui'
import {
  useFormValidation,
  required,
  minLength,
  maxLength,
  numberRange,
  email as emailRule,
} from '@/composables/useFormValidation'

const profileStore = useProfileStore()
const enrolments = useEnrolmentsStore()
const courses = useCoursesStore()
const ui = useUiStore()

const uid = useId()
const saving = ref(false)

const INTERESTS = ['Web Development', 'Design', 'Data', 'Career']

// The interests array is copied, not referenced: without this the form would
// mutate the stored profile directly and "discard changes" could not undo it.
const snapshot = () => ({
  ...profileStore.profile,
  interests: [...profileStore.profile.interests],
})

const { values, errors, isValid, validate, touch, reset } = useFormValidation(
  snapshot(),
  {
    fullName: [required('Full name'), minLength(2, 'Full name'), maxLength(60, 'Full name')],
    email: [required('Email address'), emailRule()],
    headline: [maxLength(80, 'Headline')],
    weeklyGoalHours: [required('Weekly goal'), numberRange(1, 40, 'Weekly goal')],
  },
)

const memberSince = computed(() => {
  if (!enrolments.items.length) return null
  const earliest = enrolments.items
    .map((e) => new Date(e.enrolledAt))
    .sort((a, b) => a - b)[0]
  return earliest.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
})

const initials = computed(() =>
  (values.fullName || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join(''),
)

function toggleInterest(interest) {
  const list = values.interests
  const index = list.indexOf(interest)
  if (index === -1) list.push(interest)
  else list.splice(index, 1)
}

async function onSubmit() {
  if (!validate()) {
    ui.notify('Please fix the highlighted fields before saving.', 'error')
    return
  }

  saving.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))
  profileStore.update({
    ...values,
    weeklyGoalHours: Number(values.weeklyGoalHours),
    interests: [...values.interests],
  })
  saving.value = false
  ui.notify('Your profile has been saved.')
}

function onRevert() {
  reset(snapshot())
  ui.notify('Changes discarded.', 'info')
}
</script>

<template>
  <div class="container page">
    <header class="head">
      <h1>Your profile</h1>
      <p class="lead">
        These details pre-fill the enrolment form and shape what we recommend. Everything is stored
        locally in your browser.
      </p>
    </header>

    <div class="layout">
      <!-- Editable details -->
      <section class="panel" aria-labelledby="details-heading">
        <h2 id="details-heading" class="panel__title">Account details</h2>

        <form class="form" novalidate @submit.prevent="onSubmit">
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

          <BaseField v-slot="slot" label="Email address" required :error="errors.email">
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
            label="Headline"
            hint="A one-line description of what you are working towards."
            :error="errors.headline"
          >
            <input
              :id="slot.id"
              v-model="values.headline"
              class="control"
              type="text"
              maxlength="80"
              :aria-invalid="slot.invalid"
              :aria-describedby="slot.describedBy"
              @blur="touch('headline')"
            />
          </BaseField>

          <BaseField
            v-slot="slot"
            label="Weekly study goal (hours)"
            hint="Between 1 and 40 hours."
            required
            :error="errors.weeklyGoalHours"
          >
            <input
              :id="slot.id"
              v-model="values.weeklyGoalHours"
              class="control control--narrow"
              type="number"
              min="1"
              max="40"
              :aria-invalid="slot.invalid"
              :aria-describedby="slot.describedBy"
              @blur="touch('weeklyGoalHours')"
            />
          </BaseField>

          <fieldset class="fieldset">
            <legend class="fieldset__legend">Subjects you are interested in</legend>
            <div class="chips">
              <label v-for="interest in INTERESTS" :key="interest" class="chip">
                <input
                  type="checkbox"
                  class="chip__input"
                  :checked="values.interests.includes(interest)"
                  @change="toggleInterest(interest)"
                />
                <span class="chip__text">{{ interest }}</span>
              </label>
            </div>
          </fieldset>

          <div class="opt-in">
            <input
              :id="`updates-${uid}`"
              v-model="values.emailUpdates"
              type="checkbox"
              class="opt-in__box"
            />
            <label :for="`updates-${uid}`" class="opt-in__label">
              Email me when a new course is added in one of my subjects.
            </label>
          </div>

          <div class="form__actions">
            <BaseButton variant="secondary" type="button" :disabled="saving" @click="onRevert">
              Discard changes
            </BaseButton>
            <BaseButton type="submit" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save profile' }}
            </BaseButton>
          </div>

          <p v-if="!isValid" class="form__hint" aria-live="polite">
            Some fields still need attention before this can be saved.
          </p>
        </form>
      </section>

      <!-- Read-only summary -->
      <aside class="aside" aria-labelledby="snapshot-heading">
        <div class="identity">
          <span class="identity__avatar" aria-hidden="true">{{ initials }}</span>
          <div>
            <p class="identity__name">{{ values.fullName || 'Your name' }}</p>
            <p class="identity__headline">{{ values.headline || 'No headline set' }}</p>
          </div>
        </div>

        <h2 id="snapshot-heading" class="aside__title">Learning snapshot</h2>

        <div class="aside__tiles">
          <StatTile label="Enrolled" :value="enrolments.count" />
          <StatTile label="Lessons done" :value="enrolments.totalLessonsCompleted" />
        </div>

        <dl class="facts">
          <div>
            <dt>Weekly goal</dt>
            <dd>{{ values.weeklyGoalHours }} hours</dd>
          </div>
          <div>
            <dt>Interests</dt>
            <dd>{{ values.interests.length ? values.interests.join(', ') : 'None selected' }}</dd>
          </div>
          <div>
            <dt>First enrolled</dt>
            <dd>{{ memberSince ?? 'Not yet' }}</dd>
          </div>
          <div>
            <dt>Catalogue size</dt>
            <dd>{{ courses.items.length || '—' }} courses</dd>
          </div>
        </dl>

        <BaseButton :to="{ name: 'courses' }" variant="secondary" block>
          Find your next course
        </BaseButton>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.head {
  margin-bottom: var(--sp-5);
}

.head h1 {
  margin-bottom: var(--sp-2);
}

.layout {
  display: grid;
  gap: var(--sp-5);
  grid-template-columns: 1fr;
  align-items: start;
}

.panel,
.aside {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
}

.panel__title,
.aside__title {
  margin-top: 0;
  font-size: 1.0625rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.control--narrow {
  max-width: 140px;
}

.form__actions {
  display: flex;
  gap: var(--sp-3);
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-top: var(--sp-2);
  border-top: 1px solid var(--border);
}

.form__hint {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-align: right;
}

/* ---- Interest chips ---- */
.fieldset {
  border: 0;
  padding: 0;
  margin: 0;
}

.fieldset__legend {
  padding: 0;
  margin-bottom: var(--sp-3);
  font-weight: 600;
  font-size: 0.875rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.chip {
  cursor: pointer;
}

.chip__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.chip__text {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--r-full);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--surface);
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.chip__input:checked + .chip__text {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}

.chip__input:focus-visible + .chip__text {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

/* ---- Opt in ---- */
.opt-in {
  display: flex;
  gap: var(--sp-3);
  align-items: flex-start;
}

.opt-in__box {
  width: 18px;
  height: 18px;
  margin-top: 3px;
  flex-shrink: 0;
  accent-color: var(--accent);
}

.opt-in__label {
  font-size: 0.875rem;
  color: var(--text-muted);
  cursor: pointer;
}

/* ---- Aside ---- */
.aside {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.identity {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
  padding-bottom: var(--sp-4);
  border-bottom: 1px solid var(--border);
}

.identity__avatar {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: var(--r-full);
  background: var(--accent);
  color: var(--on-accent);
  font-weight: 800;
  font-size: 1.0625rem;
}

.identity__name {
  margin: 0;
  font-weight: 700;
}

.identity__headline {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.aside__title {
  margin: 0;
}

.aside__tiles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sp-3);
}

.facts {
  margin: 0;
  display: grid;
  gap: var(--sp-3);
  font-size: 0.875rem;
  padding-top: var(--sp-4);
  border-top: 1px solid var(--border);
}

.facts > div {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-4);
}

.facts dt {
  color: var(--text-muted);
  flex-shrink: 0;
}

.facts dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}

@media (min-width: 940px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: var(--sp-5);
  }
}
</style>
