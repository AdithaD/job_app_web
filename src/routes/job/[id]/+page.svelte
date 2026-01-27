<script lang="ts">
	import MaterialTable from './MaterialTable.svelte';

	import EditButton from './EditButton.svelte';

	import AddressWithIcon from '$lib/components/ui/AddressWithIcon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';
	import DateWithIcon from '$lib/components/ui/DateWithIcon.svelte';
	import * as Item from '$lib/components/ui/item';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { jobStatusToString, paymentStatusToString } from '$lib/utils.js';
	import NoteTable from './NoteTable.svelte';
	import WorksTable from './WorksTable.svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();

	let documentDialogOpen = $state(false);
	let documentType = $state<'quote' | 'invoice'>('quote');
	let documentId = $state('');
	let showMaterials = $state(true);
	let showLabour = $state(true);
	let showPaymentDetails = $state(true);
	let discount = $state(0);
	let terms = $state('');
	let dueDays = $state(30);
	let isGenerating = $state(false);

	// Update terms when business settings change or dialog opens
	$effect(() => {
		if (documentDialogOpen && data.businessSettings?.terms) {
			terms = data.businessSettings.terms;
		}
	});
</script>

<div class="flex min-h-screen flex-col items-stretch gap-8 p-4 lg:p-8">
	<Button href="/dashboard" class="w-min" variant="outline">Back</Button>
	<div class="flex flex-col gap-4">
		<div class="flex items-start justify-between gap-2">
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2 sm:gap-4">
					<h1 class="shrink truncate text-2xl font-bold sm:text-4xl">{data.job.title}</h1>
					<div class="text-lg whitespace-nowrap sm:text-2xl">
						#{data.job.jobNumber}
					</div>
				</div>
				<Badge variant="outline">{jobStatusToString(data.job.jobStatus)}</Badge>
			</div>
			<EditButton href="{data.job.id}/edit"></EditButton>
		</div>
		<div class="flex w-full flex-col gap-4 lg:flex-row lg:gap-8">
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
								<div class="text-sm text-muted-foreground">
									{#if data.job.client.email}
										<div class="break-all">{data.job.client.email}</div>
									{/if}
									{#if data.job.client.phone}
										<div>{data.job.client.phone}</div>
									{/if}
									{#if data.job.client.address}
										<div>{data.job.client.address}</div>
									{/if}
								</div>
							</Item.Content>
							<Item.Actions>
								<Button variant="outline" href="/clients/{data.job.client.id}">Details</Button>
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
	<div class="flex flex-1 flex-col gap-8 lg:flex-row">
		<div class="flex flex-1 flex-col gap-4">
			<div class="flex justify-between">
				<div>
					<div class="flex gap-4">
						<h2 class="text-2xl font-bold">Pricing</h2>
						<Badge variant="outline">{paymentStatusToString(data.job.paymentStatus)}</Badge>
					</div>
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

			<!-- Latest Documents Section -->
			{#if data.latestQuote || data.latestInvoice}
				<Separator />
				<div class="space-y-2">
					<h3 class="text-sm font-medium text-muted-foreground">Latest Documents</h3>
					<div class="flex flex-col gap-2">
						{#if data.latestQuote}
							<Button
								href="{data.attachmentPath}/{data.latestQuote.fileName}"
								variant="outline"
								class="w-full justify-between"
								target="_blank"
							>
								<span class="flex items-center gap-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="size-4"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
										/>
									</svg>
									Latest Quote
								</span>
								<span class="text-xs text-muted-foreground">
									{new Date(data.latestQuote.createdAt).toLocaleDateString('en-AU')}
								</span>
							</Button>
						{/if}
						{#if data.latestInvoice}
							<Button
								href="{data.attachmentPath}/{data.latestInvoice.fileName}"
								variant="outline"
								class="w-full justify-between"
								target="_blank"
							>
								<span class="flex items-center gap-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="size-4"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
										/>
									</svg>
									Latest Invoice
								</span>
								<span class="text-xs text-muted-foreground">
									{new Date(data.latestInvoice.createdAt).toLocaleDateString('en-AU')}
								</span>
							</Button>
						{/if}
					</div>
				</div>
			{/if}

			<div class="grow"></div>
			<div class="flex gap-2">
				<Button 
					class="grow" 
					variant="secondary" 
					onclick={() => {
						documentType = 'quote';
						documentDialogOpen = true;
					}}
				>
					Generate Quote
				</Button>
				<Button 
					class="grow" 
					variant="secondary" 
					onclick={() => {
						documentType = 'invoice';
						documentDialogOpen = true;
					}}
				>
					Generate Invoice
				</Button>
			</div>
		</div>
		<div class="flex flex-1 flex-col gap-4">
			<div class="flex justify-between">
				<h2 class="text-2xl font-bold">Notes</h2>
				<EditButton href="{data.job.id}/note"></EditButton>
			</div>
			<div class="flex grow flex-col gap-4">
				<div class="grow">
					<NoteTable editMode={false} notes={data.job.notes} attachmentPath={data.attachmentPath} />
				</div>
				<Button class="w-full" href={`${data.job.id}/note`} variant="secondary">Add Note</Button>
			</div>
		</div>
	</div>
</div>

<!-- Document Generation Dialog (Unified) -->
<Dialog.Root bind:open={documentDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Generate {documentType === 'quote' ? 'Quote' : 'Invoice'}</Dialog.Title>
			<Dialog.Description>
				Configure document options before generating the PDF.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/{documentType}"
			use:enhance={() => {
				isGenerating = true;
				return async ({ update }) => {
					await update();
					isGenerating = false;
					documentDialogOpen = false;
				};
			}}
		>
			<div class="space-y-4 py-4">
				<!-- Document Type Selection -->
				<div class="space-y-2">
					<Label for="documentType">Document Type</Label>
					<Select.Root type="single" bind:value={documentType}>
						<Select.Trigger id="documentType" class="w-full">
							{documentType === 'quote' ? 'Quote' : 'Invoice'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="quote">Quote</Select.Item>
							<Select.Item value="invoice">Invoice</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Document ID Input -->
				<div class="space-y-2">
					<Label for="documentId">Document ID</Label>
					<Input
						id="documentId"
						name="documentId"
						type="text"
						bind:value={documentId}
						placeholder="e.g., 001"
						required
					/>
					<p class="text-xs text-muted-foreground">
						Full ID: {documentType === 'quote' ? 'Q' : 'INV'}-{data.job.jobNumber}-{documentId || 'XXX'}
					</p>
				</div>

				<!-- Show Materials -->
				<div class="flex items-center space-x-2">
					<Checkbox
						id="showMaterials"
						name="showMaterials"
						value="true"
						checked={showMaterials}
						onCheckedChange={(checked) => showMaterials = checked === true}
					/>
					<Label for="showMaterials" class="cursor-pointer font-normal">
						Show material breakdown
					</Label>
				</div>

				<!-- Show Labour (Quote only) -->
				{#if documentType === 'quote'}
					<div class="flex items-center space-x-2">
						<Checkbox
							id="showLabour"
							name="showLabour"
							value="true"
							checked={showLabour}
							onCheckedChange={(checked) => showLabour = checked === true}
						/>
						<Label for="showLabour" class="cursor-pointer font-normal">
							Show labour breakdown
						</Label>
					</div>
				{/if}

				<!-- Discount -->
				<div class="space-y-2">
					<Label for="discount">Discount (%)</Label>
					<Input
						id="discount"
						name="discount"
						type="number"
						min="0"
						max="100"
						step="0.1"
						bind:value={discount}
						placeholder="0"
					/>
				</div>

				<!-- Show Payment Details -->
				<div class="flex items-center space-x-2">
					<Checkbox
						id="showPaymentDetails"
						name="showPaymentDetails"
						value="true"
						checked={showPaymentDetails}
						onCheckedChange={(checked) => showPaymentDetails = checked === true}
					/>
					<Label for="showPaymentDetails" class="cursor-pointer font-normal">
						Show payment details
					</Label>
				</div>

				<!-- Due Days (Invoice only) -->
				{#if documentType === 'invoice'}
					<div class="space-y-2">
						<Label for="dueDays">Payment Due (days)</Label>
						<Input
							id="dueDays"
							name="dueDays"
							type="number"
							min="0"
							step="1"
							bind:value={dueDays}
							placeholder="30"
						/>
					</div>
				{/if}

				<!-- Terms & Conditions -->
				<div class="space-y-2">
					<Label for="terms">Terms & Conditions</Label>
					<Textarea
						id="terms"
						name="terms"
						bind:value={terms}
						placeholder="Enter terms and conditions..."
						rows={4}
					/>
				</div>
			</div>

			<Dialog.Footer>
				<Button
					type="button"
					variant="outline"
					onclick={() => (documentDialogOpen = false)}
					disabled={isGenerating}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isGenerating}>
					{isGenerating ? 'Generating...' : `Generate ${documentType === 'quote' ? 'Quote' : 'Invoice'}`}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
