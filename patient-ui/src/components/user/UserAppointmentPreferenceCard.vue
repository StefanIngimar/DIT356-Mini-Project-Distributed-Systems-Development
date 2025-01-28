<script lang="js">
import { toTitleCase } from "@/lib/utils/formatter.js";

import DeleteIcon from "@/components/icons/DeleteIcon.vue";

export default {
    components: {
        DeleteIcon,
    },
    emits: ["deleteUserPreference"],
    props: {
        preference: {
            type: Object,
            required: true,
        },
    },
    methods: {
        formatWeekDay(weekDay) {
            return toTitleCase(weekDay);
        },
        formatTime(time) {
            return time
                .split(":")
                .slice(0, 2)
                .map((part, index) =>
                    index === 0 ? String(Number(part)) : part,
                )
                .join(":");
        },
    },
};
</script>

<template>
    <div class="w-full flex flex-row justify-between">
        <div class="w-full">
            <div class="flex flex-row text-sm text-gray-700 mb-4">
                <div class="w-1/2">
                    <p class="font-medium text-gray-800">Start Date:</p>
                    <p class="text-gray-600">{{ preference.start_date }}</p>
                </div>
                <div class="w-1/2">
                    <p class="font-medium text-gray-800">End Date:</p>
                    <p class="text-gray-600">{{ preference.end_date }}</p>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row">
                <div class="w-full sm:w-1/2 text-sm text-gray-700 mb-4 sm:mb-0">
                    <p class="font-medium text-gray-800 mb-1">
                        Days of the Week:
                    </p>
                    <div class="flex flex-wrap gap-1">
                        <div
                            v-for="(day, idx) in preference.days_of_week"
                            :key="idx"
                            class="py-1 px-3 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium"
                        >
                            {{ formatWeekDay(day) }}
                        </div>
                    </div>
                </div>
                <div class="w-full sm:w-1/2 text-sm text-gray-700">
                    <p class="font-medium text-gray-800 mb-1">Time Slots:</p>
                    <div class="flex flex-wrap gap-1">
                        <div
                            v-for="(slot, idx) in preference.time_slots"
                            :key="idx"
                            class="py-1 px-3 bg-green-100 text-green-600 rounded-full text-xs font-medium"
                        >
                            {{ formatTime(slot.start_time) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col justify-start">
            <button
                class="p-1 rounded bg-red-100 text-red-400 border border-red-200 transition-colors hover:bg-red-200 hover:text-red-500"
                @click="$emit('deleteUserPreference', preference.id)"
            >
                <DeleteIcon fill="currentColor" />
            </button>
        </div>
    </div>
</template>
