<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import useLogin from '../fetchs/login';
	let login;

	onMount(() => {
		const hasAuthValues = setValues();
		if (hasAuthValues) {
			goto('/dashboard');
			return;
		}

		const { submitLoginForm } = useLogin(localStorage.jwt);
		login = submitLoginForm;
	});

	let isUnregistered = true;
	let fullName = '';

	function setValues() {
		const params = new URLSearchParams(window.location.search);

		const xApiKey = params.get('x_api_key');

		if (xApiKey) {
			localStorage.setItem('x-api-key', xApiKey);
		}

		const token = params.get('auth_token');
		if (token) {
			localStorage.setItem('jwt', token);
		}

		const hasApiKeyAndAuthToken = !!(localStorage['x-api-key'] && localStorage.jwt);
		return hasApiKeyAndAuthToken;
	}
</script>

<div class="container px-6 py-10">
	{#if isUnregistered}
		<h2 class="text-center text-3xl font-bold">Login</h2>

		<form class="py-5" on:submit|preventDefault={login}>
			<fieldset class="flex flex-col my-2">
				<label for="email">Email</label>
				<input
					class="px-3 px1 my-2"
					type="text"
					id="email"
					name="email"
					autocomplete="email"
					required
				/>
			</fieldset>

			<fieldset class="flex flex-col my-2">
				<label for="password">Password</label>
				<input
					class="px-3 px1 my-2"
					type="password"
					id="password"
					name="password"
					autocomplete="current-password"
					required
				/>
			</fieldset>

			<fieldset class="flex flex-col mt-4">
				<button
					class="
        bg-slate-300 text-slate-900 px-4 py-2 rounded
        dark:bg-slate-900 dark:text-slate-100"
					type="submit">Login</button
				>
			</fieldset>
		</form>
	{:else}
		<h2 class="text-center text-3xl font-bold">Welcome!</h2>
		<p class="text-center mt-10">
			Authsio welcomes you,
			<span class="font-bold">{fullName}</span>
		</p>
	{/if}
</div>
