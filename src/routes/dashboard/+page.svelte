<script lang="ts">
	import DashboardJobCard from './DashboardJobCard.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const { data } = $props();
</script>

<div class="flex h-screen flex-col p-8">
	<div class="flex min-h-0 flex-1 gap-8 rounded-lg border-2 p-8">
		<div class="flex min-h-0 flex-1 flex-col">
			<h1 class="mb-4 text-4xl font-bold">Upcoming</h1>
			<div class="grid min-h-0 flex-1 gap-4 overflow-y-auto">
				{#each data.jobs as job}
					<DashboardJobCard {job} />
				{/each}
			</div>
		</div>
		<div class="flex-2"></div>
		<div class="flex-1">
			<h2 class="mb-4 text-2xl font-bold">Quick Actions</h2>
			<div class="flex flex-col gap-4">
				<Button class="h-16 font-bold" variant="default">Add New Job</Button>
				<Button variant="secondary">Quick Search</Button>
			</div>
		</div>
	</div>
</div>
