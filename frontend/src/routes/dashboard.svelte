<script>
	import { onMount } from 'svelte';

	import useFetchProjects from '../fetchs/projects';

	let projects = [];

	onMount(async () => {
		const { fetchProjects } = useFetchProjects(localStorage.jwt);
		const projectList = await fetchProjects();
		projects = [...projectList];
	});
</script>

<div class="container px-6 py-10">
	<div class="menu mb-5 w-full flex justify-between">
		<h2 class="text-3xl font-bold">Dashboard</h2>
		<a class="link" href="/projects/create">New Project</a>
	</div>

	<h3 class="text-xl mb-3">Your projects</h3>
	{#if projects.length}
		{#each projects as item, index}
			<p>
				<span>Name:</span>
				<a class="link" title="Click to edit project." href="/projects/edit/{item.id}/{item.name}">
					{item.name}</a
				>
			</p>
		{/each}
	{:else}
		<div class="no-projects">
			<h3>You have no projects yet.</h3>
			<p>
				Create your first project
				<a class="link" href="/projects/create">here</a>.
			</p>
		</div>
	{/if}
</div>
