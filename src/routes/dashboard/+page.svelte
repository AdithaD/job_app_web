<script lang="ts">
	import { useSession } from '$lib/auth-client';

	const session = useSession();
</script>

<h1>{$session.data?.user.name}</h1>
