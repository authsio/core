<script>
	import { onMount } from 'svelte';
	import ProjectFrom from '../../components/ProjectFrom.svelte';

	import useProjects from '../../fetchs/projects';

	let create;

	onMount(async () => {
		const { createProject } = useProjects(localStorage.jwt);
		create = createProject;
	});

	async function submitProjectCreation(event) {
		const projectName = getProjectNameFromSubmitEvent(event);
		const projectId = await create(projectName);

		const failedToCreate = !projectId;
		if (failedToCreate) {
			return;
		}

		window.location.pathname = '/dashboard';
	}

	function getProjectNameFromSubmitEvent(event) {
		const formElement = event.target;
		const formData = new FormData(formElement);
		const formValues = [...formData.values()];
		const projectName = formValues[0];

		return projectName;
	}
</script>

<div class="container px-6 py-10">
	<h2 class="text-2xl">Create a new project</h2>

	<ProjectFrom submitFunction={submitProjectCreation} />
</div>
