<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const {
  deck,
  session,
  status,
  isIgnoreDate,
  progress,
  deckId,
  deckSlug,
  username,
  onRestart,
  onIgnoreDate,
  handleAnswer,
} = useDeck();

const settingOptions = computed<DropdownMenuItem[]>(() => [
  [
    {
      label: 'Restart progress',
      icon: 'i-lucide-refresh-cw',
      color: 'warning',
      onSelect: onRestart,
    },
    {
      label: 'Ignore review dates',
      icon: `i-lucide-calendar${isIgnoreDate.value ? '-off' : ''}`,
      type: 'checkbox',
      checked: isIgnoreDate.value,
      onUpdateChecked(checked: boolean) {
        isIgnoreDate.value = checked;
      },
      onSelect(e: Event) {
        e.preventDefault();
        isIgnoreDate.value = !isIgnoreDate.value;
      },
    },
  ],
]);
</script>

<template>
  <SkeletonFlashcardsPage v-if="status === 'idle' || status === 'pending'" />

  <UContainer v-else>
    <AppFlashcard
      :deck="{ id: deckId, title: deck?.name, slug: deckSlug }"
      :session="session"
      :progress
      @restarted="onRestart"
      @ignore-date="onIgnoreDate"
      @answer="handleAnswer"
    >
      <template #routes>
        <div class="flex place-content-between place-items-center gap-2">
          <UButton
            :to="`/${username}/${deckSlug}?deckId=${deckId}`"
            class="mt-2 cursor-pointer px-0 text-base"
            variant="link"
            icon="i-lucide-move-left"
            label="Go back"
          />

          <UButton
            :to="`/${username}/${deckSlug}/learn?deckId=${deckId}`"
            class="mt-2 cursor-pointer px-0 text-base"
            variant="link"
            trailing-icon="i-lucide-move-right"
            label="Go to Learn"
          />
        </div>
      </template>

      <template #actions-right>
        <div class="flex place-content-end place-items-center gap-2">
          <UButton
            class="cursor-pointer"
            color="neutral"
            icon="i-lucide-shuffle"
            variant="ghost"
            size="lg"
          />

          <UDropdownMenu :items="settingOptions">
            <UButton
              class="cursor-pointer"
              color="neutral"
              icon="i-lucide-settings"
              variant="ghost"
              size="lg"
            />
          </UDropdownMenu>
        </div>
      </template>
    </AppFlashcard>
  </UContainer>
</template>
