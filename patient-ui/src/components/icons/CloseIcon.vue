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
      default: 'white'
    }
  }
}
</script>

<template> <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" fill="none" />
    <path
      d="M7 17L16.8995 7.10051"
      :stroke="fill"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M7 7.00001L16.8995 16.8995"
      :stroke="fill"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
