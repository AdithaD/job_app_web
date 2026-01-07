<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import type { Material, work, Work } from '$lib/server/db/schema';

	import EditButton from './EditButton.svelte';

	let {
		jobId,
		works,
		editMode = false
	}: { jobId: string; works: (Work & { materials: Material[] })[]; editMode: boolean } = $props();

	function calculateMaterialCost(work: Work, material: Material[]) {
		return (
			work.materialCostOverride ??
			material.reduce((acc, val) => acc + val.cost * (val.quantity ?? 1), 0)
		);
	}

	function calculateLabourCost(work: Work) {
		return work.labourCostOverride ?? work.labourRate * work.labourHours;
	}

	function calculateTotalCost(work: (Work & { materials: Material[] })[]) {
		return work.reduce(
			(acc, val) => acc + calculateLabourCost(val) + calculateMaterialCost(val, val.materials),
			0
		);
	}
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4">
	<div class="flex min-h-0 grow flex-col">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Name</Table.Head>
					<Table.Head>Labour Cost</Table.Head>
					<Table.Head>Material Cost</Table.Head>
					<Table.Head>Quantity</Table.Head>
					<Table.Head class="text-right">Total Cost</Table.Head>
					{#if editMode}
						<Table.Head class="text-right"></Table.Head>
					{/if}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each works as work}
					<Table.Row>
						<Table.Cell>
							<div class="font-medium">{work.title}</div>
							{work.description}
						</Table.Cell>pt
						<Table.Cell>{calculateLabourCost(work)}</Table.Cell>
						<Table.Cell>
							{calculateMaterialCost(work, work.materials)}
						</Table.Cell>
						{#if editMode}
							<Table.Cell class="self-end">
								<EditButton href="/job/{jobId}/work/{work.id}"></EditButton>
							</Table.Cell>
						{/if}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="text-right">
		Total cost of works: <span class="font-bold">
			${calculateTotalCost(works)}
		</span>
	</div>
</div>
