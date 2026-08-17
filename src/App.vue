<template>
  <div
    class="fixed top-0 left-0 w-full h-[40px] bg-slate-900 text-slate-100 flex items-center justify-center text-xs sm:text-sm font-medium z-[9999] shadow-md border-b border-slate-700 select-none pointer-events-auto"
  >
    <span>
      获取网站源码，请访问：
      <a
        href="https://github.com/softwarelink-net/26-lz-ai-bid"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sky-400 hover:text-sky-300 underline underline-offset-2 ml-1"
      >
        https://github.com/softwarelink-net/26-lz-ai-bid
      </a>
    </span>
  </div>
  <main class="pt-[40px] min-h-screen">
    <RouterView />
  </main>
</template>
