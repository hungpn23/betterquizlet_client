<script setup lang="ts">
definePageMeta({
  auth: false,
});

const features = [
  {
    title: 'Study smarter',
    description: 'Stop guessing and start learning with our scientifically proven study modes.',
    icon: 'i-lucide-brain-circuit',
  },
  {
    title: 'Share & Collaborate',
    description: 'Find decks created by other students or share your own with the community.',
    icon: 'i-lucide-users',
  },
  {
    title: 'Track Progress',
    description: 'Keep track of your learning journey with detailed statistics and insights.',
    icon: 'i-lucide-bar-chart-3',
  },
];
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="relative isolate overflow-hidden">
      <UContainer class="py-24 sm:py-32">
        <div class="mx-auto max-w-2xl text-center">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Master any subject, one success at a time.
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Join the community of students and teachers who use Better Quizlet to study efficiently. Create your own flashcards or search from millions of existing decks.
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <UButton
              to="/signup"
              size="xl"
              icon="i-lucide-arrow-right"
              trailing
            >
              Get started for free
            </UButton>
            <UButton
              to="/library/shared"
              variant="ghost"
              size="xl"
              icon="i-lucide-search"
            >
              Browse decks
            </UButton>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Features Section -->
    <div class="bg-gray-50 py-24 dark:bg-gray-900 sm:py-32">
      <UContainer>
        <div class="mx-auto max-w-2xl lg:max-w-none">
          <div class="grid grid-cols-1 gap-y-16 gap-x-8 lg:grid-cols-3">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="flex flex-col items-center text-center"
            >
              <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                <UIcon
                  :name="feature.icon"
                  class="h-8 w-8 text-primary"
                />
              </div>
              <h3 class="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                {{ feature.title }}
              </h3>
              <p class="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </div>
  </div>
</template>
