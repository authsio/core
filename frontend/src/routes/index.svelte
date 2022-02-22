<script>
	import useAuth from '../fetchs/auth';

	let isUnregistered = true;
	let fullName = '';

	async function submitRegisterForm(event) {
		const formData = new FormData(event.target);

		const registrationData = {};
		for (let field of formData) {
			const [key, value] = field;
			registrationData[key] = value;
		}

		const { token, message } = await register(registrationData);

		console.log(token, message);

		const isNotSuccessful = message !== 'SUCCESS';
		if (isNotSuccessful) {
			alert('Failed to register', message);
			return;
		}

		isUnregistered = false;

		fullName = `${registrationData.firstname} ${registrationData.lastname} `;
		localStorage.token = token;
	}

	const { register } = useAuth();
</script>

<div class="container px-6 py-10">
	{#if isUnregistered}
		<h2 class="text-center text-3xl font-bold">Register</h2>

		<form class="py-5" on:submit|preventDefault={submitRegisterForm}>
			<fieldset class="flex flex-col my-2">
				<label for="email">Email</label>
				<input class="px-3 px1 my-2" type="text" id="email" name="email" required />
			</fieldset>

			<fieldset class="flex flex-col my-2">
				<label for="password">Password</label>
				<input class="px-3 px1 my-2" type="password" id="password" name="password" required />
			</fieldset>

			<fieldset class="flex flex-col my-2">
				<label for="firstname">First Name</label>
				<input class="px-3 px1 my-2" type="text" id="firstname" name="firstname" required />
			</fieldset>

			<fieldset class="flex flex-col my-2">
				<label for="lastname">Lat Name</label>
				<input class="px-3 px1 my-2" type="text" id="lastname" name="lastname" required />
			</fieldset>

			<fieldset class="flex flex-col mt-4">
				<button
					class="
        bg-slate-300 text-slate-900 px-4 py-2 rounded
        dark:bg-slate-900 dark:text-slate-100"
					type="submit">Register</button
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
