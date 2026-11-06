<template>
  <footer class="border-t border-slate-800/80 bg-slate-950 py-10 text-slate-400 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-xs">
          A
        </div>
        <div>
          <span class="text-sm font-bold tracking-widest text-slate-200 uppercase">ARTSHOP</span>
          <span class="text-xs text-slate-400 ml-1.5 font-mono">STUDIO</span>
        </div>
      </div>
      <p class="text-xs text-slate-400">
        © {{ new Date().getFullYear() }} ARTSHOP Studio & Curated Gallery. All rights reserved.
      </p>
    </div>
  </footer>
</template>
