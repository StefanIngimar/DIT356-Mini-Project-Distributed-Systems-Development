<script lang="js">
export default {
    props: {
        dentist: {
            type: Object,
            required: true,
        },
    },
};
</script>

<template>
    <div class="flex flex-row gap-4 items-center">
        <img
            :src="dentist.image_url"
            class="w-16 h-16 rounded-full border-[1px] border-gray-300 shadow"
        />
        <div>
            <p class="font-bold">
                {{ dentist.first_name }} {{ dentist.last_name }}
            </p>
            <p class="text-xs text-gray-600">
                {{ dentist.specialization }}
            </p>
        </div>
    </div>
</template>
