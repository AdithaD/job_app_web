<script lang="ts">
	import type { WithElementRef } from '$lib/utils';
	import type { HTMLBaseAttributes } from 'svelte/elements';

	let { children }: WithElementRef<HTMLBaseAttributes> = $props();
</script>

<div class="flex min-h-screen justify-center gap-4 p-8">
	<div class="flex flex-col gap-8 rounded-lg border-2 p-4 lg:w-1/2 lg:p-8">
		{@render children?.()}
	</div>
</div>
