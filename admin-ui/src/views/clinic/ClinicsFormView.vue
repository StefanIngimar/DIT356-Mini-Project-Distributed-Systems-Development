<script lang="js">
import dentistClinicService from "@/lib/services/dentistClinic.js"

import LabeledInput from "@/components/form/LabeledInput.vue"
import LoadingSpinner from "@/components/core/LoadingSpinner.vue"

import ErrorAlert from "@/components/alert/ErrorAlert.vue"
import SuccessAlert from "@/components/alert/SuccessAlert.vue"

const getDefaultClinicData = () => {
  return {
    name: null,
    description: null,
    address: {
      street: null,
      city: null,
      postal_code: null,
      country: null,
      latitude: null,
      longitude: null,
    },
    contact: {
      email: null,
      phone_number: null,
    },
  };
};

export default {
    components: {
        LabeledInput,
        LoadingSpinner,
        ErrorAlert,
        SuccessAlert,
    },
    data() {
        return {
            success: null,
            error: null,
            isLoading: false,
            clinicData: getDefaultClinicData()
        }
    },
    methods: {
        resetAlerts() {
            this.success = null;
            this.error = null;
        },
        async addClinic() {
            this.isLoading = true;
            this.resetAlerts();

            const { hasError, content } = await dentistClinicService.addClinic(this.clinicData);
            if (hasError) {
                this.error = content;
            } else {
                this.clinics = Array.isArray(content) ? content : [content];
                this.clinicData = getDefaultClinicData();
                this.success = "Clinic added";
            }
            this.isLoading = false;
        }
    }
}
</script>

<template>
  <div class="pt-3 h-full flex items-center justify-center">
    <div class="bg-white shadow-md rounded-lg p-6">
      <div v-if="success || error">
        <ErrorAlert v-if="error" :message="error" :withHeader="false" />
        <SuccessAlert v-if="success" :message="success" :withHeader="false" />
      </div>
      <form @submit.prevent="addClinic" class="space-y-4">
        <LabeledInput
          inputName="name"
          inputType="text"
          text="Clinic Name"
          :isRequired="true"
          v-model="clinicData.name"
        />
        <LabeledInput
          inputName="description"
          inputType="textarea"
          text="Clinic Description"
          :isRequired="true"
          v-model="clinicData.description"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            inputName="street"
            inputType="text"
            text="Street"
            :isRequired="true"
            v-model="clinicData.address.street"
          />
          <LabeledInput
            inputName="city"
            inputType="text"
            text="City"
            :isRequired="true"
            v-model="clinicData.address.city"
          />
          <LabeledInput
            inputName="postal-code"
            inputType="text"
            text="Postal Code"
            :isRequired="true"
            v-model="clinicData.address.postal_code"
          />
          <LabeledInput
            inputName="country"
            inputType="text"
            text="Country"
            :isRequired="true"
            v-model="clinicData.address.country"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            inputName="longitude"
            inputType="number"
            text="Longitude"
            v-model.number="clinicData.address.longitude"
          />
          <LabeledInput
            inputName="latitude"
            inputType="number"
            text="Latitude"
            v-model.number="clinicData.address.latitude"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            inputName="email"
            inputType="email"
            text="Email"
            v-model="clinicData.contact.email"
          />
          <LabeledInput
            inputName="phone-number"
            inputType="text"
            text="Phone Number"
            v-model="clinicData.contact.phone_number"
          />
        </div>
        <div class="text-center text-sm">
          <button
            v-if="!isLoading"
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            Submit
          </button>
          <LoadingSpinner v-else />
        </div>
      </form>
    </div>
  </div>
</template>
