<script lang="ts">
	import DashboardJobCard from './DashboardJobCard.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { add, format, isAfter, isBefore, sub } from 'date-fns';
	import Input from '$lib/components/ui/input/input.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	const { data } = $props();
	const isMobile = new IsMobile();

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
	let filtersExpanded = $state<boolean>(false);

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

<div class="flex min-h-screen flex-1 flex-col gap-4 bg-background p-4 lg:flex-row lg:gap-8 lg:p-8">
	<div class="flex min-h-0 grow flex-col gap-4 lg:flex-4">
		<h1 class="text-3xl font-bold lg:text-4xl">Job List</h1>
		<div class="flex flex-col gap-2">
			<button
				type="button"
				onclick={() => (filtersExpanded = !filtersExpanded)}
				class="flex items-center justify-between rounded-lg border p-2 font-semibold hover:bg-accent"
			>
				<span>Filter by</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-5 transition-transform {filtersExpanded ? 'rotate-180' : ''}"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
				</svg>
			</button>
			{#if filtersExpanded}
				<div class="flex flex-col gap-2 lg:flex-row lg:justify-between lg:gap-4">
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
			{/if}
		</div>
		{#if isMobile.current}
			<!-- Mobile Card View -->
			<div class="flex min-h-0 grow flex-col gap-3 overflow-y-auto rounded-lg border-2 p-3">
				{#if filteredJobs.length > 0}
					{#each filteredJobs as job}
						<Card.Root
							class="cursor-pointer transition-colors hover:bg-accent"
							onclick={() => (window.location.href = `/job/${job.id}`)}
						>
							<Card.Content>
								<div class="flex items-start justify-between gap-2">
									<div class="flex-1 space-y-1">
										<div class="leading-tight font-bold">{job.title}</div>
										<div class="text-xs text-muted-foreground">
											{job.scheduledDate
												? format(job.scheduledDate, 'dd/MM/yyyy HH:mm')
												: 'No date'}
										</div>
									</div>
									<div class="text-right">
										<div class="text-sm font-bold">${job.quotedAmount}</div>
									</div>
								</div>
								<div class="mt-2 flex gap-2 text-xs text-muted-foreground">
									<div class="flex-1 truncate">
										📍 {job.location ?? 'No location'}
									</div>
									<div class="truncate">
										👤 {job.client?.name ?? 'No client'}
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				{:else}
					<div class="flex grow flex-col items-center justify-center">No jobs</div>
				{/if}
			</div>
		{:else}
			<!-- Desktop Table View -->
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
								<Table.Row
									class="cursor-pointer hover:bg-accent"
									onclick={() => (window.location.href = `/job/${job.id}`)}
								>
									<Table.Cell class="font-medium">
										{job.scheduledDate
											? format(job.scheduledDate, 'hh:mm dd/MM/yyyy')
											: 'No date set.'}
									</Table.Cell>
									<Table.Cell class="font-bold">{job.title}</Table.Cell>
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
		{/if}
	</div>
	<div class="lg:max-w-xs lg:flex-1">
		<h2 class="mb-4 text-xl font-bold lg:text-2xl">Quick Actions</h2>
		<div class="flex flex-col gap-4">
			<Button class="h-16 font-bold" variant="default" href="/job/new">Add New Job</Button>
			<Button variant="secondary">Quick Search</Button>
			<Button variant="outline" href="/templates">Manage Templates</Button>
			<Button variant="outline" href="/clients">Manage Clients</Button>
			<Button variant="outline" href="/settings">Business Settings</Button>
		</div>
	</div>
</div>
