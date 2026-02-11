<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as v from "valibot";
import { AUTH_SCHEMA } from "~/features/auth/constants";
import { applyProviderHandlers, pickFields } from "~/features/auth/utils";

definePageMeta({
	layout: "auth",
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/library",
	},
});
useSeoMeta({ title: "Login to Vocabify" });

const schema = v.pick(AUTH_SCHEMA, ["email", "password"]);
const providerWithHandlers = applyProviderHandlers({
	google: handleLoginWithGoogle,
	"magic-link": handleLoginWithMagicLink,
});

const { googleRedirectUri, googleClientId } = useRuntimeConfig().public;

function handleLoginWithGoogle() {
	const scope = [
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
	].join(" ");

	const options: GoogleQueryParams = {
		redirect_uri: googleRedirectUri,
		client_id: googleClientId,
		response_type: "code",
		scope,
		prompt: "select_account",
	};

	const searchParams = new URLSearchParams(options).toString();

	window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${searchParams}`;
}

function handleLoginWithMagicLink() {
	useRouter().push("/magic-link");
}

function onSubmit(payload: FormSubmitEvent<v.InferOutput<typeof schema>>) {
	useAuth()
		.signIn(payload.data, { callbackUrl: "/library" })
		.catch(() => {
			useToast().add({
				title: "Login failed",
				description: "Please check your credentials and try again.",
				color: "error",
			});
		});
}
</script>

<template>
  <UAuthForm
    :fields="pickFields(['email', 'password'])"
    :schema="schema"
    :providers="providerWithHandlers"
    title="Sign in to Vocabify"
    @submit.prevent="onSubmit"
  >
    <template #password-hint>
      <ULink to="/" class="text-primary font-medium" tabindex="-1">
        Forgot password?
      </ULink>
    </template>

    <template #description>
      Don't have an account?
      <ULink to="/sign-up" class="text-primary font-medium">Sign up</ULink>
    </template>
  </UAuthForm>
</template>
