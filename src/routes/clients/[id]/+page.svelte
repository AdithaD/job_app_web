<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { enhance } from '$app/forms';
	import { format } from 'date-fns';
	import { jobStatusToString } from '$lib/utils';

	let { data } = $props();

	let deleteDialogOpen = $state(false);
	let deleteJobs = $state(false);
	let isDeleting = $state(false);
</script>

<div class="flex min-h-screen flex-col items-stretch gap-8 p-4 lg:p-8">
	<Button onclick={() => history.back()} class="w-min" variant="outline">Back</Button>

	<div class="flex flex-col gap-4">
		<div class="flex justify-between">
			<div>
				<h1 class="text-4xl font-bold">{data.client.name}</h1>
				<Badge variant="outline" class="mt-2">
					{data.client.jobs.length} Job{data.client.jobs.length !== 1 ? 's' : ''}
				</Badge>
			</div>
			<Button variant="destructive" onclick={() => (deleteDialogOpen = true)}>Delete Client</Button>
		</div>

		<div class="flex w-full gap-8">
			<div class="flex flex-1 flex-col gap-4">
				<h2 class="text-xl font-semibold">Contact Information</h2>
				<div class="space-y-2">
					{#if data.client.email}
						<div class="flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-5 w-5 shrink-0"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
								/>
							</svg>
							<span class="break-all">{data.client.email}</span>
						</div>
					{/if}
					{#if data.client.phone}
						<div class="flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-5 w-5 shrink-0"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
								/>
							</svg>
							<span>{data.client.phone}</span>
						</div>
					{/if}
					{#if data.client.address}
						<div class="flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-5 w-5 shrink-0"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
								/>
							</svg>
							<span>{data.client.address}</span>
						</div>
					{/if}
					{#if !data.client.email && !data.client.phone && !data.client.address}
						<p class="text-muted-foreground">No contact information</p>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-4">
		<h2 class="text-2xl font-bold">Related Jobs</h2>
		{#if data.client.jobs.length === 0}
			<div class="flex items-center justify-center rounded-lg border-2 p-12">
				<p class="text-muted-foreground">No jobs for this client</p>
			</div>
		{:else}
			<div class="rounded-lg border-2">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Job #</Table.Head>
							<Table.Head>Title</Table.Head>
							<Table.Head>Scheduled Date</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Quoted Amount</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.client.jobs as job}
							<Table.Row
								class="cursor-pointer hover:bg-accent"
								onclick={() => (window.location.href = `/job/${job.id}`)}
							>
								<Table.Cell class="font-medium">#{job.jobNumber}</Table.Cell>
								<Table.Cell class="font-bold">{job.title}</Table.Cell>
								<Table.Cell>
									{job.scheduledDate ? format(job.scheduledDate, 'dd/MM/yyyy') : 'Not scheduled'}
								</Table.Cell>
								<Table.Cell>{jobStatusToString(job.jobStatus)}</Table.Cell>
								<Table.Cell class="text-right">${job.quotedAmount}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/if}
	</div>
</div>

<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Client</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{data.client.name}</strong>?
				{#if data.client.jobs.length > 0}
					<br /><br />
					This client has {data.client.jobs.length} job{data.client.jobs.length !== 1 ? 's' : ''}.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/delete"
			use:enhance={() => {
				isDeleting = true;
				return async ({ update }) => {
					await update();
					isDeleting = false;
				};
			}}
		>
			{#if data.client.jobs.length > 0}
				<div class="my-4 flex items-center space-x-2 rounded-lg border p-4">
					<Checkbox id="deleteJobs" name="deleteJobs" value="true" bind:checked={deleteJobs} />
					<Label for="deleteJobs" class="cursor-pointer font-normal">
						Also delete all {data.client.jobs.length} related job{data.client.jobs.length !== 1
							? 's'
							: ''}
					</Label>
				</div>
				<p class="text-sm text-muted-foreground">
					{deleteJobs
						? 'All jobs will be permanently deleted along with their works, materials, and notes.'
						: 'Jobs will be kept but unlinked from this client.'}
				</p>
			{/if}
			<Dialog.Footer class="mt-4">
				<Button
					type="button"
					variant="outline"
					onclick={() => (deleteDialogOpen = false)}
					disabled={isDeleting}
				>
					Cancel
				</Button>
				<Button type="submit" variant="destructive" disabled={isDeleting}>
					{isDeleting ? 'Deleting...' : 'Delete Client'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
