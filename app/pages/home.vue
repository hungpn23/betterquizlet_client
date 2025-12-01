<script lang="ts" setup>
import { formatTimeAgo } from '@vueuse/core';
import type { SelectMenuItem } from '@nuxt/ui';
import type { UserStats } from '~~/shared/types/deck';

const userStatItems = computed(
  () =>
    [
      {
        title: 'Streak',
        value: userStats.value?.currentStreak,
        icon: 'i-lucide-flame',
        color: 'warning' as const,
      },
      {
        title: 'Total Cards Learned',
        value: userStats.value?.totalCardsLearned,
        icon: 'i-lucide-target',
        color: 'info' as const,
      },
      {
        title: 'Mastery Rate',
        value: userStats.value?.masteryRate + '%',
        icon: 'i-lucide-book-marked',
        color: 'success' as const,
      },
    ] as const,
);

const defaults: DeckUrlParams = {
  page: '1',
  limit: '10',
  filter: 'recently',
  search: '',
} as const;

const toast = useToast();
const router = useRouter();
const { token, data: user } = useAuth();
const urlParams = useUrlSearchParams<Partial<DeckUrlParams>>('history');

const filterItems = ref<SelectMenuItem[]>([
  {
    id: 'recently',
    label: 'Recently',
  },
  {
    id: 'newest',
    label: 'Newest',
  },
  {
    id: 'oldest',
    label: 'Oldest',
  },
  {
    id: 'name_az',
    label: 'Name A-Z',
  },
  {
    id: 'name_za',
    label: 'Name Z-A',
  },
]);

const page = computed({
  get: () => Number(urlParams.page || defaults.page),
  set: (val) => {
    urlParams.page = val === +defaults.page ? undefined : String(val);
  },
});

const limit = computed({
  get: () => String(urlParams.limit || defaults.limit),
  set: (val) => {
    urlParams.limit = val === defaults.limit ? undefined : val;
    urlParams.page = undefined;
  },
});

const filter = computed({
  get: () => urlParams.filter || defaults.filter,
  set: (val) => {
    urlParams.filter = val === defaults.filter ? undefined : val;
    urlParams.page = undefined;
  },
});

const search = ref(urlParams.search || defaults.search);
const debouncedSearch = refDebounced(search, 300);

watch(debouncedSearch, (newSearch) => {
  urlParams.search = newSearch === defaults.search ? undefined : newSearch;
  urlParams.page = undefined;
});

const query = computed(() => {
  let orderBy: DeckOrderBy = 'openedAt';
  let order: QueryOrder = QueryOrder.DESC_NULLS_LAST;

  switch (filter.value) {
    case 'recently':
      orderBy = 'openedAt';
      order = QueryOrder.DESC_NULLS_LAST;
      break;
    case 'newest':
      orderBy = 'createdAt';
      order = QueryOrder.DESC_NULLS_LAST;
      break;
    case 'oldest':
      orderBy = 'createdAt';
      order = QueryOrder.ASC_NULLS_LAST;
      break;
    case 'name_az':
      orderBy = 'name';
      order = QueryOrder.ASC_NULLS_LAST;
      break;
    case 'name_za':
      orderBy = 'name';
      order = QueryOrder.DESC_NULLS_LAST;
      break;
  }

  return {
    page: page.value,
    limit: limit.value,
    search: debouncedSearch.value,
    orderBy,
    order,
  };
});

const totalRecords = computed(
  () => paginated.value?.metadata.totalRecords || 0,
);

const {
  data: paginated,
  error,
  status,
} = useLazyFetch<Paginated<DeckWithStats>, ErrorResponse>('/api/decks', {
  query,
  headers: { Authorization: token.value || '' },
  server: false,
});

const { data: userStats, error: userStatsError } = await useFetch<
  UserStats,
  ErrorResponse
>('/api/study/stats', {
  headers: { Authorization: token.value || '' },
});

watch([error, userStatsError], (newErr) => {
  if (newErr) toast.add({ title: 'Error fetching decks' });
});

function getDeckProgress(deck: DeckWithStats) {
  const total = deck.stats.total;
  const known = deck.stats.known;

  if (total === 0) return 0;

  return Math.round((known / total) * 100);
}
</script>

