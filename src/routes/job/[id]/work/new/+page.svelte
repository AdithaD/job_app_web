<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { addWorkFormSchema } from '../../../validation.js';
	import EditWorkForm from '../EditWorkForm.svelte';
	import { goto } from '$app/navigation';
	import * as Select from '$lib/components/ui/select';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let { data, form: formProp } = $props();

	const form = superForm(formProp?.form ?? data.form, {
		validators: zod4Client(addWorkFormSchema)
	});

	const { form: formData, enhance } = form;

	// Convert initialMaterials to the format expected by EditWorkForm - make reactive
	let materials = $derived(
		data.initialMaterials.map((m) => ({
			name: m.name,
			cost: m.cost,
			quantity: m.quantity,
			workId: '' // This will be set when the work is created
		}))
	);

	let selectedTemplateId = $state('');
	let hasUserSelected = $state(false);

	$effect(() => {
		if (selectedTemplateId && hasUserSelected) {
			goto(`/job/${data.jobId}/work/new?templateId=${selectedTemplateId}`, { invalidateAll: true });
			hasUserSelected = false;
		}
	});

	function handleTemplateChange(value: string | undefined) {
		if (value) {
			hasUserSelected = true;
			selectedTemplateId = value;
		}
	}

	const templateOptions = data.templates.map((t) => ({
		value: t.id,
		label: t.title + (t.description ? ` - ${t.description.substring(0, 30)}...` : '')
	}));

	const triggerContent = $derived(
		templateOptions.find((t) => t.value === selectedTemplateId)?.label ?? 'Select a template...'
	);
</script>

<EditWorkForm formProp={data.form} {materials} jobId={data.jobId}>
	{#snippet templateDropdown()}
		{#if data.templates.length > 0}
			<div class="flex flex-col gap-2">
				<label class="text-sm font-medium">Load from Template</label>
				<Select.Root type="single" onValueChange={handleTemplateChange}>
					<Select.Trigger class="w-full">
						{triggerContent}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Templates</Select.Label>
							{#each data.templates as template (template.id)}
								<Select.Item value={template.id} label={template.title}>
									{template.title}
									{#if template.description}
										<span class="ml-2 text-xs text-muted-foreground">
											- {template.description.substring(0, 40)}{template.description.length > 40
												? '...'
												: ''}
										</span>
									{/if}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
			<Separator class="my-2" orientation="horizontal" />
		{/if}
	{/snippet}
</EditWorkForm>
