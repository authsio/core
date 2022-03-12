<script>
	export let submitFunction;
	export let isEditing = false;
	export let projectName = '';

	$: buttonLabel = isEditing ? 'Edit' : 'Create';
</script>

<form class="py-5" on:submit|preventDefault={submitFunction}>
	<fieldset class="fieldset">
		<label for="projectName">Project Name</label>
		<input
			value={projectName}
			class="form-input"
			type="text"
			id="projectName"
			name="projectName"
			autocomplete=""
			required
		/>
	</fieldset>

	<fieldset class="fieldset">
		<button class="button" type="submit">{buttonLabel}</button>
	</fieldset>
</form>
