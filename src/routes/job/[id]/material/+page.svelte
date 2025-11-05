<script lang="ts">
	import MaterialTable from '../MaterialTable.svelte';
	import * as Form from '$lib/components/ui/form';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { addMaterialFormSchema } from '../../validation';
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data, form: formProp } = $props();

	const form = superForm(formProp?.form ?? data.form, {
		validators: zod4Client(addMaterialFormSchema)
	});

	const { form: formData, enhance } = form;
</script>

<div class="flex h-screen justify-center gap-4 p-8">
	<div class="flex w-1/2 flex-col gap-8 rounded-lg border-2 p-8">
		<Button variant="secondary" class="w-min" href={`/job/${data.job.id}`}>Back</Button>
		<MaterialTable materials={data.job.materials} editMode={true} />
		<form method="POST" action="?/add" class="flex w-full items-stretch gap-4" use:enhance>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$formData.name} required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="cost">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Cost</Form.Label>
						<Input {...props} bind:value={$formData.cost} type="number" min="0" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="quantity">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Quantity</Form.Label>
						<Input {...props} bind:value={$formData.quantity} min="0" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Button type="submit" class="h-full">Add</Button>
		</form>
	</div>
</div>
