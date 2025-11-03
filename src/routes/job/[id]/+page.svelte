<script lang="ts">
	import MaterialTable from './MaterialTable.svelte';

	import EditButton from './EditButton.svelte';

	import AddressWithIcon from '$lib/components/ui/AddressWithIcon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';
	import DateWithIcon from '$lib/components/ui/DateWithIcon.svelte';
	import * as Item from '$lib/components/ui/item';
	import * as Table from '$lib/components/ui/table/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { jobStatusToString, paymentStatusToString } from '$lib/utils.js';

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
						<Badge variant="outline">{jobStatusToString(data.job.jobStatus)}</Badge>
					</div>
					<EditButton href="{data.job.id}/edit"></EditButton>
				</div>
				<div class="flex flex-col gap-2">
					<DateWithIcon date={data.job.scheduledDate} />
					<AddressWithIcon location={data.job.location} />
					<p>{data.job.description}</p>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<h2 class="text-2xl font-bold">Client</h2>
				{#if data.job.client}
					<Item.Root variant="outline">
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
		<Separator orientation="vertical"></Separator>
		<div class="flex flex-1 flex-col gap-12">
			<div class="flex min-h-0 flex-1 grow flex-col gap-4">
				<div class="flex justify-between">
					<h2 class="mb-4 text-2xl font-bold">Materials</h2>
					<EditButton href="{data.job.id}/material"></EditButton>
				</div>
				<MaterialTable materials={data.job.materials} />
			</div>
			<div class="flex flex-col gap-2">
				<div class="flex gap-4">
					<h2 class="text-2xl font-bold">Pricing</h2>
					<Badge variant="outline">{paymentStatusToString(data.job.paymentStatus)}</Badge>
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
				<div class="flex justify-between gap-8">
					<Button class="grow" variant="secondary">Generate Quote</Button>
					<Button class="grow" variant="secondary">Generate Invoice</Button>
				</div>
			</div>
		</div>
	</div>
</div>
