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
            d="M20 7L4 7"
            :stroke="fill"
            stroke-width="1"
            stroke-linecap="round"
        />
        <path
            d="M15 12L4 12"
            :stroke="fill"
            stroke-width="1"
            stroke-linecap="round"
        />
        <path
            d="M9 17H4"
            :stroke="fill"
            stroke-width="1"
            stroke-linecap="round"
        />
    </svg>
</template>
