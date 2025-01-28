<script lang="js">
import CloseIcon from "@/components/icons/CloseIcon.vue";

export default {
    components: {
        CloseIcon,
    },
    emits: ["closeDrawer"]
}
</script>

<template>
    <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-700">Your Bookings</h2>
        <button type="button" @click="$emit('closeDrawer')"
            class="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform ease-in-out duration-100 hover:scale-125">
            <CloseIcon fill="#343434" width="25" height="25" />
        </button>
    </div>
</template>