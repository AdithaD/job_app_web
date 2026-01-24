<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();

	let deletingId = $state<string | null>(null);
</script>

<div class="flex min-h-screen flex-col gap-8 bg-background p-8">
	<div class="flex items-center justify-between">
		<h1 class="text-4xl font-bold">Manage Work Templates</h1>
		<Button variant="secondary" href="/dashboard">Back to Dashboard</Button>
	</div>

	{#if data.templates.length === 0}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center p-12">
				<p class="text-lg text-muted-foreground">No templates found.</p>
				<p class="text-sm text-muted-foreground">
					Create templates by clicking "Save as Template" when editing a work item.
				</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			{#each data.templates as template}
				<Card.Root>
					<Card.Header>
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<Card.Title class="text-2xl">{template.title}</Card.Title>
								<Card.Description class="mt-2">
									{template.description || 'No description provided'}
								</Card.Description>
							</div>
							<form
								method="POST"
								action="?/delete"
								use:enhance={() => {
									deletingId = template.id;
									return async ({ update }) => {
										await update();
										deletingId = null;
									};
								}}
							>
								<input type="hidden" name="templateId" value={template.id} />
								<Button
									type="submit"
									variant="destructive"
									size="sm"
									disabled={deletingId === template.id}
								>
									{deletingId === template.id ? 'Deleting...' : 'Delete'}
								</Button>
							</form>
						</div>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div>
							<h3 class="mb-2 font-semibold">Labour Details</h3>
							<div class="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span class="text-muted-foreground">Hours:</span>
									<span class="ml-2 font-medium">{template.labourHours}h</span>
								</div>
								<div>
									<span class="text-muted-foreground">Rate:</span>
									<span class="ml-2 font-medium">${template.labourRate}/h</span>
								</div>
								<div class="col-span-2">
									<span class="text-muted-foreground">Total Labour Cost:</span>
									<span class="ml-2 font-semibold">
										${(template.labourHours * template.labourRate).toFixed(2)}
									</span>
								</div>
							</div>
						</div>

						<Separator />

						<div>
							<h3 class="mb-2 font-semibold">
								Materials ({template.materials.length})
							</h3>
							{#if template.materials.length > 0}
								<div class="rounded-md border">
									<Table.Root>
										<Table.Header>
											<Table.Row>
												<Table.Head>Name</Table.Head>
												<Table.Head class="text-right">Quantity</Table.Head>
												<Table.Head class="text-right">Cost</Table.Head>
												<Table.Head class="text-right">Total</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{#each template.materials as material}
												<Table.Row>
													<Table.Cell class="font-medium">{material.name}</Table.Cell>
													<Table.Cell class="text-right">{material.quantity}</Table.Cell>
													<Table.Cell class="text-right">${material.cost}</Table.Cell>
													<Table.Cell class="text-right font-semibold">
														${(material.quantity * material.cost).toFixed(2)}
													</Table.Cell>
												</Table.Row>
											{/each}
										</Table.Body>
									</Table.Root>
								</div>
								<div class="mt-2 text-right text-sm">
									<span class="text-muted-foreground">Total Material Cost:</span>
									<span class="ml-2 font-semibold">
										${template.materials
											.reduce((sum, m) => sum + m.quantity * m.cost, 0)
											.toFixed(2)}
									</span>
								</div>
							{:else}
								<p class="text-sm text-muted-foreground">No materials</p>
							{/if}
						</div>

						<Separator />

						<div class="rounded-md bg-muted p-3">
							<div class="flex items-center justify-between">
								<span class="font-semibold">Overall Total:</span>
								<span class="text-lg font-bold">
									${(
										template.labourHours * template.labourRate +
										template.materials.reduce((sum, m) => sum + m.quantity * m.cost, 0)
									).toFixed(2)}
								</span>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<div class="text-sm text-muted-foreground">
			<p>Total templates: {data.templates.length}</p>
		</div>
	{/if}
</div>
