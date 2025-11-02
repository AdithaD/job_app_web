<script lang="ts">
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { CalendarDate, CalendarDateTime } from '@internationalized/date';
	import { format } from 'date-fns';

	const id = $props.id();

	let {
		name,
		value,
		onValueChange,
		...restProps
	}: {
		name: string;
		value: Date | undefined;
		id: string;
		onValueChange: (dt: CalendarDateTime | undefined) => void;
	} = $props();

	let open = $state(false);

	function date() {
		return value
			? new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate())
			: undefined;
	}

	let dateValue = $state<CalendarDate | undefined>(date());
	let timeValue = $state<string | undefined>(
		value
			? `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}`
			: undefined
	);

	$effect(() => {
		let dateTime: CalendarDateTime | undefined;
		if (dateValue) {
			dateTime = new CalendarDateTime(dateValue.year, dateValue.month, dateValue.day);
			if (timeValue) {
				let [hour, minutes] = timeValue.split(':');
				dateTime = dateTime.set({
					hour: parseInt(hour),
					minute: parseInt(minutes)
				});
			}
		}
		console.log(dateTime);
		onValueChange(dateTime);
	});
</script>

<div class="flex gap-4" {...restProps}>
	<div class="flex flex-col">
		<Popover.Root bind:open>
			<Popover.Trigger id="{id}-date">
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="w-32 justify-between font-normal">
						{dateValue
							? format(dateValue.toDate(getLocalTimeZone()), 'dd MMM yyyy')
							: 'Select date'}
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto overflow-hidden p-0" align="start">
				<Calendar
					type="single"
					locale="en-AU"
					bind:value={dateValue}
					onValueChange={() => {
						open = false;
					}}
					captionLayout="dropdown"
				/>
			</Popover.Content>
		</Popover.Root>
	</div>
	<div class="flex flex-col gap-3">
		<Input
			type="time"
			id="{id}-time"
			bind:value={timeValue}
			class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
		/>
	</div>
	<input {name} type="datetime" bind:value hidden />
</div>
