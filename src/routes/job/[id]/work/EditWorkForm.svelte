<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button/button.svelte';
	import FormContainer from '$lib/components/ui/FormContainer.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { addWorkFormSchema } from '../../validation.js';
	import z from 'zod';
	import { type Material } from '$lib/server/db/schema.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	const {
		formProp,
		jobId,
		workId,
		materials,
		action,
		templateButton,
		templateDropdown
	}: {
		jobId: string;
		workId?: string;
		materials: Material[];
		formProp: SuperValidated<z.output<typeof addWorkFormSchema>>;
		action?: string;
		templateButton?: any;
		templateDropdown?: any;
	} = $props();

	const form = superForm(formProp, {
		validators: zod4Client(addWorkFormSchema)
	});

	let materialCount = $state<number>(materials.length);
	let newMaterials = $state<Omit<Material, 'workId'>[]>(materials);
	let i = $state(0);

	// Update materials when prop changes (e.g., when template is selected)
	$effect(() => {
		newMaterials = [...materials];
		materialCount = materials.length;
	});

	const { form: formData, enhance } = form;
	console.log(JSON.stringify(formData));
</script>

<FormContainer>
	<div class="flex justify-between">
		<Button variant="secondary" class="w-min" href={`/job/${jobId}`}>Back</Button>
		<div class="flex items-center gap-2">
			{#if templateButton}
				{@render templateButton()}
			{/if}
			{#if workId}
				<form action="?/delete" method="POST">
					<Button variant="destructive" class="w-min" type="submit">Delete</Button>
				</form>
			{/if}
		</div>
	</div>
	<form method="POST" {action} class="flex w-full flex-col gap-4" use:enhance>
		{#if templateDropdown}
			{@render templateDropdown()}
		{/if}
		<div class="flex flex-col gap-4">
			<Form.Field {form} name="title">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Title</Form.Label>
						<Input {...props} bind:value={$formData.title} required minlength={1} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description</Form.Label>
						<Textarea {...props} bind:value={$formData.description} required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="flex flex-col items-center gap-4 lg:flex-row">
				<Form.Field {form} name="labourRate">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Labour Rate</Form.Label>
							<Input {...props} bind:value={$formData.labourRate} type="number" min="0" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="labourHours">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Labour Hours</Form.Label>
							<Input {...props} bind:value={$formData.labourHours} type="number" min="0" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<div>Total Labour Cost: <b>${$formData.labourRate * $formData.labourHours}</b></div>
			</div>
		</div>
		<Separator class="my-4" orientation="horizontal" />
		<h2>Materials</h2>
		<div class="flex flex-col gap-4">
			{#each Array(materialCount).keys() as i}
				<div class="flex gap-4">
					<Input
						name="material[{i}].name"
						bind:value={newMaterials[i].name}
						required
						placeholder="Name"
					/>
					<Input
						name="material[{i}].cost"
						bind:value={newMaterials[i].cost}
						type="number"
						placeholder="Cost"
					/>
					<Input
						name="material[{i}].quantity"
						bind:value={newMaterials[i].quantity}
						type="number"
						placeholder="Quantity"
					/>
					<Button
						variant="outline"
						onclick={() => {
							newMaterials.splice(i, 1);
							materialCount = newMaterials.length;
						}}
					>
						X
					</Button>
				</div>
			{/each}
		</div>
		<Button
			variant="secondary"
			onclick={() => {
				newMaterials.push({
					name: '',
					cost: 0,
					quantity: 1
				});
				materialCount = newMaterials.length;
			}}
		>
			Add material
		</Button>
		<Separator class="my-4" orientation="horizontal" />
		<Button type="submit" class="">Add</Button>
	</form>
</FormContainer>
