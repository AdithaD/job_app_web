<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	let { data } = $props();

	const businessSettingsSchema = z.object({
		businessName: z.string().min(1, 'Business name is required'),
		abn: z.string().optional().default(''),
		address: z.string().optional().default(''),
		phone: z.string().optional().default(''),
		email: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
		bsb: z.string().optional().default(''),
		accountNumber: z.string().optional().default(''),
		accountName: z.string().optional().default(''),
		terms: z.string().optional().default(''),
		defaultNotes: z.string().optional().default('')
	});

	const form = superForm(data.form, {
		validators: zod4Client(businessSettingsSchema),
		resetForm: false
	});

	const { form: formData, enhance, message, delayed } = form;
</script>

<div class="flex min-h-screen flex-col gap-8 bg-background p-8">
	<Button onclick={() => history.back()} class="w-min" variant="outline">Back</Button>
	<h1 class="text-4xl font-bold">Business Settings</h1>

	<p class="text-muted-foreground">
		Configure your business details for professional quotes and invoices
	</p>

	<form method="POST" action="?/update" use:enhance>
		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Business Information -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Business Information</Card.Title>
					<Card.Description>Your business details for quotes and invoices</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<Form.Field {form} name="businessName">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Business Name *</Form.Label>
								<Input
									{...props}
									bind:value={$formData.businessName}
									placeholder="Your Business Name"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="abn">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>ABN (Australian Business Number)</Form.Label>
								<Input {...props} bind:value={$formData.abn} placeholder="12 345 678 901" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="address">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Business Address</Form.Label>
								<Textarea
									{...props}
									bind:value={$formData.address}
									placeholder="123 Business Street&#10;City, State, Postcode"
									rows={3}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="phone">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Phone Number</Form.Label>
								<Input {...props} bind:value={$formData.phone} placeholder="(02) 1234 5678" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email Address</Form.Label>
								<Input
									{...props}
									type="email"
									bind:value={$formData.email}
									placeholder="contact@yourbusiness.com.au"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Content>
			</Card.Root>

			<!-- Payment Information -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Payment Details</Card.Title>
					<Card.Description>Bank account information for invoices</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<Form.Field {form} name="accountName">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Account Name</Form.Label>
								<Input
									{...props}
									bind:value={$formData.accountName}
									placeholder="Your Business Name"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="bsb">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>BSB</Form.Label>
								<Input {...props} bind:value={$formData.bsb} placeholder="123-456" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="accountNumber">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Account Number</Form.Label>
								<Input {...props} bind:value={$formData.accountNumber} placeholder="12345678" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Content>
			</Card.Root>

			<!-- Terms & Conditions -->
			<Card.Root class="lg:col-span-2">
				<Card.Header>
					<Card.Title>Terms & Conditions</Card.Title>
					<Card.Description>Default terms displayed on quotes and invoices</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<Form.Field {form} name="terms">
						<Form.Control>
							{#snippet children({ props })}
								<Textarea
									{...props}
									bind:value={$formData.terms}
									placeholder="Enter your business terms and conditions here...&#10;&#10;For example:&#10;- Payment is due within 30 days of invoice date&#10;- Late payments may incur interest charges&#10;- All work is guaranteed for 12 months"
									rows={6}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Content>
			</Card.Root>

			<!-- Default Notes -->
			<Card.Root class="lg:col-span-2">
				<Card.Header>
					<Card.Title>Default Notes</Card.Title>
					<Card.Description>Default notes to appear on all quotes and invoices</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<Form.Field {form} name="defaultNotes">
						<Form.Control>
							{#snippet children({ props })}
								<Textarea
									{...props}
									bind:value={$formData.defaultNotes}
									placeholder="Enter default notes here...&#10;&#10;For example:&#10;Thank you for choosing our services. We look forward to working with you again!"
									rows={4}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Content>
			</Card.Root>
		</div>

		{#if $message}
			<div class="mt-4 rounded-lg bg-green-100 p-4 text-green-800">
				Settings saved successfully!
			</div>
		{/if}

		<div class="mt-6 flex justify-end gap-4">
			<Button type="button" variant="outline" onclick={() => history.back()}>Cancel</Button>
			<Form.Button disabled={$delayed}>
				{$delayed ? 'Saving...' : 'Save Settings'}
			</Form.Button>
		</div>
	</form>
</div>
