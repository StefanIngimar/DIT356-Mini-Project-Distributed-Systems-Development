<script lang="js">
import ErrorAlert from "@/components/alert/ErrorAlert.vue"
import SuccessAlert from "@/components/alert/SuccessAlert.vue"

import LabeledInput from "@/components/form/LabeledInput.vue"
import LabeledSelect from "@/components/form/LabeledSelect.vue"

export default {
  components: {
    ErrorAlert,
    SuccessAlert,
    LabeledInput,
    LabeledSelect
  },
  props: {
    errMessage: {
      type: String,
      default: '',
    },
    successMessage: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
        form: {
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            password: undefined,
            confirmPassword: undefined,
            role: undefined,
        },
    };
  },
  methods: {
    onRegister() {
      this.$emit('register', this.form);
    },
  },
};
</script>

<template>
  <div>
    <div class="pb-8">
      <h3 class="pb-3 text-slate-700 font-semibold text-3xl">
        Create your account
      </h3>
      <p class="text-sm text-gray-500">Fill in the details to get started</p>
    </div>
    <div v-if="errMessage" class="pb-8">
      <ErrorAlert :withHeader="false" :message="errMessage" />
    </div>
    <form class="pb-8" @submit.prevent="onRegister">
      <div class="flex flex-row gap-2">
        <LabeledInput
          divClass="pb-6 w-full"
          inputName="first-name"
          inputType="text"
          text="First name"
          :isRequired="true"
          v-model="form.firstName"
        />
        <LabeledInput
          divClass="pb-6 w-full"
          inputName="last-name"
          inputType="text"
          text="Last name"
          :isRequired="true"
          v-model="form.lastName"
        />
      </div>
      <div class="flex flex-row gap-2">
        <LabeledInput
          divClass="pb-6 w-3/4"
          inputName="email"
          inputType="email"
          text="Email"
          :isRequired="true"
          v-model="form.email"
        />
        <LabeledSelect
          divClass="w-1/4"
          text="Your role"
          selectName="role"
          v-model="form.role"
        >
          <option value="dentist">Dentist</option>
          <option value="clinic-owner">Clinic Owner</option>
        </LabeledSelect>
      </div>
      <LabeledInput
        divClass="pb-6"
        inputName="password"
        inputType="password"
        text="Password"
        :isRequired="true"
        v-model="form.password"
      />
      <LabeledInput
        divClass="pb-6"
        inputName="repeat-password"
        inputType="password"
        text="Confirm password"
        :isRequired="true"
        v-model="form.confirmPassword"
      />
      <div>
        <button
          type="submit"
          class="p-2 text-sm text-white bg-blue-600 uppercase w-full hover:bg-blue-700 transition ease-in-out rounded-sm"
        >
          Register
        </button>
      </div>
    </form>
    <div>
      <p class="text-sm text-gray-400">
        Have an account already?
        <button
          class="text-blue-500 font-bold hover:text-blue-600 transition-colors ease-in-out"
          @click="$emit('toggleForm')"
        >
          Login here!
        </button>
      </p>
    </div>
  </div>
</template>
