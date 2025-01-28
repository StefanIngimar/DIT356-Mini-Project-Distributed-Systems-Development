<script lang="js">
import CloseIcon from "@/components/icons/CloseIcon.vue";
import SearchIcon from "@/components/icons/SearchIcon.vue";

export default {
    components: {
        CloseIcon,
        SearchIcon,
    },
    emits: ["closeDrawer", "searchClinics"],
    data() {
        return {
            searchQuery: undefined,
        };
    },
};
</script>

<template>
    <div class="flex flex-col border-b border-gray-200 bg-gray-50">
        <div class="flex justify-between items-center p-4 pb-2">
            <h2 class="text-lg font-semibold text-gray-700">All Clinics</h2>
            <button
                type="button"
                @click="$emit('closeDrawer')"
                class="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform ease-in-out duration-100 hover:scale-125"
            >
                <CloseIcon fill="#343434" width="25" height="25" />
            </button>
        </div>
        <div class="p-2">
            <div class="relative">
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search Clinics..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-slate-700 focus:border-blue-500"
                    @input="$emit('searchClinics', searchQuery)"
                />
                <div
                    class="pl-[15px] absolute inset-y-0 right-4 flex items-center text-gray-400 pointer-events-none border-l border-gray-300"
                >
                    <SearchIcon class="w-5 h-5" fill="currentColor" />
                </div>
            </div>
        </div>
    </div>
</template>
