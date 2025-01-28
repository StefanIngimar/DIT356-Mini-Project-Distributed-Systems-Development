<script lang="js">
import CloseIcon from "@/components/icons/CloseIcon.vue";
import ChevronIcon from "@/components/icons/ChevronIcon.vue";

export default {
    components: {
        CloseIcon,
        ChevronIcon,
    },
    data() {
        return {
            selectedValues: [],
            isDropdownOpen: false,
        };
    },
    props: {
        dropdownReference: {
            type: String,
            default: "dropdown",
        },
        dropdownTitle: {
            type: String,
            default: "Dropdown",
        },
        dropdownOptions: {
            type: Array,
        },
        modelValue: {
            type: Array,
            required: true,
        },
        divClass: {
            type: String,
            required: false,
        },
        selectedValueClass: {
            type: String,
            default:
                "bg-sky-600 text-white rounded text-xs flex justify-between",
        },
    },
    emits: ["update:modelValue"],
    watch: {
        modelValue: {
            immediate: true,
            handler(newValue) {
                if (!newValue) {
                    return;
                }
                this.selectedValues = [...newValue];
            },
        },
    },
    methods: {
        toggleDropdown() {
            this.isDropdownOpen = !this.isDropdownOpen;
        },
        closeDropdown() {
            this.isDropdownOpen = false;
        },
        removeSelected(value) {
            this.selectedValues = this.selectedValues.filter(
                (val) => val !== value,
            );
            this.$emit("update:modelValue", this.selectedValues);
        },
        getSelectedName(value) {
            let option;
            if (value && typeof value === "object") {
                option = this.dropdownOptions.find(
                    (opt) => opt.value === value.value,
                );
            } else {
                option = this.dropdownOptions.find(
                    (opt) => opt.value === value,
                );
            }

            // NOTE: there should always be a name associated with the value, but just in case
            // let's return the value if name was not found or was not 'truthy'
            return option ? option.name : value;
        },
    },
    mounted() {
        if (
            this.selectedValues.length > 0 &&
            typeof this.selectedValues[0] === "object"
        ) {
            this.selectedValues = this.selectedValues.map((val) => val.value);
        }
    },
};
</script>

<template>
    <div :class="divClass">
        <div
            @click="toggleDropdown"
            class="relative"
            @mouseleave="closeDropdown"
        >
            <button
                class="flex flex-row items-center gap-1 text-sm font-medium text-gray-700"
                type="button"
            >
                <p>{{ dropdownTitle }}</p>
                <ChevronIcon width="12" height="12" fill="currentColor" />
            </button>
            <transition name="slide-down">
                <div
                    v-if="isDropdownOpen"
                    class="absolute top-3 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-[200px] overflow-auto mt-2"
                    @click.stop
                >
                    <div
                        v-for="option in dropdownOptions"
                        :key="option.value"
                        class="w-full flex items-center space-x-3 hover:bg-gray-100 cursor-pointer transition-all"
                    >
                        <label
                            :for="option.value"
                            class="px-4 py-2 w-full flex flex-row gap-2 items-center text-sm font-medium text-gray-700 select-none cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                :id="option.value"
                                :name="option.value"
                                :value="option.value"
                                v-model="selectedValues"
                                @change="
                                    $emit('update:modelValue', selectedValues)
                                "
                                class="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                            />
                            {{ option.name }}
                        </label>
                    </div>
                </div>
            </transition>
        </div>

        <div
            class="min-h-[42px] flex flex-wrap gap-1 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-2 py-1 transition duration-300 ease hover:border-slate-300 shadow-sm wrap"
        >
            <div
                :class="selectedValueClass"
                v-for="value in selectedValues"
                :key="value"
            >
                <button
                    type="button"
                    @click="removeSelected(value)"
                    class="px-3 py-2 flex flex-row justify-between items-center gap-1"
                >
                    <p>{{ getSelectedName(value) }}</p>
                    <CloseIcon width="15" height="15" fill="currentColor" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.2s ease-out;
}

.slide-down-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
