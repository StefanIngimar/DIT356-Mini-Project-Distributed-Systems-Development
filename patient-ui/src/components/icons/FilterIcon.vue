<script lang="js">
export default {
    props: {
        width: {
            type: [String, Number],
            default: "20",
        },
        height: {
            type: [String, Number],
            default: "20",
        },
        fill: {
            type: String,
            default: "#FFFFFF",
        },
    },
};
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
            d="M4 7H20"
            stroke="#000000"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M7 12L17 12"
            stroke="#000000"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M11 17H13"
            stroke="#000000"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
</template>
