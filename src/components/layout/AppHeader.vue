<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEnrolmentsStore } from '@/stores/enrolments'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const enrolments = useEnrolmentsStore()
const ui = useUiStore()

const menuOpen = ref(false)

const links = [
  { to: { name: 'home' }, label: 'Home' },
  { to: { name: 'courses' }, label: 'Courses' },
  { to: { name: 'my-learning' }, label: 'My learning', badge: true },
  { to: { name: 'profile' }, label: 'Profile' },
]

// Close the mobile drawer on navigation, otherwise it stays open over the
// page the user just moved to.
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <RouterLink :to="{ name: 'home' }" class="brand">
        <span class="brand__mark" aria-hidden="true">LS</span>
        <span class="brand__name">LearnSphere</span>
      </RouterLink>

      <button
        type="button"
        class="header__burger"
        :aria-expanded="menuOpen"
        aria-controls="primary-navigation"
        @click="menuOpen = !menuOpen"
      >
        <span class="header__burger-box" aria-hidden="true">
          <span class="header__burger-bar" :class="{ 'is-open': menuOpen }"></span>
        </span>
        <span class="sr-only">{{ menuOpen ? 'Close' : 'Open' }} main menu</span>
      </button>

      <nav
        id="primary-navigation"
        class="nav"
        :class="{ 'nav--open': menuOpen }"
        aria-label="Main"
      >
        <ul class="nav__list">
          <li v-for="link in links" :key="link.label">
            <RouterLink :to="link.to" class="nav__link">
              {{ link.label }}
              <span v-if="link.badge && enrolments.count" class="nav__count">
                {{ enrolments.count }}
                <span class="sr-only">enrolled courses</span>
              </span>
            </RouterLink>
          </li>
        </ul>

        <button type="button" class="theme-toggle" @click="ui.toggleTheme">
          <span aria-hidden="true">{{ ui.theme === 'dark' ? '☀' : '☾' }}</span>
          <span class="theme-toggle__text">
            {{ ui.theme === 'dark' ? 'Light mode' : 'Dark mode' }}
          </span>
          <span class="sr-only">
            Switch to {{ ui.theme === 'dark' ? 'light' : 'dark' }} theme
          </span>
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  min-height: var(--header-h);
  flex-wrap: wrap;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  color: var(--text);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.brand:hover {
  text-decoration: none;
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 0.8125rem;
  font-weight: 800;
}

.brand__name {
  font-size: 1.0625rem;
}

/* ---- Mobile drawer trigger ---- */
.header__burger {
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surface);
  cursor: pointer;
}

.header__burger-box {
  position: relative;
  width: 18px;
  height: 12px;
}

.header__burger-bar,
.header__burger-bar::before,
.header__burger-bar::after {
  position: absolute;
  left: 0;
  width: 18px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: transform 0.2s ease;
}

.header__burger-bar {
  top: 5px;
}
.header__burger-bar::before {
  content: '';
  top: -5px;
}
.header__burger-bar::after {
  content: '';
  top: 5px;
}

.header__burger-bar.is-open {
  background: transparent;
}
.header__burger-bar.is-open::before {
  transform: translateY(5px) rotate(45deg);
}
.header__burger-bar.is-open::after {
  transform: translateY(-5px) rotate(-45deg);
}

/* ---- Navigation ---- */
.nav {
  display: none;
  width: 100%;
  padding-bottom: var(--sp-4);
}

.nav--open {
  display: block;
}

.nav__list {
  list-style: none;
  margin: 0 0 var(--sp-3);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.nav__link {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0.55rem 0.75rem;
  border-radius: var(--r-md);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9375rem;
}

.nav__link:hover {
  background: var(--surface-2);
  color: var(--text);
  text-decoration: none;
}

.nav__link.router-link-active {
  color: var(--accent);
  background: var(--accent-soft);
}

.nav__count {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--r-full);
  background: var(--accent);
  color: var(--on-accent);
  font-size: 0.6875rem;
  font-weight: 700;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text-muted);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.theme-toggle:hover {
  background: var(--surface-2);
  color: var(--text);
}

@media (min-width: 860px) {
  .header__burger {
    display: none;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: var(--sp-4);
    width: auto;
    padding-bottom: 0;
  }

  .nav__list {
    flex-direction: row;
    margin: 0;
    gap: var(--sp-1);
  }

  .theme-toggle__text {
    display: none;
  }

  .theme-toggle {
    width: 40px;
    height: 40px;
    justify-content: center;
    padding: 0;
  }
}
</style>
