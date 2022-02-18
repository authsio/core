<script>
	const message = `*** Authsio machine speaking. Do you copy? ***`;
	const acknowledgement = "Let's goooooo!";

	let acknowledged = false;
	function acknowledge() {
		acknowledged = true;
	}
</script>

<div class="container px-6 py-10">
	<h1 class="text-2xl font-bold text-left">
		{message}
	</h1>

	<form class="py-5" on:submit|preventDefault={acknowledge}>
		<fieldset>
			<button
				class="
        bg-slate-300 text-slate-900 px-4 py-2 rounded
        dark:bg-slate-900 dark:text-slate-100"
				type="submit">I do copy!</button
			>
		</fieldset>
	</form>

	{#if acknowledged}
		<p>{acknowledgement}</p>
	{/if}
</div>
