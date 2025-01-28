<script>
export default {
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        isToggled: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit("update:modelValue", value);
            },
        },
    },
};
</script>

<template>
    <div class="flex items-center justify-center">
        <label class="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                class="sr-only peer"
                v-model="isToggled"
                @change="$emit('update:modelValue', isToggled)"
            />
            <div
                class="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-400 transition-colors"
            ></div>
            <div
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-6 transition-transform"
            ></div>
        </label>
    </div>
</template>
