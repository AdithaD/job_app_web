<script lang="ts">
	import DashboardJobCard from './DashboardJobCard.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	import * as Table from '$lib/components/ui/table/index.js';
	import { format } from 'date-fns';

	const { data } = $props();
</script>

<div class="flex h-screen flex-1 gap-8 bg-background p-8">
	<div class="flex min-h-0 flex-4 flex-col">
		<h1 class="mb-4 text-4xl font-bold">Job List</h1>
		<div class="flex justify-between"></div>
		<div class="flex min-h-0 grow flex-col gap-4 overflow-y-auto rounded-lg border-2">
			{#if data.jobs.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[100px]">Scheduled Date</Table.Head>
							<Table.Head class="w-[100px]">Title</Table.Head>
							<Table.Head>Location</Table.Head>
							<Table.Head>Client Name</Table.Head>
							<Table.Head class="text-right">Total Cost</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.jobs as job}
							<Table.Row>
								<Table.Cell class="font-medium">
									{job.scheduledDate
										? format(job.scheduledDate, 'hh:mm dd/MM/yyyy')
										: 'No date set.'}
								</Table.Cell>
								<Table.Cell class="font-bold"
									><a class="underline transition-colors hover:text-primary" href="/job/{job.id}"
										>{job.title}</a
									></Table.Cell
								>
								<Table.Cell>{job.location ?? 'No location set.'}</Table.Cell>
								<Table.Cell>{job.client?.name ?? 'Unspecified'}</Table.Cell>
								<Table.Cell class="text-right">{job.quotedAmount}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{:else}
				<div class="flex grow flex-col items-center justify-center">No upcoming jobs</div>
			{/if}
		</div>
	</div>
	<div class="flex-1">
		<h2 class="mb-4 text-2xl font-bold">Quick Actions</h2>
		<div class="flex flex-col gap-4">
			<Button class="h-16 font-bold" variant="default" href="/job/new">Add New Job</Button>
			<Button variant="secondary">Quick Search</Button>
		</div>
	</div>
</div>
