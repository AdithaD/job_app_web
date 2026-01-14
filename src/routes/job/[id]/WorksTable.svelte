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
		<Table.Root class="w-full table-fixed">
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-full">Name</Table.Head>
					<Table.Head class="w-full">Materials</Table.Head>
					<Table.Head class="w-24">Material Cost</Table.Head>
					<Table.Head class="w-24">Labour Cost</Table.Head>
					<Table.Head class="w-24 text-right">Options</Table.Head>

					{#if editMode}
						<Table.Head class="text-right"></Table.Head>
					{/if}
				</Table.Row>
			</Table.Header>
			<Table.Body class="w-full">
				{#each works as work}
					<Table.Row>
						<Table.Cell class="w-full wrap-break-word whitespace-normal">
							<div class="font-medium">{work.title}</div>
							<div class="text-sm text-muted-foreground">
								{work.description}
							</div>
						</Table.Cell>

						<Table.Cell class="wrap-break-word whitespace-pre-line">
							{work.materials.map((m) => `${m.quantity}x ${m.name}`).join('\n')}
						</Table.Cell>

						<Table.Cell class="w-24 text-right whitespace-nowrap">
							${calculateMaterialCost(work, work.materials)}
						</Table.Cell>

						<Table.Cell class="w-24 text-right whitespace-nowrap">
							${calculateLabourCost(work)}
						</Table.Cell>

						{#if editMode}
							<Table.Cell class="w-24 self-end text-right">
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
