<script setup lang="js">
const props = defineProps({
  height: {
    type: String,
    default: '20'
  },
  width: {
    type: String,
    default: '20'
  },
  fill: {
    type: String,
    default: 'currentColor'
  },
  rotate: {
    type: String,
    default: '0'
  }
})
</script>

<template>
  <svg
    :fill="props.fill"
    :width="props.width"
    :height="props.height"
    :transform="`rotate(${props.rotate})`"
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 407.437 407.437"
    xml:space="preserve"
  >
    <polygon
      points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 "
    />
  </svg>
</template>
