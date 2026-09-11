<script setup>
import { computed } from 'vue'

const props = defineProps({
  rating: { type: Number, required: true },
  reviews: { type: Number, default: null },
})

// The star row is decorative; the accessible name carries the real value so a
// screen reader hears "4.8 out of 5" rather than five separate star glyphs.
const percent = computed(() => (props.rating / 5) * 100)
</script>

<template>
  <span class="rating">
    <span class="rating__stars" aria-hidden="true">
      <span class="rating__base">★★★★★</span>
      <span class="rating__fill" :style="{ width: percent + '%' }">★★★★★</span>
    </span>
    <span class="rating__number">{{ rating.toFixed(1) }}</span>
    <span v-if="reviews !== null" class="rating__reviews">({{ reviews.toLocaleString() }})</span>
    <span class="sr-only">
      Rated {{ rating.toFixed(1) }} out of 5<template v-if="reviews !== null">
        from {{ reviews.toLocaleString() }} reviews</template
      >.
    </span>
  </span>
</template>

<style scoped>
.rating {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.8125rem;
}

.rating__stars {
  position: relative;
  display: inline-block;
  line-height: 1;
  letter-spacing: 1px;
}

.rating__base {
  color: var(--border);
}

.rating__fill {
  position: absolute;
  inset: 0;
  overflow: hidden;
  white-space: nowrap;
  color: #f59e0b;
}

.rating__number {
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.rating__reviews {
  color: var(--text-muted);
}
</style>
