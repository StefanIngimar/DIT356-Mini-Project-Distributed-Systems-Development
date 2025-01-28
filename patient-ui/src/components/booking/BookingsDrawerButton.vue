<script lang="js">
import BookingIcon from "@/components/icons/BookingIcon.vue"

export default {
    components: { BookingIcon },
    methods: {
        openBookingsDrawer() {
            this.emitter.emit("toggleBookingsDrawer");
        }
    }
}
</script>

<template>
    <button @click="openBookingsDrawer"
        class="flex items-center justify-center w-[40px] h-[40px] p-2 border border-gray-200 rounded-lg shadow text-gray-500 hover:bg-gray-100 transform transition-transform duration-100">
        <BookingIcon width="16" height="16" fill="currentColor" />
    </button>
</template>