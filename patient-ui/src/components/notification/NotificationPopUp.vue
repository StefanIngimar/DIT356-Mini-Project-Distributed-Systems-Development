<script lang="js">
import InfoIcon from "@/components/icons/InfoIcon.vue";
import CloseIcon from "@/components/icons/CloseIcon.vue";

export default {
    components: {
        InfoIcon,
        CloseIcon,
    },
    emits: ["removeNotificationFromStore"],
    props: {
        notification: {
            type: Object,
            required: true,
        }
    }
}
</script>

<template>
    <div class="w-[300px] bg-white shadow-md rounded-lg p-5 flex items-center justify-between gap-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <div class="flex items-center justify-center gap-4">
            <div class="text-blue-500">
                <InfoIcon width="25" height="25" fill="currentColor" />
            </div>
            <div>
                <p class="text-xs font-semibold text-gray-700">{{ notification.title }}</p>
                <p class="text-sm text-gray-500">{{ notification.message }}</p>
            </div>
        </div>
        <button 
            @click="$emit('removeNotificationFromStore', notification.id)" 
            class="text-gray-400 hover:text-gray-500 hover:scale-125 transition duration-200 ease-in-out"
            aria-label="Close notification"
        >
            <CloseIcon width="25" height="25" fill="currentColor" />
        </button>
    </div>
</template>