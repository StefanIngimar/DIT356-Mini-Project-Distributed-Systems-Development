<script lang="js">
import PhoneIcon from "@/components/icons/PhoneIcon.vue";
import AddressBookIcon from "@/components/icons/AddressBookIcon.vue";

export default {
    components: {
        PhoneIcon,
        AddressBookIcon,
    },
    emits: ["navigateToClinic"],
    props: {
        clinic: {
            type: Object,
            required: true,
        },
    },
};
</script>

<template>
  <div
    class="flex flex-row justify-between p-5 border border-gray-200 shadow-sm rounded-lg bg-gray-50"
  >
    <div class="flex items-center gap-4">
      <img
        :src="clinic.logo_url"
        :alt="`${clinic.name} logo`"
        class="w-20 h-20 border border-gray-300 rounded-full object-cover shadow-sm"
      />
      <div>
        <h3 class="text-lg font-bold text-gray-800">
          {{ clinic.name }}
        </h3>
        <div class="mt-2 text-gray-600 text-sm space-y-1">
          <div class="flex items-center">
            <div class="w-[30px] flex items-center justify-center">
              <AddressBookIcon class="w-6 h-6 text-gray-500 mr-2" />
            </div>
            <span
              >{{ clinic.address.street }}, {{ clinic.address.postal_code }},
              {{ clinic.address.city }}</span
            >
          </div>
          <div class="flex items-center">
            <div class="w-[30px] flex items-center justify-center">
              <PhoneIcon class="w-4 h-4 text-gray-500 mr-2" fill="black" />
            </div>
            <span
              >{{ clinic.contact.email }},
              {{ clinic.contact.phone_number }}</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center">
      <button
        class="px-4 py-2 text-sm bg-blue-500 text-white rounded-md shadow-sm transition duration-150 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        @click="$emit('navigateToClinic', clinic)"
      >
        View
      </button>
    </div>
  </div>
</template>
