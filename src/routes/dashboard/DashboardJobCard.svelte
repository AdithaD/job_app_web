<script lang="ts">
	import DateWithIcon from '../../lib/components/ui/DateWithIcon.svelte';

	import { format } from 'date-fns';
	import * as Card from '$lib/components/ui/card';
	import { jobStatusToString, paymentStatusToString } from '$lib/utils';
	import type { Job } from '$lib/server/db/schema';
	import AddressWithIcon from '$lib/components/ui/AddressWithIcon.svelte';

	const { job }: { job: Job } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>
			<div class="flex justify-between">
				<div><a class="hover:underline" href="/job/{job.id}">{job.title}</a></div>
				<div>#{job.jobNumber}</div>
			</div>
		</Card.Title>
		<Card.Description>
			{jobStatusToString(job.jobStatus)}, {paymentStatusToString(job.paymentStatus)}
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<DateWithIcon date={job.scheduledDate} />
		<AddressWithIcon location={job.location} />
	</Card.Content>
</Card.Root>
