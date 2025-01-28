<script lang="js">
export default {
  props: {
    width: {
      type: String,
      default: '20'
    },
    height: {
      type: String,
      default: '20'
    },
    fill: {
      type: String,
      default: '#ECDFCC'
    }
  }
}
</script>

<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 18L20 18"
      :stroke="fill"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M4 12L20 12"
      :stroke="fill"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M4 6L20 6"
      :stroke="fill"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>
