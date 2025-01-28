<script lang="js">
import ChevronIcon from "@/components/icons/ChevronIcon.vue";

export default {
    components: {
        ChevronIcon,
    },
    emits: ["clicked"],
    props: {
        factor: {
            type: Number,
            required: true,
        },
        rotation: {
            type: String,
            required: false,
        },
    },
};
</script>

<template>
    <div
        class="rounded-full transform transition-transform duration-100 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105"
    >
        <button type="button" class="p-2" @click="$emit('clicked', factor)">
            <ChevronIcon
                :rotate="rotation"
                width="13"
                height="13"
                fill="#3b82f6"
            />
        </button>
    </div>
</template>
