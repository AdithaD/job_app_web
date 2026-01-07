<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { addWorkFormSchema } from '../../../validation.js';
	import EditWorkForm from '../EditWorkForm.svelte';

	let { data, form: formProp } = $props();

	const form = superForm(formProp?.form ?? data.form, {
		validators: zod4Client(addWorkFormSchema)
	});

	const { form: formData, enhance } = form;
</script>

<EditWorkForm formProp={data.form} materials={[]} jobId={data.jobId} />
