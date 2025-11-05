<script lang="ts">
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { addNoteFormSchema } from '../../validation';
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Form from '$lib/components/ui/form';
	import NoteTable from '../NoteTable.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils';

	let { data, form: formProp } = $props();

	const form = superForm(formProp?.form ?? data.form, {
		validators: zod4Client(addNoteFormSchema)
	});

	const { form: formData, enhance } = form;

	const file = fileProxy(formData, 'file');
</script>

<div class="flex h-screen justify-center gap-4 p-8">
	<div class="flex w-1/2 flex-col gap-8 rounded-lg border-2 p-8">
		<Button variant="secondary" class="w-min" href={`/job/${data.job.id}`}>Back</Button>
		<div class="grow">
			<NoteTable editMode={true} notes={data.job.notes} attachmentPath={data.attachmentPath} />
		</div>
		<Separator></Separator>
		<form
			method="POST"
			action="?/add"
			class="flex w-full grow flex-col items-stretch gap-4"
			enctype="multipart/form-data"
			use:enhance
		>
			<h2 class="text-2xl font-bold">New Note</h2>
			<Form.Field {form} name="content">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Content</Form.Label>
						<Textarea {...props} bind:value={$formData.content} required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="grow"></div>
			<Form.Field {form} name="file">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Attachment</Form.Label>
						<input
							class={cn(
								'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 pt-1.5 text-sm font-medium shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
								'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
								'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
							)}
							type="file"
							{...props}
							oninput={(e) => ($formData.file = e.currentTarget.files?.item(0) as File)}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Button type="submit">Add</Button>
		</form>
	</div>
</div>
