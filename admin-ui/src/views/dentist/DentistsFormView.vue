<script lang="js">
import dentistClinicService from "@/lib/services/dentistClinic.js"

import LabeledInput from "@/components/form/LabeledInput.vue"
import LabeledSelect from "@/components/form/LabeledSelect.vue"
import LoadingSpinner from "@/components/core/LoadingSpinner.vue"

import ErrorAlert from "@/components/alert/ErrorAlert.vue"
import SuccessAlert from "@/components/alert/SuccessAlert.vue"

export default {
    components: {
        LabeledInput,
        LabeledSelect,
        LoadingSpinner,
        ErrorAlert,
        SuccessAlert,
    },
    data() {
        return {
            success: null,
            error: null,
            isLoading: false,
            dentistData: this.getDefaultDentistData(),
            clinics: [],
        }
    },
    async mounted() {
        await this.fetchClinics();
    },
    methods: {
        resetAlerts() {
            this.success = null;
            this.error = null;
        },
        getDefaultDentistData() {
            return {
                clinic_id: null,
                first_name: null,
                last_name: null,
                password: null,
                confirm_password: null,
                specialization: null,
                years_of_experience: null,
                contact: {
                    email: null,
                    phone_number: null,
                },
            }
        },
        async fetchClinics() {
            this.isLoading = true;
            const { hasError, content } = await dentistClinicService.getClinics();
            if (hasError) {
                this.error = content;
            } else {
                this.clinics = Array.isArray(content) ? content : [content]
            }
            this.isLoading = false;
        },
        async addDentist() {
            this.isLoading = true;
            this.resetAlerts();

            if (this.dentistData.clinic_id === "" || this.dentistData.clinic_id === null) {
                this.error = "You need to select a clinic for this dentist";
                this.isLoading = false;
                return;
            }

            if (this.dentistData.password !== this.dentistData.confirm_password) {
                this.error = "Password and confirm password are not the same";
                this.isLoading = false;
                return;
            }

            const clinicId = this.dentistData.clinic_id;

            delete this.dentistData.clinic_id;
            delete this.dentistData.confirm_password;

            const { hasError, content } = await dentistClinicService.addDentistToClinic(clinicId, this.dentistData);
            if (hasError) {
              this.error = content;
            } else {
                this.dentistData = this.getDefaultDentistData();
                this.success = "Dentist added";
            }
            this.isLoading = false;
        }
    }
}
</script>

<template>
  <div class="pt-3 h-full flex items-center justify-center">
    <div class="bg-white shadow-md rounded-lg p-6">
      <div class="pb-2" v-if="success || error">
        <ErrorAlert v-if="error" :message="error" :withHeader="false" />
        <SuccessAlert v-if="success" :message="success" :withHeader="false" />
      </div>
      <form @submit.prevent="addDentist" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            inputName="first-name"
            inputType="text"
            text="First Name"
            v-model.number="dentistData.first_name"
          />
          <LabeledInput
            inputName="last-name"
            inputType="text"
            text="Last Name"
            v-model.number="dentistData.last_name"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            inputName="specialization"
            inputType="text"
            text="Specialization"
            v-model="dentistData.specialization"
          />
          <LabeledInput
            inputName="years-of-experience"
            inputType="number"
            text="Years Of Experience"
            :isRequired="true"
            v-model.number="dentistData.years_of_experience"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            inputName="password"
            inputType="password"
            text="Password"
            :isRequired="true"
            v-model="dentistData.password"
          />
          <LabeledInput
            inputName="confirm-password"
            inputType="password"
            text="Confirm Password"
            :isRequired="true"
            v-model="dentistData.confirm_password"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            inputName="email"
            inputType="email"
            text="Email"
            :isRequired="true"
            v-model="dentistData.contact.email"
          />
          <LabeledInput
            inputName="phone-number"
            inputType="text"
            text="Phone Number"
            v-model="dentistData.contact.phone_number"
          />
        </div>
        <LabeledSelect
          text="Clinic"
          selectName="clinic"
          v-model="dentistData.clinic_id"
        >
          <option value="" disabled selected>Select a Clinic</option>
          <option v-for="clinic in clinics" :value="clinic.id">
            {{ clinic.name }}
          </option>
        </LabeledSelect>
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
