<script lang="ts">
	import '../app.css';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { page } from '$app/state';
	const data = [
		{
			title: 'Job Management',
			items: [
				{
					title: 'Dashboard',
					url: '/dashboard'
				},
				{
					title: 'All Jobs',
					url: '/all-jobs'
				}
			]
		}
	];
</script>

<Sidebar.Root>
	<Sidebar.Header></Sidebar.Header>
	<Sidebar.Content>
		{#each data as group (group.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={page.url.pathname == item.url}>
									{#snippet child({ props })}
										<a href={item.url} {...props}>{item.title}</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>
</Sidebar.Root>
