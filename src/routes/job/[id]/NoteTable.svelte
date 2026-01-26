<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import * as Table from '$lib/components/ui/table/index.js';
	import type { Attachment, Note, UploadedDocument } from '$lib/server/db/schema';
	import { format } from 'date-fns';

	let {
		notes,
		editMode = false,
		attachmentPath
	}: {
		notes: (Note & { attachments: (Attachment & { uploadedDocument : UploadedDocument })[] })[];
		editMode: boolean;
		attachmentPath: string;
	} = $props();
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4">
	<div class="flex min-h-0 grow flex-col">
		<Table.Root class="table-fixed">
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-32">Date</Table.Head>
					<Table.Head class="w-max">Content</Table.Head>
					<Table.Head class="text-right"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if notes.length > 0}
					{#each notes as note}
						<Table.Row>
							<Table.Cell class="">{format(note.createdAt, 'dd MMM yy')}</Table.Cell>
							<Table.Cell class="">
								<div class="flex min-h-0 items-center gap-2">
									<div class="w-full overflow-clip text-ellipsis">
										{note.content}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="size-4 text-muted-foreground"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
											/>
										</svg>
									</div>
								</div>
							</Table.Cell>
							<Table.Cell>
								<div class="flex justify-end gap-4">
									<Dialog.Root>
										<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}
											>View</Dialog.Trigger
										>
										<Dialog.Content class="">
											<Dialog.Header>
												<Dialog.Title>Note</Dialog.Title>
												<Dialog.Description>
													Created: {format(note.createdAt, 'dd MMM yy')}
												</Dialog.Description>
											</Dialog.Header>
											<div>
												{note.content}
											</div>
											<Dialog.Footer>
												{#each note.attachments as att}
													<Button
														href={`${attachmentPath}/${att.uploadedDocument.fileName}`}
														download
														variant="link">Open {att.uploadedDocument.fileName}</Button
													>
												{/each}
											</Dialog.Footer>
										</Dialog.Content>
									</Dialog.Root>
									{#if editMode}
										<form method="POST" action="?/remove">
											<Button type="submit" variant="destructive" name="id" value={note.id}
												>Remove</Button
											>
										</form>
									{/if}
								</div>
							</Table.Cell>
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
