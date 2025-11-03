<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { Material } from '$lib/server/db/schema';

	let { materials, editMode = false }: { materials: Material[]; editMode: boolean } = $props();
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4">
	<div class="flex min-h-0 grow flex-col">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Name</Table.Head>
					<Table.Head>Cost</Table.Head>
					<Table.Head>Quantity</Table.Head>
					<Table.Head class="text-right">Total Cost</Table.Head>
					{#if editMode}
						<Table.Head class="text-right"></Table.Head>
					{/if}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each materials as material}
					<Table.Row>
						<Table.Cell class="font-medium">{material.name}</Table.Cell>
						<Table.Cell>{material.cost}</Table.Cell>
						<Table.Cell>{material.quantity}</Table.Cell>
						<Table.Cell class="text-right">{material.cost * (material.quantity ?? 1)}</Table.Cell>
						{#if editMode}
							<Table.Cell class="self-end">
								<div class="flex w-full justify-end">
									<form method="POST" action="?/remove">
										<Button type="submit" name="name" value={material.name}>Remove</Button>
									</form>
								</div>
							</Table.Cell>
						{/if}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="text-right">
		Total material cost: <span class="font-bold">
			${materials.map((m) => m.cost * (m.quantity ?? 1)).reduce((acc, val) => acc + val, 0)}
		</span>
	</div>
</div>
