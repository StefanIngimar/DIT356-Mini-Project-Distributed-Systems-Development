<script setup lang="js">
const props = defineProps({
    width: {
        type: Number,
        default: 20,
    },
    height: {
        type: Number,
        default: 20,
    },
    fill: {
        type: String,
        default: "black",
    },
});
</script>

<template>
    <svg
        :width="width"
        :height="height"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M16 9L13.0001 11.9999M13.0001 11.9999L10 15M13.0001 11.9999L10.0002 9M13.0001 11.9999L16.0002 15M8 6H19C19.5523 6 20 6.44772 20 7V17C20 17.5523 19.5523 18 19 18H8L2 12L8 6Z"
            :stroke="fill"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
</template>
