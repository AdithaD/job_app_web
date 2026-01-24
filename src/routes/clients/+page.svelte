<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';

	let { data } = $props();
</script>

<div class="flex min-h-screen flex-col gap-8 bg-background p-8">
	<Button onclick={() => history.back()} class="w-min" variant="outline">Back</Button>
	<h1 class="text-4xl font-bold">Manage Clients</h1>

	{#if data.clients.length === 0}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center p-12">
				<p class="text-lg text-muted-foreground">No clients found.</p>
				<p class="text-sm text-muted-foreground">Create clients when adding or editing jobs.</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="rounded-lg border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[250px]">Name</Table.Head>
						<Table.Head>Email</Table.Head>
						<Table.Head>Phone</Table.Head>
						<Table.Head>Address</Table.Head>
						<Table.Head class="w-[100px] text-center">Jobs</Table.Head>
						<Table.Head class="w-[100px] text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.clients as client}
						<Table.Row
							class="cursor-pointer hover:bg-accent"
							onclick={() => (window.location.href = `/clients/${client.id}`)}
						>
							<Table.Cell class="font-semibold">{client.name}</Table.Cell>
							<Table.Cell class="break-all">{client.email || '-'}</Table.Cell>
							<Table.Cell>{client.phone || '-'}</Table.Cell>
							<Table.Cell class="max-w-md truncate">{client.address || '-'}</Table.Cell>
							<Table.Cell class="text-center">{client.jobCount}</Table.Cell>
							<Table.Cell class="text-right">
								<Button
									variant="ghost"
									size="sm"
									href="/clients/{client.id}"
									onclick={(e) => e.stopPropagation()}
								>
									View
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<div class="text-sm text-muted-foreground">
			<p>Total clients: {data.clients.length}</p>
		</div>
	{/if}
</div>
