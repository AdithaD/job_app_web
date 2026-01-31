<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { editClientFormSchema } from '../job/validation';
	import type z from 'zod';
	import Button from '$lib/components/ui/button/button.svelte';
	import FormContainer from '$lib/components/ui/FormContainer.svelte';

	const {
		formProp,
		clientId,
		action
	}: {
		clientId?: string;
		formProp: SuperValidated<z.output<typeof editClientFormSchema>>;
		action?: string;
	} = $props();

	const form = superForm(formProp, {
		validators: zod4Client(editClientFormSchema)
	});

	const { form: formData, enhance } = form;
</script>

<FormContainer>
	<div class="flex justify-between">
		<Button variant="secondary" class="w-min" href={clientId ? `/clients/${clientId}` : '/clients'}>
			Back
		</Button>
	</div>

	<h1 class="text-2xl font-bold mb-6">Edit Client</h1>

	<form method="POST" {action} class="flex w-full flex-col gap-4" use:enhance>
		<Form.Field {form} name="name">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Name *</Form.Label>
					<Input {...props} bind:value={$formData.name} required />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Email</Form.Label>
					<Input {...props} type="email" bind:value={$formData.email} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="phone">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Phone</Form.Label>
					<Input {...props} bind:value={$formData.phone} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="address">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Address</Form.Label>
					<Input {...props} bind:value={$formData.address} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Button>Save Changes</Form.Button>
	</form>
</FormContainer>