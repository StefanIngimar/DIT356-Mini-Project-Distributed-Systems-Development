<script lang="js">
export default {
  props: {
    message: {
      type: String
    },
    withHeader: {
      type: Boolean,
      default: true
    },
  }
}
</script>

<template>
  <div
    class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
    role="alert"
  >
    <p v-if="withHeader" class="font-bold">Error</p>
    <p class="text-sm">{{ message }}</p>
  </div>
</template>
