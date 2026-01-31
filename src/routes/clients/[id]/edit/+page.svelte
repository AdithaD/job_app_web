<script lang="ts">
	import EditClientForm from '../../EditClientForm.svelte';

	let { data } = $props();
</script>

<EditClientForm action="?/edit" formProp={data.form} clientId={data.client.id} />