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
  title: 'Sign up',
  description: 'Create an account to get started',
});

const schema = v.pipe(
  v.object({
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
    confirmPassword: v.pipe(v.string()),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      (input) => input.password === input.confirmPassword,
      'Passwords do not match',
    ),
    ['confirmPassword'],
  ),
);

type Schema = v.InferOutput<typeof schema>;

const toast = useToast();
const { signUp } = useAuth();

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
      toast.add({ title: 'Google', description: 'Login with Google' });
    },
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => {
      toast.add({ title: 'GitHub', description: 'Login with GitHub' });
    },
  },
];

function onSubmit(payload: FormSubmitEvent<Schema>) {
  signUp(payload.data, { callbackUrl: '/home' }).catch(
    (error: ErrorResponse) => {
      console.log('Login error:', error);

      toast.add({ title: 'Login failed' });
    },
  );
}
</script>

<template>
  <UAuthForm
    :fields="signUpFields"
    :schema="schema"
    :providers="providers"
    :submit="{ label: 'Create account' }"
    title="Create an account"
    @submit.prevent="onSubmit"
  >
    <template #footer>
      Already have an account?
      <ULink to="/login" class="text-primary font-medium">Login</ULink>.
    </template>
  </UAuthForm>
</template>
