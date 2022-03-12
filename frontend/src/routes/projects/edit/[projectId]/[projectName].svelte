<script>
	import { onMount } from 'svelte';

	import { page } from '$app/stores';

	import ProjectFrom from '../../../../components/ProjectFrom.svelte';

	import useProjects from '../../../../fetchs/projects';

	const projectId = $page.params.projectId;
	const projectName = $page.params.projectName;
	let update;
	let delProject;

	onMount(async () => {
		const { updateProject, deleteProject } = useProjects(localStorage.jwt);
		update = updateProject;
		delProject = deleteProject;
	});

	async function submitProjectUpdate(event) {
		const projectName = getProjectNameFromSubmitEvent(event);

		const returnedId = await update(projectId, projectName);

		const failedToCreate = !returnedId;
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

	async function sumbitDeleteProject() {
		return await delProject(projectId);
	}
</script>

<div class="container px-6 py-10">
	<div class="menu mb-5 w-full flex justify-between">
		<h2 class="text-2xl">Update project</h2>
		<button class="button" on:click={sumbitDeleteProject}>Delete project</button>
	</div>

	<ProjectFrom submitFunction={submitProjectUpdate} {projectName} isEditing={true} />
</div>
