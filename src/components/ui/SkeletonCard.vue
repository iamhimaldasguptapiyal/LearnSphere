<script setup>
defineProps({
  count: { type: Number, default: 6 },
})
</script>

<template>
  <!--
    Placeholder cards shown while the catalogue request is in flight. They match
    the real card's footprint so the layout does not jump when data arrives.
  -->
  <div class="grid-cards" aria-hidden="true">
    <div v-for="n in count" :key="n" class="skel">
      <div class="skel__bar skel__bar--tag"></div>
      <div class="skel__bar skel__bar--title"></div>
      <div class="skel__bar skel__bar--title short"></div>
      <div class="skel__bar skel__bar--text"></div>
      <div class="skel__bar skel__bar--text short"></div>
      <div class="skel__foot">
        <div class="skel__bar skel__bar--pill"></div>
        <div class="skel__bar skel__bar--pill"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-4);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  min-height: 244px;
}

.skel__bar {
  border-radius: var(--r-sm);
  background: linear-gradient(
    90deg,
    var(--surface-2) 25%,
    var(--border) 37%,
    var(--surface-2) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

.skel__bar--tag {
  height: 18px;
  width: 84px;
  border-radius: var(--r-full);
}
.skel__bar--title {
  height: 18px;
  width: 100%;
}
.skel__bar--text {
  height: 12px;
  width: 100%;
}
.skel__bar--pill {
  height: 14px;
  width: 64px;
  border-radius: var(--r-full);
}
.short {
  width: 60%;
}

.skel__foot {
  margin-top: auto;
  display: flex;
  gap: var(--sp-3);
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
