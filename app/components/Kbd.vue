<script setup lang="ts">
import type { IconProps } from '@nuxt/ui';

// Định nghĩa props
defineProps<{
  label?: string;
  icon?: IconProps;
}>();
</script>

<template>
  <kbd
    class="inline-flex h-[27px] min-w-10 place-items-center justify-center rounded border border-b-2 border-gray-300 bg-white px-1.5 text-center text-xs font-semibold shadow-md dark:border-gray-500 dark:bg-gray-800"
  >
    <UIcon v-if="icon?.name" :name="icon.name" class="size-5" />

    <span v-else class="leading-none">{{ label }}</span>
  </kbd>
</template>
