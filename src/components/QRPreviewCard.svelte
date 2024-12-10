<!-- src/components/QRPreviewCard.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { getCurrentColorScheme, generateNatureGradient, type TimeColorScheme } from './colorScheme';
  
  export let pageTitle: string | undefined = undefined;
  export let pageDescription: string | undefined = undefined;
  export let pagePublished: Date | undefined = undefined;
  export let pageEdited: Date | undefined = undefined;
  export let pageTags: string[] | undefined = undefined;
  export let qrDataUrl: string | undefined = undefined;
  export let siteName: string;
  export let currentUrl: string;

  const formatDate = (date: Date) => {
    return date.getFullYear() + '.' + 
           String(date.getMonth() + 1).padStart(2, '0') + '.' + 
           String(date.getDate()).padStart(2, '0');
  };

  const topMaskId = `top-mask-${Math.random().toString(36).substring(2, 9)}`;
  const bottomMaskId = `bottom-mask-${Math.random().toString(36).substring(2, 9)}`;

  let colorScheme: TimeColorScheme;
  let natureGradientBackground: string;

  onMount(() => {
    colorScheme = getCurrentColorScheme();
    natureGradientBackground = generateNatureGradient(colorScheme.colors);
  });
</script>

<div class="relative w-full max-w-sm mx-auto">
  <!-- Top section with mask -->
  <div class="bg-white overflow-hidden relative" style="mask: url(#{topMaskId}); -webkit-mask: url(#{topMaskId})">
    <svg width="100%" height="100%" class="absolute">
      <defs>
        <mask id={topMaskId}>
          <rect width="100%" height="100%" fill="white"/>
          <circle cx="0" cy="100%" r="12" fill="black"/>
          <circle cx="100%" cy="100%" r="12" fill="black"/>
        </mask>
      </defs>
    </svg>

    <!-- Top colored strip -->
    <!-- <div class="h-3 bg-gradient-to-r from-blue-500 to-purple-600"></div> -->
    
    <div class="p-6 pb-6">
      <!-- Blog title and logo -->
      <div class="flex items-center gap-2 mb-6">
        <slot name="blog-icon">
          <div class="w-6 h-6 bg-lime-800 rounded-full"></div>
        </slot>
        <span class="text-xl font-bold font-inter text-zinc-600">{siteName}</span>
      </div>

      <!-- Page Title section -->
      <h3 class="font-bold text-xl text-gray-800 mb-4">
        {pageTitle || 'Untitled Page'}
      </h3>

      <!-- Description -->
      {#if pageDescription}
        <p class="text-sm text-gray-600 mb-6">
          {pageDescription}
        </p>
      {/if}

      <!-- Tags -->
      {#if pageTags && pageTags.length > 0}
        <div class="flex flex-wrap gap-2 mb-6">
          {#each pageTags.slice(0, 3) as tag}
            <span class="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
              {tag}
            </span>
          {/each}
        </div>
      {/if}

      <!-- Dates section with adjusted grid layout -->
      <div class="border-t border-gray-100 pt-4">
        <div class="grid grid-rows-[auto_1fr] grid-cols-[1fr_auto_1fr] gap-x-4 gap-y-3">
          <!-- Published/Updated header -->
          <div class="text-sm text-gray-500 text-center">公開/更新</div>
          
          <!-- Arrow header (empty for alignment) -->
          <div class=""></div>
          
          <!-- Save header -->
          <div class="text-sm text-gray-500 text-center">保存</div>
          
          <!-- Published/Updated dates -->
          <div class="font-mono text-sm">
            {#if pagePublished}
              <div class="text-gray-800 text-center leading-tight">
                {formatDate(pagePublished)}
              </div>
            {/if}
            {#if pageEdited && pageEdited.getTime() !== pagePublished?.getTime()}
              <div class="flex justify-center items-center gap-1 text-gray-800 leading-tight mt-1">
                <span class="text-gray-400">↪︎</span>
                <span>{formatDate(pageEdited)}</span>
              </div>
            {/if}
          </div>
          
          <!-- Arrow -->
          <div class="flex justify-center items-center text-gray-300 px-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/>
              <path d="m14 6 6 6-6 6"/>
            </svg>
          </div>
          
          <!-- Save date -->
          <div class="font-mono text-gray-800 text-center flex items-center justify-center">
            {formatDate(new Date())}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom section with mask -->
  <div class="bg-white overflow-hidden mt-[-1px] border-t-2 border-white relative" style="mask: url(#{bottomMaskId}); -webkit-mask: url(#{bottomMaskId})">
    <svg width="100%" height="100%" class="absolute">
      <defs>
        <mask id={bottomMaskId}>
          <rect width="100%" height="100%" fill="white"/>
          <circle cx="0" cy="0" r="12" fill="black"/>
          <circle cx="100%" cy="0" r="12" fill="black"/>
        </mask>
      </defs>
    </svg>

    <!-- QR code section -->
    {#if qrDataUrl}
    <div class="px-6 pb-6 pt-1">
      <!-- <div class="bg-gray-50 p-3 rounded-2xl"> -->
      <div 
        class="p-3 pt-4 rounded-2xl backdrop-blur-sm transition-all duration-1000 relative overflow-hidden"
        style:background-image={natureGradientBackground}
        >
        <!-- <div class="w-40 h-40 mx-auto bg-white rounded-xl p-3 shadow-sm"> -->
        <div class="w-40 h-40 mx-auto bg-white backdrop-blur-md rounded-xl p-3 shadow-lg">
          <img
            src={qrDataUrl}
            alt="Page QR Code"
            class="w-full h-full"
          />
        </div>
        <!-- <div class="text-center mt-3 font-mono text-xs text-gray-500"> -->
        <div class="text-center mt-3 font-mono text-xs text-white/90 drop-shadow-md">
          {new URL(currentUrl).toString()}
        </div>
      </div>
    </div>
    {/if}
  </div>
</div>

<style>
  /* Ensure mask works across browsers */
  @supports (-webkit-mask: url()) or (mask: url()) {
    /* Top section: 上部のみ角丸 */
    div[style*="top-mask-"] {
      border-radius: 1.5rem 1.5rem 0 0;
    }
    
    /* Bottom section: 下部のみ角丸 */
    div[style*="bottom-mask-"] {
      border-radius: 0 0 1.5rem 1.5rem;
    }
  }
  
  :global([style*="background-image"]) {
    position: relative;
    overflow: hidden;
  }

  :global([style*="background-image"]::before) {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    filter: blur(10px);
    opacity: 0.5;
    z-index: -1;
    transform: scale(1.1);
  }
</style>