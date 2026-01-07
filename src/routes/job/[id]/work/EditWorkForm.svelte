<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button/button.svelte';
	import FormContainer from '$lib/components/ui/FormContainer.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { addWorkFormSchema } from '../../validation.js';
	import MaterialTable from '../MaterialTable.svelte';
	import z from 'zod';
	import type { Material } from '$lib/server/db/schema.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	const {
		formProp,
		jobId,
		workId,
		materials,
		action
	}: {
		jobId: string;
		workId?: string;
		materials: Material[];
		formProp: SuperValidated<z.output<typeof addWorkFormSchema>>;
		action?: string;
	} = $props();

	const form = superForm(formProp, {
		validators: zod4Client(addWorkFormSchema)
	});

	let materialCount = $state<number[]>([]);
	let i = $state(0);

	const { form: formData, enhance } = form;
</script>

<FormContainer>
	<Button variant="secondary" class="w-min" href={`/job/${jobId}`}>Back</Button>
	<form method="POST" {action} class="flex w-full flex-col gap-4" use:enhance>
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
			{#each materialCount as m, i (m)}
				<div class="flex gap-4">
					<Input name="material[{m}].name" required placeholder="Name" />
					<Input name="material[{m}].cost" type="number" placeholder="Cost" />
					<Input name="material[{m}].quantity" type="number" placeholder="Quantity" />
					<Button
						variant="outline"
						onclick={() => {
							materialCount.splice(i, 1);
							materialCount = materialCount;
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
				materialCount.push(i);
				i += 1;
			}}
		>
			Add material
		</Button>
		<Separator class="my-4" orientation="horizontal" />
		<Button type="submit" class="">Add</Button>
	</form>
</FormContainer>
