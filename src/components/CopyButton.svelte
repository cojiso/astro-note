<!-- src/components/CopyButton.svelte -->

<script lang="ts">
  import { copy } from 'svelte-copy';
  import { onMount } from 'svelte';

  let currentUrl = '';
  let showFeedback = false;

  onMount(() => {
    currentUrl = window.location.href;
  });
</script>

<button
  use:copy={{
    text: currentUrl,
    onCopy: () => {
      showFeedback = true;
      setTimeout(() => showFeedback = false, 800);
    }
  }}
  aria-label="Save page URL"
  {...$$restProps}
>
  <slot />
  {#if showFeedback}
    <span 
      class="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-50 shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-zinc-600 text-sm rounded-lg flex items-center gap-1.5 whitespace-nowrap"
    >
      <slot name="feedback-icon" />
      Copied!
    </span>
  {/if}
</button>