<script lang="ts">
	import EditJobForm from '../EditJobForm.svelte';

	let { data, form } = $props();
</script>

<EditJobForm formProp={form?.form ?? data.form} clients={data.clients} />
