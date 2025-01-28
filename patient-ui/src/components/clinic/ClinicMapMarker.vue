<script>
import AvailabilityMarker from "@/components/clinic/AvailabilityMarker.vue";

export default {
    components: {
        AvailabilityMarker,
    },
    props: {
        markerTooltip: {
            type: [Object, null, undefined],
            required: true,
        },
        clinic: {
            type: [Object, null, undefined],
            required: true,
        },
    },
};
</script>

<template>
    <div
        v-if="markerTooltip && markerTooltip.id === clinic.id"
        class="flex flex-col items-center justify-center gap-2 min-w-[125px] min-h-[60px] absolute bg-white text-black px-2 py-1 rounded shadow-lg z-50 top-[-65px] left-[50%] border border-gray-200"
        style="transform: translateX(-50%)"
    >
        <p class="text-xs font-semibold text-center">{{ clinic.name }}</p>
        <AvailabilityMarker :availabilityStatus="clinic.availability_status" />
        <div class="tooltip-pointer"></div>
    </div>
    <div class="flex items-center justify-center">
        <img
            :src="clinic.logo_url"
            class="h-16 rounded-full object-cover transform transition duration-200 hover:scale-110 border-2 availability-priority"
            :class="clinic.availability_status.toLowerCase()"
            style="width: 4rem !important;"
        />
    </div>
</template>

<style lang="css" scoped>
.tooltip-pointer {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid white;
    z-index: 10;
}

.availability-priority.high {
    border-color: #4ade80;
}

.availability-priority.medium {
    border-color: #facc15;
}

.availability-priority.low {
    border-color: #c2410c;
}

.availability-priority.unknown {
    border-color: #9ca3af;
}
</style>
