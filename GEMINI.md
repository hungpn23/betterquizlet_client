# Project Context: Better Quizlet

## 1. Project Overview
**Better Quizlet** is a SaaS flashcard/study application using **Nuxt 4**.
- **Core Goal:** Allow users to create decks, study via flashcards/learn mode/test mode, and track progress.
- **Design System:** Modern, clean, mobile-responsive using Nuxt UI.

## 2. Tech Stack & Versions
- **Framework:** Nuxt 4 (`^4.2.1`) - *Note: This is bleeding edge.*
- **Language:** TypeScript (Strict mode).
- **UI Library:** Nuxt UI (`@nuxt/ui`) + Tailwind CSS.
- **Icons:** Lucide Icons via Nuxt UI (e.g., `icon="i-lucide-home"`).
- **Auth:** `@sidebase/nuxt-auth` (Local provider).
- **Validation:** `valibot` (Schema-first validation).
- **State:** `useState` (server-friendly) & Vue Reactivity (`ref`, `computed`).

## 3. Directory Structure & Architecture
- **`app/components/`**: Reusable UI components.
  - **Naming:** PascalCase (e.g., `DeckCard.vue`, `AppHeader.vue`).
  - **Skeleton:** All loading states go into `components/Skeleton/`.
- **`app/composables/`**: Shared logic & state (e.g., `useDeckSearch.ts`).
- **`app/pages/`**: File-based routing.
  - `[username]/[slug]/`: Deck details & study modes.
- **`shared/types/`**: **Single Source of Truth** for types (`Deck`, `Card`, `User`). ALWAYS import types from here, do not redeclare interfaces in components.

## 4. Coding Conventions (CRITICAL)

### A. Script & Logic
- **Composition API:** ALWAYS use `<script setup lang="ts">`.
- **Type Imports:** Use `import type {...}` for interfaces.
- **Path Aliases:** Use `~` for `app/` root (e.g., `~/utils/constants`). *Avoid relative paths like `../../../`.*
- **Fetching:**
  - Use `useFetch` or `useLazyFetch` for reactive data fetching in components.
  - Use `$fetch` for user actions (POST, PATCH, DELETE) inside functions.
  - Always handle errors explicitly (try/catch or `error` ref).

### B. UI & Styling
- **Components First:** NEVER use raw HTML tags if a Nuxt UI component exists.
  - `<div>` with `flex` -> `<UContainer>` or `<div class="flex">` (if simple).
  - `<button>` -> `<UButton>`.
  - `<input>` -> `<UInput>`.
  - `<a>` -> `<NuxtLink>` or `<UButton to="...">`.
- **Icons:** Use `i-lucide-*` format.
- **Tailwind:** Use utility classes. Avoid `<style>` blocks unless strictly necessary for complex animations.

### C. Specific Patterns (Project Specific)

**1. Deck & Search Logic:**
- ALWAYS use the composable `useDeckSearch()` for any page requiring deck filtering/searching.
- DO NOT duplicate pagination/filter logic in `home.vue` or `community.vue`.

**2. Study Logic:**
- Study modes (`learn.vue`, `test.vue`) must respect `isIgnoreDate`.
- Answers are saved via `/api/study/save-answer`.

**3. Validation:**
- Use `valibot` schemas for all form inputs.
- Define schemas in `shared/types` if reused, or locally if page-specific.

## 5. Refactoring Targets (Active Tasks)
*Note: Be aware of these when generating code.*
- **Deck Cards:** There is duplication in displaying deck items in `home.vue` and `community.vue`. Prefer creating/using a `DeckListItem.vue` component.
- **Search Bar:** Prefer extracting the search/filter UI row into `DeckFilterToolbar.vue`.

## 6. Rules for the AI Agent
- **No Assumptions:** Check `package.json` or existing files before assuming a library exists.
- **Consistency:** Mimic the existing code style (spacing, naming, structure).
- **Safety:** Do not delete files without confirmation.
- **Tests:** If asked to write tests, check `vitest.config.ts` (if exists) or assume Vitest/Vue Test Utils.