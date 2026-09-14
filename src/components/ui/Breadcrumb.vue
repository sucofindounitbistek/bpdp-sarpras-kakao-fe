<script setup lang="ts">
import { computed } from 'vue';
import { ChevronRight } from 'lucide-vue-next';
import { RouterLink, useRoute } from 'vue-router';
import { useNavigation } from '@/composables/useNavigation';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  active?: boolean;
}

interface Props {
  items?: BreadcrumbItem[];
}

const props = defineProps<Props>();

const route = useRoute();
const { filteredNavSections } = useNavigation();

const resolvedItems = computed<BreadcrumbItem[]>(() => {
  // If items are passed as a prop, use them directly (backward compatibility)
  if (props.items && props.items.length > 0) {
    return props.items;
  }

  const list: BreadcrumbItem[] = [
    { label: 'Beranda', to: '/dashboard' }
  ];

  // If we are on the dashboard itself, we only need "Beranda"
  if (route.path === '/dashboard') {
    return [{ label: '', active: true }];
  }

  // Find matching section and item from navigation sections
  const activeMenu = (route.meta && route.meta.activeMenu) as string | undefined;
  const currentPath = route.path;
  let matchedItemLabel = '';
  let matchedItemTo = '';

  for (const section of filteredNavSections.value) {
    for (const item of section.items) {
      const isActiveItem = activeMenu
        ? item.to === activeMenu
        : (currentPath === item.to || currentPath.startsWith(item.to + '/'));

      if (isActiveItem) {
        matchedItemLabel = item.label;
        matchedItemTo = item.to;
        break;
      }
    }
    if (matchedItemLabel) break;
  }

  if (matchedItemLabel) {

    // Determine if the current page is a detailed/child sub-page of the main item
    const isSubPage = activeMenu || (currentPath !== matchedItemTo && currentPath.startsWith(matchedItemTo + '/'));

    if (isSubPage) {
      list.push({ label: matchedItemLabel, to: matchedItemTo });
      const leafTitle = (route.meta && route.meta.title) as string | undefined || 'Detail';
      list.push({ label: leafTitle, active: true });
    } else {
      list.push({ label: matchedItemLabel, active: true });
    }
  } else {
    // Fallback if no matching sidebar item is found
    const routeTitle = (route.meta && route.meta.title) as string | undefined;
    if (routeTitle) {
      list.push({ label: routeTitle, active: true });
    }
  }

  return list;
});
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex items-center text-sm font-apple-caption">
    <ol class="inline-flex items-center gap-1.5 flex-wrap">
      <li v-for="(item, index) in resolvedItems" :key="index" class="inline-flex items-center gap-1.5">
        <ChevronRight v-if="index > 0" class="w-4 h-4 text-slate-400 shrink-0" />

        <RouterLink
          v-if="item.to && !item.active"
          :to="item.to"
          class="text-slate-500 hover:text-[#066C2A] transition-colors font-medium"
        >
          {{ item.label }}
        </RouterLink>
        <span
          v-else
          :aria-current="item.active ? 'page' : undefined"
          class="font-semibold text-slate-900"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
