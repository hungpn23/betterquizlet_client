<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
	layout: "auth",
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/",
	},
});

useSeoMeta({
	title: "Login with Magic Link",
});

const toast = useToast();

const requestSent = ref(false);

function onSubmit(payload: FormSubmitEvent<MagicLinkSchema>) {
	$fetch(`/api/auth/magic-link`, {
		method: "POST",
		body: { email: payload.data.email },
	})
		.catch(() => toast.add({ title: "Login failed", color: "error" }))
		.finally(() => {
			requestSent.value = true;
		});
}
</script>

<template>
  <UAuthForm
    v-if="!requestSent"
    :fields="magicLinkFields"
    :schema="magicLinkSchema"
    title="Vocabify"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account?
      <ULink to="/signup" class="text-primary font-medium">Sign up</ULink>
    </template>
  </UAuthForm>

  <UContainer v-else>
    <h1>
      Your magic link has been sent to your email
    </h1>
  </UContainer>
</template>