<template>
  <SkeletonHomePage v-if="status === 'idle' || status === 'pending'" />

  <UPage v-else>
    <UContainer>
      <UPageHeader
        :ui="{
          title:
            'text-2xl sm:text-3xl text-pretty font-semibold text-highlighted',
        }"
      >
        <UPageGrid class="mt-4 sm:grid-cols-1 md:grid-cols-3">
          <UPageCard
            v-for="(c, index) in userStatItems"
            :key="index"
            :ui="{}"
            :class="`text-${c.color}`"
            :spotlight-color="c.color"
            spotlight
            variant="subtle"
          >
            <div class="flex place-content-between place-items-center">
              <h3>{{ c.title }}</h3>
              <UIcon :name="c.icon" size="2rem" />
            </div>

            <p :class="`text-3xl font-bold`">
              {{ c.value }}
            </p>
          </UPageCard>
        </UPageGrid>

        <template #title> Welcome back, {{ user?.username }} </template>

        <template #description>
          <ProseBlockquote>
            {{ getDailyQuote()?.text }}
            <span class="inline-block">
              <ProseIcon name="i-lucide-minus" />
              <span class="ml-2 font-medium not-italic">{{
                getDailyQuote()?.author
              }}</span>
            </span>
          </ProseBlockquote>
        </template>
      </UPageHeader>

      <UPageBody class="space-y-4">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:place-content-between sm:items-center"
        >
          <div class="flex items-center gap-4">
            <h2 class="text-highlighted text-xl text-pretty sm:text-2xl">
              Your Decks ({{ paginated?.data.length || 0 }})
            </h2>

            <UButton
              class="cursor-pointer transition-all hover:scale-105"
              label="Add a new deck"
              variant="subtle"
              icon="i-lucide-plus"
              to="/create-deck"
              size="lg"
            />
          </div>

          <div class="flex items-center gap-4">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Search decks..."
            />

            <USelect v-model="filter" :items="filterItems" value-key="id" />
          </div>
        </div>

        <div
          v-if="paginated && paginated.metadata.totalRecords > 0"
          class="flex flex-col gap-2 sm:gap-4"
        >
          <TransitionGroup name="list" appear>
            <UCard
              v-for="d in paginated.data"
              :key="d.id"
              class="hover:bg-elevated cursor-pointer shadow-md transition-all hover:scale-101"
              variant="subtle"
              @click="
                router.push(`/${user?.username}/${d.slug}?deckId=${d.id}`)
              "
            >
              <div class="grid grid-cols-1 sm:grid-cols-2">
                <div class="flex place-items-center gap-1.5">
                  <h4 class="max-w-5/6 truncate font-medium sm:text-lg">
                    {{ d.name }}
                  </h4>

                  <UIcon
                    :name="getVisibilityIcon(d.visibility)"
                    class="shrink-0 sm:size-5"
                  />
                </div>

                <div class="text-muted text-start text-sm sm:text-end">
                  {{
                    d.openedAt
                      ? `Last opened ${formatTimeAgo(new Date(d.openedAt))}`
                      : 'Never opened'
                  }}
                </div>
              </div>

              <div class="mt-2 flex place-items-center gap-2 sm:gap-4">
                <UTooltip :delay-duration="200" text="Known cards">
                  <UBadge
                    :label="d.stats.known"
                    variant="soft"
                    color="success"
                    icon="i-lucide-circle-check"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="Learning cards">
                  <UBadge
                    :label="d.stats.learning"
                    variant="soft"
                    color="warning"
                    icon="i-lucide-circle-dashed"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="New cards">
                  <UBadge
                    :label="d.stats.new"
                    variant="soft"
                    color="info"
                    icon="i-lucide-sparkles"
                  />
                </UTooltip>

                <UTooltip :delay-duration="200" text="Total cards">
                  <UBadge
                    :label="d.stats.total"
                    variant="soft"
                    color="neutral"
                    icon="i-lucide-gallery-horizontal-end"
                  />
                </UTooltip>
              </div>

              <UProgress :model-value="getDeckProgress(d)" class="mt-4" />
            </UCard>
          </TransitionGroup>
        </div>

        <UPagination
          v-model:page="page"
          :total="totalRecords"
          :items-per-page="Number(limit)"
          :ui="{ root: 'flex place-content-center' }"
        />

        <UPageSection
          v-if="Array.isArray(paginated?.data) && paginated.data.length === 0"
          description="Click Create button to add your first deck!"
        />
      </UPageBody>
    </UContainer>
  </UPage>
</template>

<style scoped></style>
