<script lang="ts">
	import SiteSidebar from './SiteSidebar.svelte';

	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Sidebar.Provider>
	<SiteSidebar></SiteSidebar>
	<main class="grow">
		{@render children?.()}
	</main>
</Sidebar.Provider>
