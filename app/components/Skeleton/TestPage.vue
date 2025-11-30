<template>
  <UContainer>
    <div class="mt-4 flex place-content-between place-items-center gap-2">
      <USkeleton class="mt-2 h-8 w-32" />
      <div class="flex place-items-center place-self-end">
        <USkeleton class="h-10 w-10 rounded-full" />
      </div>
    </div>

    <div class="mb-8 flex w-full flex-col gap-2">
      <USkeleton class="mb-2 h-8 w-48 place-self-center" />

      <!-- Question Cards Skeleton -->
      <UCard
        v-for="i in 3"
        :key="i"
        :ui="{
          header: 'p-0 sm:px-0',
          body: `flex-1 w-full flex flex-col gap-4 sm:gap-4 p-2`,
        }"
        class="bg-elevated mb-2 flex min-h-[30dvh] flex-col divide-none shadow-md transition-all sm:mb-4"
      >
        <div class="flex w-full place-content-between place-items-center">
          <span class="flex place-items-center gap-1">
            <USkeleton class="h-8 w-8 rounded-full" />
            <USkeleton class="h-6 w-16" />
          </span>

          <USkeleton class="h-6 w-20 rounded-full" />
        </div>

        <USkeleton class="h-8 w-3/4" />

        <div class="mt-2 flex w-full flex-col gap-2">
          <USkeleton class="h-6 w-32" />

          <!-- Multiple Choices Skeleton -->
          <div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
            <USkeleton v-for="j in 4" :key="j" class="h-14 w-full rounded-md" />
          </div>

          <div class="flex place-content-end place-items-center gap-2">
            <USkeleton class="h-8 w-32" />
          </div>
        </div>
      </UCard>

      <USkeleton class="h-12 w-40 place-self-center rounded-md" />
    </div>
  </UContainer>
</template>
