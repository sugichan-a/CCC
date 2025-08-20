<template>
  <component :is="currentSize" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  breakpoint: {
    type: Number,
    default: 768
  },
  smallComponent: {
    type: [String, Object],
    default: 'div'
  },
  largeComponent: {
    type: [String, Object],
    default: 'div'
  }
})

// State
const currentSize = ref('div')

// Methods
const updateSize = () => {
  if (window.innerWidth < props.breakpoint) {
    currentSize.value = props.smallComponent
  } else {
    currentSize.value = props.largeComponent
  }
}

// Lifecycle
onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})
</script>