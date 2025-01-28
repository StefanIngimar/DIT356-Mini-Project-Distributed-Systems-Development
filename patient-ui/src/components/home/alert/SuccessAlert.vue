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
    class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
    role="alert"
  >
    <p v-if="withHeader" class="font-bold">Success</p>
    <p class="text-sm">{{ message }}</p>
  </div>
</template>
