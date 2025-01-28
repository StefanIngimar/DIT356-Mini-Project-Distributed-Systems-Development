<script lang="js">
import loginService from "@/lib/services/login";

import LoginForm from "@/components/login/LoginForm.vue";

export default {
    components: {
        LoginForm,
    },
    data() {
        return {
            errMessage: undefined,
            successMessage: undefined,
            showLoginForm: true,
        };
    },
    methods: {
        async login(form) {
            this.resetMessagesState();

            const response = await loginService.login(
                form.email,
                form.password,
            );
            if (response.hasError) {
                this.errMessage = response.content;
                form.email = undefined;
                form.password = undefined;
            } else {
                this.$router.replace("/");
            }
        },
        toggleCurrentForm() {
            this.showLoginForm = !this.showLoginForm;
        },
        resetMessagesState() {
            this.errMessage = undefined;
            this.successMessage = undefined;
        },
    },
};
</script>

<template>
    <div class="w-screen h-screen">
        <div class="flex flex-col items-center h-full">
            <div class="flex flex-col w-full sm:w-[550px] h-full px-12 py-24">
                <LoginForm
                    :errMessage="errMessage"
                    :successMessage="successMessage"
                    @login="login"
                    @toggleForm="toggleCurrentForm"
                />
            </div>
        </div>
    </div>
</template>
