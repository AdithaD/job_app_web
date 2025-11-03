<script lang="ts">
	import EditJobForm from '../../EditJobForm.svelte';

	let { data } = $props();
</script>

<EditJobForm formProp={data.form} clients={data.clients} />
