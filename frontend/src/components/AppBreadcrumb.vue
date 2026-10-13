<template>
  <nav aria-label="breadcrumb" v-if="crumbs.length > 1" class="mb-2">
    <ol class="breadcrumb">
      <li
        v-for="(crumb, i) in crumbs"
        :key="i"
        class="breadcrumb-item"
        :class="{ active: i === crumbs.length - 1 }"
      >
        <RouterLink v-if="i < crumbs.length - 1" :to="crumb.to" class="text-decoration-none">
          {{ crumb.label }}
        </RouterLink>
        <span v-else>{{ crumb.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';

const route = useRoute();

const pathLabels = {
  '': 'Home',
  'barang-masuk': 'Barang Masuk',
  'tambah': 'Tambah Data',
  'edit': 'Edit Data',
  'master': 'Master Data',
  'kategori': 'Kategori',
  'sub-kategori': 'Sub Kategori',
  'users': 'Manajemen User',
};

const crumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean);
  const result = [{ label: 'Home', to: '/barang-masuk' }];

  let accumulated = '';
  parts.forEach((part) => {
    // Check if it's dynamic parameter (like edit ID)
    const isId = !isNaN(part);
    accumulated += '/' + part;
    result.push({
      label: isId ? `#${part}` : (pathLabels[part] || part.charAt(0).toUpperCase() + part.slice(1)),
      to: accumulated,
    });
  });

  return result;
});
</script>
