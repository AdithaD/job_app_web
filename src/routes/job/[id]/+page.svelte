<script lang="ts">
	import MaterialTable from './MaterialTable.svelte';

	import EditButton from './EditButton.svelte';

	import AddressWithIcon from '$lib/components/ui/AddressWithIcon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';
	import DateWithIcon from '$lib/components/ui/DateWithIcon.svelte';
	import * as Item from '$lib/components/ui/item';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { jobStatusToString, paymentStatusToString } from '$lib/utils.js';
	import NoteTable from './NoteTable.svelte';
	import WorksTable from './WorksTable.svelte';

	let { data } = $props();
</script>

<div class="flex min-h-screen flex-col items-stretch gap-8 p-4 lg:p-8">
	<Button href="/dashboard" class="w-min" variant="outline">Back</Button>
	<div class="flex flex-col gap-4">
		<div class="flex flex-2 justify-between">
			<div>
				<div class="flex items-center justify-start gap-4">
					<h1 class="shrink text-4xl font-bold text-ellipsis">{data.job.title}</h1>
					<div class="text-2xl">
						#{data.job.jobNumber}
					</div>
				</div>
				<Badge variant="outline">{jobStatusToString(data.job.jobStatus)}</Badge>
			</div>
			<EditButton href="{data.job.id}/edit"></EditButton>
		</div>
		<div class="flex w-full gap-8">
			<div class="flex-1">
				<p>{data.job.description}</p>
			</div>
			<div class="flex flex-1 grow flex-col items-stretch gap-2">
				<DateWithIcon date={data.job.scheduledDate} />
				<AddressWithIcon location={data.job.location} />
				<div class="flex w-full flex-2 grow items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
						/>
					</svg>

					{#if data.job.client}
						<Item.Root variant="outline" class="grow">
							<Item.Content>
								<Item.Title>
									{data.job.client.name}
								</Item.Title>
								<Item.Description>
									{data.job.client.address}<br />
									{data.job.client.phone}
								</Item.Description>
							</Item.Content>
							<Item.Actions>
								<Button variant="outline">Details</Button>
							</Item.Actions>
						</Item.Root>
					{:else}
						<p>No client set.</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="flex">
		<div class="flex min-h-0 flex-1 grow flex-col gap-4">
			<div class="flex justify-between">
				<h2 class="mb-4 text-2xl font-bold">Works</h2>
				<Button href="{data.job.id}/work/new" variant="ghost" class="text-muted-foreground">
					Add
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
				</Button>
			</div>
			<WorksTable jobId={data.job.id} editMode={true} works={data.job.works} />
		</div>
	</div>
	<div class="flex flex-col gap-2">
		<div class="flex justify-between">
			<div>
				<div class="flex gap-4">
					<h2 class="text-2xl font-bold">Pricing</h2>
					<Badge variant="outline">{paymentStatusToString(data.job.paymentStatus)}</Badge>
				</div>
			</div>
			<div class="flex justify-between gap-8">
				<form method="POST" action="?/quote">
					<Button class="grow" variant="secondary" type="submit">Generate Quote</Button>
				</form>
				<Button class="grow" variant="secondary">Generate Invoice</Button>
			</div>
		</div>
		<div>
			<div>
				Amount Quoted: ${data.job.quotedAmount}
			</div>
			<div>
				Amount Paid: ${data.job.paidAmount}
			</div>
		</div>
		<div class="grow"></div>
	</div>
	<div class="flex flex-1 flex-col gap-12">
		<div class="flex grow flex-col">
			<div class="flex justify-between">
				<h2 class="mb-4 text-2xl font-bold">Notes</h2>
				<EditButton href="{data.job.id}/note"></EditButton>
			</div>
			<div class="flex grow flex-col">
				<div class="grow">
					<NoteTable editMode={false} notes={data.job.notes} attachmentPath={data.attachmentPath} />
				</div>
				<div class="flex justify-between gap-8">
					<Button class="grow" href={`${data.job.id}/note`} variant="secondary">Add Note</Button>
				</div>
			</div>
		</div>
	</div>
</div>
