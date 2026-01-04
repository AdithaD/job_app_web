<script lang="ts">
	import DashboardJobCard from './DashboardJobCard.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { add, format, isAfter, isBefore, sub } from 'date-fns';
	import Input from '$lib/components/ui/input/input.svelte';

	const { data } = $props();

	const dateFilters: { text: string; from?: Date; to?: Date }[] = [
		{
			text: 'Past',
			to: new Date()
		},
		{
			text: 'Last 7 days',
			from: sub(new Date(), { days: 7 }),
			to: new Date()
		},
		{
			text: 'Next 7 days',
			from: new Date(),
			to: add(new Date(), { days: 7 })
		},
		{
			text: 'Future',
			from: new Date()
		}
	];

	let dateFilter = $state<string>();

	let titleFilter = $state<string | null>(null);
	let locationFilter = $state<string | null>(null);
	let clientFilter = $state<string | undefined>();

	$inspect(data.jobs);

	const filteredJobs = $derived.by(() => {
		return data.jobs
			.filter((j) => !clientFilter || j.clientId == clientFilter)
			.filter(
				(j) =>
					!titleFilter || (titleFilter && j.title.toLowerCase().includes(titleFilter.toLowerCase()))
			)
			.filter(
				(j) =>
					!locationFilter ||
					(locationFilter &&
						(j.location?.toLowerCase().includes(locationFilter.toLowerCase()) ?? false))
			)
			.filter((j) => {
				const df = dateFilters.find((i) => i.text == dateFilter);
				return (
					!df ||
					!j.scheduledDate ||
					((!df.to || isBefore(j.scheduledDate, df.to)) &&
						(!df.from || isAfter(j.scheduledDate, df.from)))
				);
			})
			.sort(
				(a, b) =>
					(a.scheduledDate ?? new Date(86400000000000000)).getTime() -
					(b.scheduledDate ?? new Date(864000000000000)).getTime()
			);
	});
</script>

<div class="flex h-screen flex-1 gap-8 bg-background p-8">
	<div class="flex min-h-0 flex-4 flex-col gap-4">
		<h1 class="text-4xl font-bold">Job List</h1>
		<div class="flex flex-col gap-2">
			<div class="font-semibold">Filter by</div>
			<div class="flex justify-between gap-4">
				<Select.Root allowDeselect={true} type="single" bind:value={dateFilter}>
					<Select.Trigger class="w-full">
						{dateFilter && dateFilter?.length > 0 ? dateFilter : 'Date'}
					</Select.Trigger>
					<Select.Content>
						{#each dateFilters as df}
							<Select.Item value={df.text} />
						{/each}
					</Select.Content>
				</Select.Root>
				<Input placeholder="Name" bind:value={titleFilter}></Input>
				<Input placeholder="Location" bind:value={locationFilter}></Input>
				<Select.Root allowDeselect={true} type="single" bind:value={clientFilter}>
					<Select.Trigger class="w-full">
						{data.clients?.find((c) => c.id == clientFilter)?.name ?? 'Client'}
					</Select.Trigger>
					<Select.Content>
						{#each data.clients as client}
							<Select.Item value={client.id} label={client.name} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<div class="flex min-h-0 grow flex-col gap-4 overflow-y-auto rounded-lg border-2">
			{#if filteredJobs.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[100px]">Scheduled Date</Table.Head>
							<Table.Head class="w-[100px]">Title</Table.Head>
							<Table.Head>Location</Table.Head>
							<Table.Head>Client Name</Table.Head>
							<Table.Head class="text-right">Quoted Amount</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filteredJobs as job}
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
				<div class="flex grow flex-col items-center justify-center">No jobs</div>
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
