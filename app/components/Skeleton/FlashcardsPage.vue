<template>
  <UContainer>
    <div class="mt-4 flex w-full flex-col gap-2">
      <!-- Routes placeholder -->
      <div class="flex place-content-between place-items-center gap-2">
        <USkeleton class="h-9 w-20" />
        <USkeleton class="h-9 w-24" />
      </div>

      <!-- Title -->
      <USkeleton class="mb-2 h-7 w-1/3 place-self-center sm:h-8" />

      <!-- Stats -->
      <div class="flex place-content-between">
        <div class="flex place-items-center gap-2">
          <USkeleton class="h-5 w-5 rounded-full" />
          <USkeleton class="h-4 w-12" />
        </div>

        <USkeleton class="h-5 w-16" />

        <div class="flex place-items-center gap-2">
          <USkeleton class="h-4 w-12" />
          <USkeleton class="h-5 w-5 rounded-full" />
        </div>
      </div>

      <!-- Card -->
      <UCard
        :ui="{
          header: 'p-0 sm:px-0',
          body: 'p-2 sm:p-4 sm:pt-2 w-full flex-1 flex flex-col gap-2 sm:gap-4 place-content-between place-items-center select-none',
        }"
        class="bg-elevated flex min-h-[50dvh] flex-col divide-none shadow-md"
        variant="subtle"
      >
        <div class="flex w-full place-content-between place-items-center">
          <USkeleton class="h-9 w-24 rounded-md" />
          <USkeleton class="h-6 w-16 rounded-md" />
        </div>

        <USkeleton class="h-8 w-3/4 sm:h-10" />

        <div></div>

        <template #header>
          <USkeleton class="h-1 w-full rounded-none" />
        </template>
      </UCard>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div class="col-span-1"></div>

        <div
          class="order-first col-span-full flex place-content-center place-items-center gap-3 sm:order-0 sm:col-span-1"
        >
          <USkeleton class="h-12 w-24 rounded-lg" />
          <USkeleton class="h-12 w-24 rounded-lg" />
        </div>

        <div class="col-span-1"></div>
      </div>
    </div>
  </UContainer>
</template>
