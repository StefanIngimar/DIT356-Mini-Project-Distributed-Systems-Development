<script lang="js">
export default {
    props: {
        availabilityStatus: {
            type: [String, undefined, null],
            default: null,
        },
    },
};
</script>

<template>
    <div v-if="availabilityStatus !== null && availabilityStatus !== undefined">
        <div
            v-if="availabilityStatus.toLowerCase() === 'high'"
            title="High availability"
            class="block h-[6px] w-7 border broder-gray-200 bg-green-500"
        ></div>
        <div
            v-else-if="availabilityStatus.toLowerCase() === 'medium'"
            title="Medium availability"
            class="block h-[6px] w-5 border broder-gray-200 bg-yellow-400"
        ></div>
        <div
            v-else-if="availabilityStatus.toLowerCase() === 'low'"
            title="Low availability"
            class="block h-[6px] w-2 border broder-gray-200 bg-amber-700"
        ></div>
        <div
            v-else
            title="Unknown availability"
            class="block h-[6px] w-7 border broder-gray-200 bg-gray-400"
        ></div>
    </div>
</template>
