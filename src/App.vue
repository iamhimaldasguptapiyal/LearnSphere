<script setup>
import { onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ToastStack from '@/components/ui/ToastStack.vue'
import { useCoursesStore } from '@/stores/courses'

// The catalogue is fetched once at start-up. Views call load() too, but the
// store short-circuits a request when the data is already in memory.
const courses = useCoursesStore()
onMounted(() => courses.load())
</script>

<template>
  <a class="skip-link" href="#main">Skip to main content</a>

  <div class="app">
    <AppHeader />

    <main id="main" tabindex="-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter />
  </div>

  <ToastStack />
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}

main:focus {
  outline: none;
}
</style>
