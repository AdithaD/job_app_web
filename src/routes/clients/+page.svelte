<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	let { data } = $props();
	const isMobile = new IsMobile();
</script>

<div class="flex min-h-screen flex-col gap-4 bg-background p-4 lg:gap-8 lg:p-8">
	<Button onclick={() => history.back()} class="w-min" variant="outline">Back</Button>
	<h1 class="text-3xl font-bold lg:text-4xl">Manage Clients</h1>

	{#if data.clients.length === 0}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center p-12">
				<p class="text-lg text-muted-foreground">No clients found.</p>
				<p class="text-sm text-muted-foreground">Create clients when adding or editing jobs.</p>
			</Card.Content>
		</Card.Root>
	{:else}
		{#if isMobile.current}
			<!-- Mobile Card View -->
			<div class="flex flex-col gap-3">
				{#each data.clients as client}
					<button
						type="button"
						onclick={() => (window.location.href = `/clients/${client.id}`)}
						class="group flex w-full items-center justify-between gap-3 rounded-lg border bg-card p-3 text-left shadow-sm transition-all hover:bg-accent hover:shadow-md active:scale-[0.98]"
					>
						<div class="flex-1 space-y-1">
							<div class="leading-tight font-bold">{client.name}</div>
							<div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
								{#if client.email}
									<span class="flex items-center gap-1">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="size-3"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
											/>
										</svg>
										{client.email}
									</span>
								{/if}
								{#if client.phone}
									<span class="flex items-center gap-1">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="size-3"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
											/>
										</svg>
										{client.phone}
									</span>
								{/if}
								<span class="flex items-center gap-1 font-semibold">
									{client.jobCount} jobs
								</span>
							</div>
						</div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							class="size-5 text-muted-foreground transition-transform group-hover:translate-x-1"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
						</svg>
					</button>
				{/each}
			</div>
		{:else}
			<!-- Desktop Table View -->
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
		{/if}

		<div class="text-sm text-muted-foreground">
			<p>Total clients: {data.clients.length}</p>
		</div>
	{/if}
</div>
