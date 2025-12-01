<template>
  <UContainer>
    <div class="mt-4 flex w-full flex-col gap-2">
      <!-- Header Navigation -->
      <div class="flex place-content-between place-items-center gap-2">
        <USkeleton class="h-9 w-32" />
        <USkeleton class="h-9 w-24" />
      </div>

      <!-- Title & Content -->
      <div class="mb-8 flex w-full flex-col gap-2">
        <USkeleton class="mb-2 h-7 w-1/3 place-self-center sm:h-8" />

        <!-- Stats -->
        <div class="flex place-content-between place-items-center">
          <!-- Incorrect -->
          <div class="flex place-items-center gap-2">
            <USkeleton class="h-6 w-6 rounded-full" />
            <USkeleton class="h-5 w-16" />
          </div>

          <!-- Progress Text -->
          <USkeleton class="h-5 w-16" />

          <!-- Correct -->
          <div class="flex place-items-center gap-2">
            <USkeleton class="h-5 w-16" />
            <USkeleton class="h-6 w-6 rounded-full" />
          </div>
        </div>

        <!-- Main Card -->
        <UCard
          :ui="{
            header: 'p-0 sm:px-0',
            body: 'flex-1 w-full flex flex-col gap-4 sm:gap-4 place-content-between p-2',
          }"
          class="bg-elevated flex min-h-[50dvh] flex-col divide-none sm:shadow-md"
        >
          <!-- Card Header (Progress) -->
          <template #header>
            <USkeleton class="h-1 w-full rounded-none" />
          </template>

          <!-- Top Row -->
          <div class="flex w-full place-content-between place-items-center">
            <div class="flex place-items-center gap-1">
              <USkeleton class="h-9 w-9 rounded-full" />
              <USkeleton class="h-6 w-12" />
            </div>
            <USkeleton class="h-9 w-24" />
          </div>

          <!-- Question -->
          <USkeleton class="h-8 w-3/4 sm:h-10" />

          <!-- Answer Section -->
          <div class="mt-2 flex w-full flex-col gap-2">
            <USkeleton class="h-6 w-32" />

            <!-- Multiple Choice Grid Placeholder -->
            <div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
              <USkeleton
                v-for="i in 4"
                :key="i"
                class="h-16 w-full rounded-md"
              />
            </div>
          </div>

          <!-- Bottom Actions inside Card -->
          <div class="flex place-content-end place-items-center gap-2">
            <USkeleton class="h-9 w-16" />
          </div>
        </UCard>

        <!-- Bottom Area -->
        <div class="grid grid-cols-3 gap-2">
          <div />
          <div />
          <div class="flex place-items-center place-self-end">
            <USkeleton class="h-10 w-10 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
