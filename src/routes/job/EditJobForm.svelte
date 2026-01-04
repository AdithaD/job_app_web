<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { jobStatuses, paymentStatuses } from '$lib/schema';
	import { jobStatusToString, paymentStatusToString } from '$lib/utils.js';
	import DateTimePicker from '$lib/components/ui/DateTimePicker.svelte';
	import { getLocalTimeZone } from '@internationalized/date';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { editJobFormSchema } from './validation';
	import type z from 'zod';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import type { Client } from '$lib/server/db/schema';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Field from '$lib/components/ui/field';
	import FormContainer from '$lib/components/ui/FormContainer.svelte';

	const {
		formProp,
		clients,
		jobId,
		action
	}: {
		jobId?: string;
		formProp: SuperValidated<z.output<typeof editJobFormSchema>>;
		clients?: Client[];
		action?: string;
	} = $props();

	const form = superForm(formProp, {
		validators: zod4Client(editJobFormSchema)
	});

	const { form: formData, enhance } = form;

	var addingNewClient = $state(false);
</script>

<FormContainer>
	<div class="flex justify-between">
		<Button variant="secondary" class="w-min" href={jobId ? `/job/${jobId}` : '/dashboard'}>
			Back
		</Button>
		<form method="POST" action="?/delete">
			<Button variant="destructive" class="w-min" type="submit">Delete</Button>
		</form>
	</div>
	<form method="POST" {action} class="flex w-full flex-col gap-4" use:enhance>
		<Form.Field {form} name="title">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Title</Form.Label>
					<Input {...props} bind:value={$formData.title} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="location">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Location</Form.Label>
					<Input {...props} bind:value={$formData.location} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<div class="flex flex-col justify-between gap-4 lg:flex-row lg:gap-16">
			<Form.Field {form} name="scheduledDate" class="grow">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Scheduled Date</Form.Label>
						<div>
							<DateTimePicker
								{...props}
								value={$formData.scheduledDate}
								onValueChange={(v) => {
									$formData.scheduledDate = v?.toDate(getLocalTimeZone());
								}}
							/>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="jobStatus" class="lg:grow">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Status</Form.Label>
						<Select.Root type="single" bind:value={$formData.jobStatus} name={props.name}>
							<Select.Trigger class="w-full" {...props}
								>{jobStatusToString($formData.jobStatus)}</Select.Trigger
							>
							<Select.Content>
								{#each jobStatuses as status}
									<Select.Item value={status} label={jobStatusToString(status)} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</div>
		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Description</Form.Label>
					<Textarea {...props} bind:value={$formData.description} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		{#if addingNewClient}
			<div class="flex flex-col gap-2">
				<div class="flex justify-between gap-4">
					<Field.Label>Client</Field.Label>
					<div class="flex gap-2">
						<Checkbox id="new-client" bind:checked={addingNewClient}></Checkbox>
						<Label for="new-client">New Client</Label>
					</div>
				</div>
				<div class="flex flex-col gap-2 rounded-lg border-2 p-4">
					<div class="flex gap-4">
						<Form.Field {form} name="newClientName" class="grow">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Name</Form.Label>
									<Input {...props} bind:value={$formData.newClientName} required />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="newClientPhone">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Phone Number</Form.Label>
									<Input {...props} bind:value={$formData.newClientPhone} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<Form.Field {form} name="newClientAddress">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Address</Form.Label>
								<Input {...props} bind:value={$formData.newClientAddress} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
		{:else}
			<Form.Field {form} name="clientId">
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex justify-between gap-4">
							<Form.Label>Client</Form.Label>
							<div class="flex gap-2">
								<Checkbox id="new-client" bind:checked={addingNewClient}></Checkbox>
								<Label for="new-client">New Client</Label>
							</div>
						</div>
						<Select.Root type="single" bind:value={$formData.clientId} name={props.name}>
							<Select.Trigger class="w-full" {...props}>
								{clients?.find((c) => c.id == $formData.clientId)?.name ?? 'Not selected'}
							</Select.Trigger>
							<Select.Content>
								{#if clients}
									{#each clients as client}
										<Select.Item value={client.id} label={client.name} />
									{/each}
								{/if}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}
		<div class="flex flex-row justify-between gap-4">
			<div class="flex gap-4 lg:contents">
				<Form.Field {form} name="quotedAmount">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Quoted Amount</Form.Label>
							<Input {...props} type="number" bind:value={$formData.quotedAmount} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="paidAmount">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Paid Amount</Form.Label>
							<Input {...props} type="number" bind:value={$formData.paidAmount} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Form.Field {form} name="paymentStatus" class="grow">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Status</Form.Label>
						<Select.Root type="single" bind:value={$formData.paymentStatus} name={props.name}>
							<Select.Trigger class="w-full" {...props}
								>{paymentStatusToString($formData.paymentStatus)}</Select.Trigger
							>
							<Select.Content>
								{#each paymentStatuses as status}
									<Select.Item value={status} label={paymentStatusToString(status)} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</div>
		<div class="grow"></div>
		<Form.Button>Submit</Form.Button>
	</form>
</FormContainer>
