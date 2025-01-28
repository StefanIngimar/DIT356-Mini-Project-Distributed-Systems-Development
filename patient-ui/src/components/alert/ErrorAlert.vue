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
    divClass: {
      type: String,
    },
    pClass: {
      type: String,
      default: "text-sm"
    }
  }
}
</script>

<template>
  <div
    class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
    :class="divClass ? divClass : ''"
    role="alert"
  >
    <p v-if="withHeader" class="font-bold">Error</p>
    <p :class="pClass">{{ message }}</p>
  </div>
</template>
