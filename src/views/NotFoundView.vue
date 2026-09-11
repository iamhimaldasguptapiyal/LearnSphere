<script setup>
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
</script>

<template>
  <div class="container page notfound">
    <p class="notfound__code" aria-hidden="true">404</p>
    <h1>We cannot find that page</h1>
    <p class="lead notfound__lead">
      There is nothing at <code class="notfound__path">{{ route.fullPath }}</code
      >. It may have been moved, or the address might have a typo in it.
    </p>

    <div class="notfound__actions">
      <BaseButton :to="{ name: 'home' }">Back to home</BaseButton>
      <BaseButton :to="{ name: 'courses' }" variant="secondary">Browse courses</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.notfound {
  text-align: center;
  max-width: 620px;
  padding-block: var(--sp-8);
}

.notfound__code {
  margin: 0;
  font-size: clamp(4rem, 3rem + 8vw, 7rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--accent);
  opacity: 0.25;
}

.notfound__lead {
  margin-inline: auto;
}

.notfound__path {
  padding: 0.1rem 0.4rem;
  border-radius: var(--r-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
  font-size: 0.875em;
  word-break: break-all;
}

.notfound__actions {
  display: flex;
  gap: var(--sp-3);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--sp-5);
}
</style>
