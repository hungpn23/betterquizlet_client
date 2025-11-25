<script lang="ts" setup>
import { breakpointsTailwind } from '@vueuse/core';

const breakpoints = useBreakpoints(breakpointsTailwind);
const smAndLarger = breakpoints.greaterOrEqual('sm');

const isShortcutOpen = ref(false);
</script>

<template>
  <UModal
    v-model:open="isShortcutOpen"
    :ui="{
      content: 'divide-none',
      body: 'flex-initial pt-0 sm:pt-0',
      footer: 'place-content-end',
    }"
  >
    <UButton
      v-if="smAndLarger"
      class="cursor-pointer"
      icon="i-lucide-keyboard"
      variant="ghost"
      color="neutral"
      size="lg"
      @click="isShortcutOpen = true"
    />

    <template #title>
      <h2 class="text-2xl font-semibold sm:text-3xl">Keyboard Shortcuts</h2>
    </template>

    <template #body>
      <div class="flex flex-col gap-2 font-semibold">
        <USeparator label="Flashcard" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Flip card</div>

          <div class="flex place-items-center">
            <Kbd label="Space" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Skip</div>

          <div class="flex place-items-center">
            <Kbd :icon="{ name: 'i-lucide-move-left' }" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Next</div>

          <div class="flex place-items-center">
            <Kbd :icon="{ name: 'i-lucide-move-right' }" />
          </div>
        </div>

        <USeparator label="Learning" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Choose an answer</div>

          <div class="flex place-items-center">
            <Kbd label="1" />
            <Kbd label="2" />
            <Kbd label="3" />
            <Kbd label="4" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Get a hint</div>

          <div class="place-items center flex">
            <Kbd label="Shift" />
            <Kbd label="/" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Don't know</div>

          <div class="place-items center flex">
            <Kbd label="Shift" />
            <Kbd label="X" />
          </div>
        </div>

        <USeparator label="Routing" />

        <div class="flex place-content-between place-items-center gap-2">
          <div>Move back</div>

          <div class="place-items center flex">
            <Kbd :icon="{ name: 'i-lucide-command', size: 4 }" />
            <Kbd :icon="{ name: 'i-lucide-move-left' }" />
          </div>
        </div>

        <div class="flex place-content-between place-items-center gap-2">
          <div>Move forward</div>

          <div class="place-items center flex">
            <Kbd :icon="{ name: 'i-lucide-command', size: 4 }" />
            <Kbd :icon="{ name: 'i-lucide-move-right' }" />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
