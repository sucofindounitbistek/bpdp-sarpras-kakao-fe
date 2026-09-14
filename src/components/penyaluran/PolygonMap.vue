<script setup lang="ts">
import { ref } from 'vue';
import { LOCALIZATION } from '@/config/localization';
import { MapPin, Layers, CheckCircle2 } from 'lucide-vue-next';

const areaSize = ref(4.3);
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-xs">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin class="w-5 h-5 text-[#066C2A]" /> {{ LOCALIZATION.polygonMap.title }}
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">{{ LOCALIZATION.polygonMap.subtitle }}</p>
      </div>

      <div class="flex items-center gap-2">
        <span class="bg-emerald-100 text-[#066C2A] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <CheckCircle2 class="w-3.5 h-3.5" /> {{ LOCALIZATION.polygonMap.badgeValid.replace('{size}', String(areaSize)) }}
        </span>
      </div>
    </div>

    <!-- Simulated Interactive Polygon Map Viewport -->
    <div class="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group">
      <!-- Simulated Satellite Tiles Background -->
      <div class="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style="background-image: radial-gradient(#10b981 1px, transparent 1px); background-size: 16px 16px;"></div>

      <!-- Drawn Polygon Overlay Mockup -->
      <svg class="absolute inset-0 w-full h-full stroke-emerald-400 fill-emerald-500/20 stroke-2 drop-shadow-md">
        <polygon points="120,40 280,30 340,160 190,210 90,140" />
        <circle cx="120" cy="40" r="4" class="fill-white stroke-emerald-600 stroke-2" />
        <circle cx="280" cy="30" r="4" class="fill-white stroke-emerald-600 stroke-2" />
        <circle cx="340" cy="160" r="4" class="fill-white stroke-emerald-600 stroke-2" />
        <circle cx="190" cy="210" r="4" class="fill-white stroke-emerald-600 stroke-2" />
        <circle cx="90" cy="140" r="4" class="fill-white stroke-emerald-600 stroke-2" />
      </svg>

      <!-- Map Control Badge -->
      <div class="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
        <Layers class="w-3 h-3 text-emerald-400" /> {{ LOCALIZATION.polygonMap.layerLabel }}
      </div>

      <div class="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700">
        {{ LOCALIZATION.polygonMap.coordLabel.replace('{lat}', '-2.54129').replace('{lng}', '120.93812') }}
      </div>
    </div>
  </div>
</template>
