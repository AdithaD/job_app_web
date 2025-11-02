<script lang="ts">
	import AddressWithIcon from '$lib/components/ui/AddressWithIcon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';
	import DateWithIcon from '$lib/components/ui/DateWithIcon.svelte';
	import * as Item from '$lib/components/ui/item';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { jobStatusToString } from '$lib/utils.js';

	let { data } = $props();
</script>

<div class="flex h-screen gap-4 p-8">
	<div class="flex grow gap-8 rounded-lg border-2 p-8">
		<div class="flex flex-1 flex-col gap-12">
			<div class="flex flex-col gap-4">
				<div class="flex justify-between">
					<div>
						<div class="flex items-center justify-start gap-4">
							<h1 class="text-4xl font-bold">{data.job.title}</h1>
							<div class="text-2xl">
								#{data.job.jobNumber}
							</div>
						</div>
						<Badge>{jobStatusToString(data.job.jobStatus)}</Badge>
					</div>
					<Button variant="ghost" class="group">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-6 text-muted-foreground transition-colors group-hover:text-foreground"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
							/>
						</svg>
					</Button>
				</div>
				<div class="flex flex-col gap-2">
					<DateWithIcon date={data.job.scheduledDate} />
					<AddressWithIcon location={data.job.location} />
					<p>{data.job.description}</p>
				</div>
			</div>
			{#if data.job.client}
				<div class="flex flex-col gap-2">
					<h2 class="text-2xl font-bold">Client</h2>
					<Item.Root variant="outline">
						<Item.Content>
							<Item.Title>
								<p>{data.job.client.name}</p>
							</Item.Title>
							<Item.Description>
								<p>{data.job.client.address}</p>
								<p>{data.job.client.phone}</p>
							</Item.Description>
						</Item.Content>
						<Item.Actions>
							<Button variant="outline">Details</Button>
						</Item.Actions>
					</Item.Root>
				</div>
			{/if}
			<div class="flex flex-col gap-2">
				<h2 class="text-2xl font-bold">Pricing</h2>
				<div>
					<div>
						Amount Quoted: ${data.job.quotedAmount}
					</div>
					<div>
						Amount Paid: ${data.job.paidAmount}
					</div>
				</div>
				<div class="flex justify-between gap-8">
					<Button class="grow" variant="secondary">Generate Quote</Button>
					<Button class="grow" variant="secondary">Generate Invoice</Button>
				</div>
			</div>
		</div>
		<Separator orientation="vertical"></Separator>
		<div class="flex flex-1 flex-col">
			<div class="flex-1">
				<h2 class="text-2xl font-bold">Materials</h2>
			</div>
			<div class="flex flex-1 flex-col">
				<h2 class="text-2xl font-bold">Notes</h2>
				<div class="flex grow flex-col">
					<div class="grow"></div>
					<div class="flex justify-between gap-8">
						<Button class="grow" variant="secondary">Add Note</Button>
						<Button class="grow" variant="secondary">Add Attachment</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
