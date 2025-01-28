<script lang="js">
import { toTitleCase } from "@/lib/utils/formatter.js";

export default {
    props: {
        status: {
            type: String,
            required: true,
        },
    },
    computed: {
        statusClass() {
            switch (this.status) {
                case 'PENDING':
                    return 'bg-yellow-100 text-yellow-800';
                case 'CONFIRMED':
                    return 'bg-green-100 text-green-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        },
    },
    methods: {
        titledStatus() {
            return toTitleCase(this.status);
        }
    }
};
</script>

<template>
    <div class="w-full sm:w-1/2 mb-4 sm:mb-0">
        <p class="font-medium text-gray-500">Status:</p>
        <div>
            <span 
                v-if="status" 
                :class="[
                    'px-3 py-1 rounded-full text-xs inline-block',
                    statusClass
                ]"
            >
                {{ titledStatus() }}
            </span>
            <span v-else class="text-gray-600">-</span>
        </div>
    </div>
</template>