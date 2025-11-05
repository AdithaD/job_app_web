<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { Note } from '$lib/server/db/schema';
	import { format } from 'date-fns';

	let { notes, editMode = false }: { notes: Note[]; editMode: boolean } = $props();
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4">
	<div class="flex min-h-0 grow flex-col">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Date</Table.Head>
					<Table.Head>Content</Table.Head>
					<Table.Head>Attachment</Table.Head>
					{#if editMode}
						<Table.Head class="text-right"></Table.Head>
					{/if}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if notes.length > 0}
					{#each notes as note}
						<Table.Row>
							<Table.Cell class="">{format(note.createdAt, 'dd MMM yy')}</Table.Cell>
							<Table.Cell class="text-ellipsis">{note.content}</Table.Cell>
							<Table.Cell>
								{#if note.filePath}
									<Button href={`/${note.filePath}`} download variant="ghost">Open</Button>
								{/if}
							</Table.Cell>
							{#if editMode}
								<Table.Cell class="self-end">
									<div class="flex w-full justify-end">
										<form method="POST" action="?/remove">
											<Button type="submit" name="id" value={note.id}>Remove</Button>
										</form>
									</div>
								</Table.Cell>
							{/if}
						</Table.Row>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell colspan={4} class="text-center">No notes created.</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
