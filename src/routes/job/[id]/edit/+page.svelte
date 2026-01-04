<script lang="ts">
	import EditJobForm from '../../EditJobForm.svelte';

	let { data } = $props();
</script>

<EditJobForm action="?/edit" formProp={data.form} clients={data.clients} jobId={data.job.id} />
