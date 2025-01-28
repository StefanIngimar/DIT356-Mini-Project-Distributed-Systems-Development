<script>
import ErrorAlert from "@/components/alert/ErrorAlert.vue"
import SuccessAlert from "@/components/alert/SuccessAlert.vue"

import LabeledInput from "@/components/form/LabeledInput.vue"

export default {
  components: {
    ErrorAlert,
    SuccessAlert,
    LabeledInput,
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
        email: undefined,
        password: undefined,
      },
    };
  },
  methods: {
    onLogin() {
      this.$emit('login', this.form);
    },
  },
};
</script>

<template>
  <div>
    <div class="pb-8">
      <h3 class="pb-3 text-slate-700 font-semibold text-3xl">
        Welcome back
      </h3>
      <p class="text-sm text-gray-500">
        Sign in to continue to the Dentist Panel
      </p>
    </div>
    <div v-if="errMessage" class="pb-8">
      <ErrorAlert :withHeader="false" :message="errMessage" />
    </div>
    <div v-if="successMessage" class="pb-8">
      <SuccessAlert :withHeader="false" :message="successMessage" />
    </div>
    <form class="pb-8" @submit.prevent="onLogin">
      <LabeledInput
        divClass="pb-6"
        inputName="email"
        inputType="email"
        text="Email"
        :isRequired="true"
        v-model="form.email"
      />
      <LabeledInput
        divClass="pb-6"
        inputName="password"
        inputType="password"
        text="Password"
        :isRequired="true"
        v-model="form.password"
      />
      <div>
        <button
          type="submit"
          class="p-2 text-sm text-white bg-blue-600 uppercase w-full hover:bg-blue-700 transition ease-in-out rounded-sm"
        >
          Login
        </button>
      </div>
    </form>
    <div>
      <p class="text-sm text-gray-400">
        Do not have an account yet?
        <button
          class="text-blue-500 font-bold hover:text-blue-600 transition-colors ease-in-out"
          @click="$emit('toggleForm')"
        >
          Register here!
        </button>
      </p>
    </div>
  </div>
</template>
