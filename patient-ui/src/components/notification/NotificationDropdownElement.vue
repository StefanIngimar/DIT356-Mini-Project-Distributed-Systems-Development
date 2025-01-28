<script lang="js">
import InfoIcon from "@/components/icons/InfoIcon.vue";

export default {
    components: {
        InfoIcon,
    },
    emits: ["markAsRead"],
    props: {
        notification: {
            type: Object,
            required: true,
        }
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
    }
}
</script>

<template>
    <div
        class="p-3 flex flex-row items-center gap-3 w-[245px] sm:w-[300px] border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
        <div class="text-blue-500 flex-shrink-0">
            <InfoIcon width="24" height="24" fill="currentColor" />
        </div>
        <div class="flex-1">
            <p class="text-gray-700 text-sm font-medium leading-snug">
                {{ notification.message }}
            </p>
            <div class="mt-2 flex items-center justify-between">
                <button class="text-blue-600 text-xs font-semibold hover:underline focus:outline-none"
                    @click="$emit('markAsRead', notification.id)">
                    Mark as Read
                </button>
                <p class="text-xs text-gray-400">{{ formatDate(notification.created_at) }}</p>
            </div>
        </div>
    </div>
</template>