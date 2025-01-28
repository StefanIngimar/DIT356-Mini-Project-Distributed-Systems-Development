<script lang="js">
import LoginForm from "@/components/login/LoginForm.vue"
import RegisterForm from "@/components/login/RegisterForm.vue"

import loginService from "@/lib/services/login.js"
import userService from "@/lib/services/user.js"

export default {
    components: {
        LoginForm,
        RegisterForm
    },
    data() {
        return {
            errMessage: undefined,
            successMessage: undefined,
            showLoginForm: true,
        }
    },
    methods: {
        async login(form) {
            this.resetMessagesState()

            const response = await loginService.login(form.email, form.password)
            if (response.hasError) {
                this.errMessage = response.content;
                form.email = undefined;
                form.password = undefined;
            } else {
                this.$router.replace("/")
            }
        },
        async register(form) {
            this.resetMessagesState()

            if (form.password !== form.confirmPassword) {
                this.errMessage = "Password and confirm password have to be the same"
                return;
            }

            const response = await userService.register(
                form.firstName, 
                form.lastName, 
                form.role, 
                form.email, 
                form.password
            )
            if (response.hasError) {
                this.errMessage = response.content;
                form.firstName = undefined;
                form.lastName = undefined;
                form.role = undefined;
                form.email = undefined;
                form.password = undefined;
                form.confirmPassword = undefined;
            } else {
                this.successMessage = "Account created! Login with the provided credentials below."
                this.showLoginForm = true;
            }
        },
        toggleCurrentForm() {
            this.showLoginForm = !this.showLoginForm
        },
        resetMessagesState() {
            this.errMessage = undefined;
            this.successMessage = undefined;
        }
    }
}
</script>

<template>
  <div class="w-screen h-screen">
    <div class="flex flex-col items-center h-full">
      <div class="flex flex-col w-full md:w-1/2 h-full px-12 py-24">
        <div v-if="showLoginForm === true">
          <LoginForm 
            :errMessage="errMessage"
            :successMessage="successMessage" 
            @login="login"
            @toggleForm="toggleCurrentForm"
          />
        </div>
        <div v-else>
          <RegisterForm 
            :errMessage="errMessage"
            :successMessage="successMessage" 
            @register="register"
            @toggleForm="toggleCurrentForm"
          />
        </div>
      </div>
    </div>
  </div>
</template>
