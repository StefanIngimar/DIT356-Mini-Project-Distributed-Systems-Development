<script lang="js">
import CloseIcon from "@/components/icons/CloseIcon.vue";

export default {
    components: {
        CloseIcon,
    },
    emits: ["closeModal"],
}
</script>

<template>
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-lg font-semibold">Account Preferences</h2>
    <button
      @click="$emit('closeModal')"
      class="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform ease-in-out duration-100 hover:scale-125"
    >
      <CloseIcon width="25" height="25" fill="currentColor" />
    </button>
  </div>

  <hr class="p-2" />
</template>
