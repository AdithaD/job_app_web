<script>
	import { superForm } from 'sveltekit-superforms';
	import EditWorkForm from '../EditWorkForm.svelte';
	import { addWorkFormSchema } from '../../../validation';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	let { data, form: formProp } = $props();

	const form = superForm(formProp?.form ?? data.form, {
		validators: zod4Client(addWorkFormSchema)
	});
</script>

<EditWorkForm
	formProp={data.form}
	materials={data.materials}
	jobId={data.jobId}
	workId={data.work.id}
	action={'edit'}
/>
