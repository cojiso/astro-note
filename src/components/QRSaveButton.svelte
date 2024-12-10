<!-- src/components/QRSaveButton.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { toPng } from 'html-to-image';
  import QRCode from 'qrcode';
  import QRPreviewCard from './QRPreviewCard.svelte';
  // import { Icon } from 'astro-icon/components';
  // import Icon from '@iconify/svelte';
  import { Orbit } from 'lucide-svelte';

  export let pageTitle: string | undefined = undefined;
  export let pageDescription: string | undefined = undefined;
  export let pagePublished: Date | undefined = undefined;
  export let pageEdited: Date | undefined = undefined;
  export let pageTags: string[] | undefined = undefined;
  export let siteName: string[] | undefined = undefined;

  let currentUrl = '';
  let qrDataUrl = '';
  let modalOpen = false;
  let dialogEl: HTMLDialogElement;
  let triggerBtn: HTMLButtonElement;
  let cardEl: HTMLDivElement;

  onMount(async () => {
    const url = new URL(window.location.href);
    currentUrl = `${url.origin}${url.pathname}`;
    qrDataUrl = await QRCode.toDataURL(currentUrl, {
      margin: 1,
      width: 160
    });
  });

  const openModal = () => {
    dialogEl?.showModal();
    modalOpen = true;
  };

  const closeModal = () => {
    dialogEl?.close();
    modalOpen = false;
    triggerBtn?.focus();
  };

  const saveImage = async () => {
    if (!cardEl) return;

    try {
      const dataUrl = await toPng(cardEl, {
        quality: 0.95,
        pixelRatio: 2
      });

      const link = document.createElement('a');
      const filename = `${pageTitle?.slice(0, 50) || 'page'}-${
        new Date().toISOString().split('T')[0]
      }.png`;

      link.href = dataUrl;
      link.download = filename;
      link.click();

      setTimeout(closeModal, 500);
    } catch (err) {
      console.error('Failed to save image:', err);
    }
  };
</script>

<button
  bind:this={triggerBtn}
  on:click={openModal}
  aria-haspopup="dialog"
  class={$$props.class}
>
  <slot />
</button>

<dialog
  bind:this={dialogEl}
  class="bg-transparent p-0"
  aria-labelledby="dialog-title"
>
  <div class="fixed inset-0 flex items-center justify-center p-4">
    <div class="relative">
      <!-- Close button -->
      <button
        type="button"
        class="fixed top-4 right-4 p-2 text-zinc-300 hover:text-zinc-200 z-10"
        on:click={closeModal}
        aria-label="Close dialog"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <!-- QRカードのプレビュー -->
      <div bind:this={cardEl}>
        <QRPreviewCard
          {pageTitle}
          {pageDescription}
          {pagePublished}
          {pageEdited}
          {pageTags}
          {qrDataUrl}
          {siteName}
          {currentUrl}
          >
          <!-- <slot name="preview-icon" slot="blog-icon" /> -->
          <!-- <Icon icon="lucide:orbit" class="w-6 h-6 text-lime-800" slot="blog-icon" /> -->
          <Orbit class="w-6 h-6 text-lime-800" slot="blog-icon" />
        </QRPreviewCard>
      </div>

      <!-- アクションボタン -->
      <div class="mt-6 flex justify-center gap-3">
        <button
          type="button"
          class="px-4 py-2 text-sm text-zinc-300 hover:text-zinc-200"
          on:click={closeModal}
          >
          Cancel
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm bg-lime-600 text-white rounded-lg hover:bg-lime-700"
          on:click={saveImage}
          >
          Save Image
        </button>
      </div>
    </div>
  </div>
</dialog>

<style>
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  dialog[open] {
    display: block;
    background: transparent;
    border: none;
  }
</style>