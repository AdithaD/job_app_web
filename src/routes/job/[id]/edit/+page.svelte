<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { editJobFormSchema } from './schema';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { jobStatuses } from '$lib/schema';
	import { jobStatusToString } from '$lib/utils.js';
	import DateTimePicker from '$lib/components/ui/DateTimePicker.svelte';
	import { getLocalTimeZone } from '@internationalized/date';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(editJobFormSchema)
	});

	const { form: formData, enhance } = form;
</script>

<div class="flex h-screen justify-center gap-4 p-8">
	<div class="flex w-1/2 gap-8 rounded-lg border-2 p-8">
		<form method="POST" class="flex w-full flex-col gap-4" use:enhance>
			<Form.Field {form} name="title">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Title</Form.Label>
						<Input {...props} bind:value={$formData.title} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="flex justify-between gap-16">
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
				<Form.Field {form} name="jobStatus" class="grow">
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
			<Form.Field {form} name="description" class="grow">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description</Form.Label>
						<Textarea {...props} bind:value={$formData.description} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Separator></Separator>
			<Form.Button>Submit</Form.Button>
		</form>
	</div>
</div>
