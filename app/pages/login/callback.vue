<script lang="ts" setup>
definePageMeta({
  layout: 'auth',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
});

const route = useRoute();

const code = computed(() => route.query.code as string);
</script>

<template>
  <UContainer>
    <h1>google callback page</h1>

    <p>code: {{ code }}</p>
  </UContainer>
</template>

<style scoped></style>
