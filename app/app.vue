<script setup lang="ts"></script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <GoodyearLogo />
      </template>
    </UHeader>
    <UMain><NuxtPage /></UMain>
  </UApp>
  <UFooter class="mt-auto">
    <template #left>
      <p class="text-muted text-sm">
        Copyright © Warmind2x {{ new Date().getFullYear() }}
      </p>
    </template>
  </UFooter>
</template>
