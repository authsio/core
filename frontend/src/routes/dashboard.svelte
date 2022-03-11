<script>
	import { onMount } from 'svelte';

	import useFetchProjects from '../fetchs/dashboard';

	let projects = [];

	onMount(async () => {
		const { fetchProjects } = useFetchProjects(localStorage.jwt);
		const projectList = await fetchProjects();
		projects = [...projectList];
	});
</script>

<div class="container px-6 py-10">
	<h2>Dashboard</h2>

	<h3>Project List</h3>

	{#each projects as item, index}
		<p>
			<span>Name:</span>
			<span>{item.name}</span>
		</p>
	{/each}
</div>
