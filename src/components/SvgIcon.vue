<template>
  <svg
    class="svg-icon"
    :class="className"
    aria-hidden="true"
    :style="style"
  >
    <use :xlink:href="symbolId" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
  size: {
    type: [Number, String],
    default: undefined,
  },
})

const symbolId = computed(() => `#icon-${props.name.replace(/\//g, '-')}`)

const style = computed(() => {
  const s = {}
  if (props.size) {
    const v = typeof props.size === 'number' ? `${props.size}px` : props.size
    s.width = v
    s.height = v
  }
  return s
})
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;
}
</style>
