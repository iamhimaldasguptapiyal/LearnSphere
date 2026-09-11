<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <span class="footer__mark" aria-hidden="true">LS</span>
        <div>
          <p class="footer__name">LearnSphere</p>
          <p class="footer__tag">A frontend coursework project built with Vue 3.</p>
        </div>
      </div>

      <nav class="footer__nav" aria-label="Footer">
        <RouterLink :to="{ name: 'courses' }">Browse courses</RouterLink>
        <RouterLink :to="{ name: 'my-learning' }">My learning</RouterLink>
        <RouterLink :to="{ name: 'profile' }">Profile</RouterLink>
      </nav>
    </div>

    <div class="container">
      <p class="footer__legal">
        &copy; {{ year }} LearnSphere. Course data is fictional and served from a local JSON file.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  border-top: 1px solid var(--border);
  background: var(--surface);
  padding-block: var(--sp-6) var(--sp-5);
}

.footer__inner {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  justify-content: space-between;
}

.footer__brand {
  display: flex;
  gap: var(--sp-3);
  align-items: flex-start;
}

.footer__mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 0.8125rem;
  font-weight: 800;
}

.footer__name {
  margin: 0;
  font-weight: 700;
}

.footer__tag {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-muted);
  max-width: 42ch;
}

.footer__nav {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  font-size: 0.875rem;
}

.footer__nav a {
  color: var(--text-muted);
}

.footer__nav a:hover {
  color: var(--accent);
}

.footer__legal {
  margin: var(--sp-5) 0 0;
  padding-top: var(--sp-4);
  border-top: 1px solid var(--border);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

@media (min-width: 720px) {
  .footer__inner {
    flex-direction: row;
    align-items: flex-start;
  }

  .footer__nav {
    flex-direction: row;
    gap: var(--sp-5);
  }
}
</style>
