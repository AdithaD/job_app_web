<script lang="ts">
	import { signIn, signUp } from '$lib/auth-client';

	let email = $state('');
	let password = $state('');
	let username = $state('');

	const handleSignUp = async () => {
		await signUp.email({
			email,
			password,
			name: username,
			callbackURL: '/dashboard'
		});
	};
</script>

<div class="w-1/3 p-8">
	<h1>Job app</h1>
	<h2>Login</h2>
	<input
		class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
		id="email"
		name="email"
		type="email"
		placeholder="Email"
		bind:value={email}
		required
	/>
	<input
		class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
		id="password"
		name="password"
		type="password"
		placeholder="Password"
		bind:value={password}
		minlength="1"
		maxlength="30"
		required
	/>
	<input
		class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
		id="username"
		name="username"
		type="text"
		placeholder="Display Name"
		bind:value={username}
	/>
	<button
		class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
		type="submit"
		onclick={handleSignUp}>Sign Up</button
	>
</div>
