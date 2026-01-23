<script>
	import { superForm } from 'sveltekit-superforms';
	import EditWorkForm from '../EditWorkForm.svelte';
	import { addWorkFormSchema } from '../../../validation';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data, form: formProp } = $props();

	const form = superForm(formProp?.form ?? data.form, {
		validators: zod4Client(addWorkFormSchema)
	});

	let saveTemplateMessage = $state('');
</script>

<EditWorkForm
	formProp={data.form}
	materials={data.materials}
	jobId={data.jobId}
	workId={data.work.id}
	action={'?/edit'}
>
	{#snippet templateButton()}
		<form
			method="POST"
			action="?/saveAsTemplate"
			use:enhance={({ formElement, formData, action, cancel, submitter }) => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						saveTemplateMessage = 'Template saved successfully!';
						setTimeout(() => (saveTemplateMessage = ''), 3000);
					} else if (result.type === 'failure') {
						saveTemplateMessage = 'Failed to save template';
						setTimeout(() => (saveTemplateMessage = ''), 3000);
					}
				};
			}}
		>
			<Button variant="outline" type="submit">Save as Template</Button>
		</form>
		{#if saveTemplateMessage}
			<p
				class="text-sm {saveTemplateMessage.includes('success')
					? 'text-green-600'
					: 'text-red-600'}"
			>
				{saveTemplateMessage}
			</p>
		{/if}
	{/snippet}
</EditWorkForm>
