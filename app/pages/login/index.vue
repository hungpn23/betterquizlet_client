<script setup lang="ts">
import * as v from 'valibot';
import type { FormSubmitEvent } from '@nuxt/ui';

definePageMeta({
  layout: 'auth',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
});

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue',
});

const schema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(6, 'Must be at least 6 characters'),
    v.maxLength(20, 'Must be at most 20 characters'),
  ),
  password: v.message(
    v.pipe(
      v.string(),
      v.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&*@^]).{8,}$/),
    ),
    'Password must contain at least 8 characters, including uppercase, lowercase, number, and special characters.',
  ),
});

type Schema = v.InferOutput<typeof schema>;

const toast = useToast();
const { signIn } = useAuth();

const providers = [
  {
    label: 'Google',
    class: 'cursor-pointer',
    icon: 'i-simple-icons-google',
    onClick: onGoogleLogin,
  },
  {
    label: 'Github',
    class: 'cursor-pointer',
    icon: 'i-simple-icons-github',
    onClick: () => {
      toast.add({ title: 'GitHub', description: 'Login with GitHub' });
    },
  },
];

function onGoogleLogin() {
  const config = useRuntimeConfig();
  const { googleRedirectUri: redirectUri, googleClientId: clientId } =
    config.public;

  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    response_type: 'code',
    scope: 'profile email',
    prompt: 'select_account',
  };

  const searchParams = new URLSearchParams(options);

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${searchParams.toString()}`;
}

function onSubmit(payload: FormSubmitEvent<Schema>) {
  signIn(payload.data, { callbackUrl: '/home' }).catch(
    (error: ErrorResponse) => {
      console.log('Login error:', error);

      toast.add({ title: 'Login failed' });
    },
  );
}
</script>

<template>
  <UAuthForm
    :fields="logInFields"
    :schema="schema"
    :providers="providers"
    title="Better Quizlet"
    @submit.prevent="onSubmit"
  >
    <template #password-hint>
      <ULink to="/" class="text-primary font-medium" tabindex="-1"
        >Forgot password?</ULink
      >
    </template>

    <template #footer>
      Don't have an account?
      <ULink to="/signup" class="text-primary font-medium">Sign up</ULink>.
    </template>
  </UAuthForm>
</template>
