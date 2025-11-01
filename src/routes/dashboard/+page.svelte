<script lang="ts">
	import { useSession } from '$lib/auth-client';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { jobStatusToString, paymentStatusToString } from '$lib/utils';

	const { data } = $props();
</script>

<div class="flex h-screen flex-col p-8">
	<div class="flex min-h-0 flex-1 gap-8 rounded-lg border-2 p-8">
		<div class="flex min-h-0 flex-1 flex-col">
			<h1 class="mb-4 text-4xl font-bold">Upcoming</h1>
			<div class="grid min-h-0 flex-1 gap-4 overflow-y-auto">
				{#each data.jobs as job}
					<Card.Root>
						<Card.Header>
							<Card.Title>{job.title}</Card.Title>
							<Card.Description>
								{jobStatusToString(job.jobStatus)}, {paymentStatusToString(job.paymentStatus)}
							</Card.Description>
						</Card.Header>
						<Card.Content>
							{job.scheduledDate?.toLocaleString()}
							<br />
							{job.location}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
		<div class="flex-2"></div>
		<div class="flex-1">
			<h2 class="mb-4 text-2xl font-bold">Quick Actions</h2>
			<div class="flex flex-col gap-4">
				<Button variant="default">Add New Job</Button>
				<Button variant="secondary">Quick Search</Button>
			</div>
		</div>
	</div>
</div>
