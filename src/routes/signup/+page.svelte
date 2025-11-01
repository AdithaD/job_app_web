<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let { form } = $props();
</script>

<div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
	<div class="w-full max-w-sm">
		<Card.Root>
			<Card.Header>
				<Card.Title>Create an account</Card.Title>
				<Card.Description>Enter your information below to create your account</Card.Description>
			</Card.Header>
			<Card.Content>
				<form method="POST" use:enhance>
					<Field.Group>
						<Field.Field>
							<Field.Label for="name">Full Name</Field.Label>
							<Input id="name" name="name" type="text" placeholder="John Doe" required />
						</Field.Field>
						<Field.Field>
							<Field.Label for="email">Email</Field.Label>
							<Input id="email" name="email" type="email" placeholder="m@example.com" required />
						</Field.Field>
						<Field.Field>
							<Field.Label for="password">Password</Field.Label>
							<Input id="password" name="password" type="password" required />
							<Field.Description>Must be at least 8 characters long.</Field.Description>
						</Field.Field>
						<Field.Field>
							<Field.Label for="confirm-password">Confirm Password</Field.Label>
							<Input id="confirm-password" name="confirm-password" type="password" required />
							<Field.Description>Please confirm your password.</Field.Description>
						</Field.Field>
						<p class="text-red-500">{form?.message}</p>
						<Field.Group>
							<Field.Field>
								<Button type="submit">Create Account</Button>
								<Field.Description class="px-6 text-center">
									Already have an account? <a href="/signin">Sign in</a>
								</Field.Description>
							</Field.Field>
						</Field.Group>
					</Field.Group>
				</form>
			</Card.Content>
		</Card.Root>
	</div>
</div>
