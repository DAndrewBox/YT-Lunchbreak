import { useCallback, useEffect, useState } from 'react';
// MUI
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
// Helpers & Components
import { debounce } from 'lodash';
import TimeInput from './TimeInput';
import type { TimeProps } from './helpers';

interface TimeSetterProps {
	title: React.ReactNode;
	time: TimeProps;
	onChange: (value: (prev: TimeProps) => TimeProps) => void;
	debounceDelay?: number;
	disabled: boolean;
}

const DEFAULT_DEBOUNCE_DELAY = 300;

export const TimeSetter = ({
	title,
	time,
	onChange,
	debounceDelay = DEFAULT_DEBOUNCE_DELAY,
	disabled,
}: TimeSetterProps) => {
	const [localTime, setLocalTime] = useState<TimeProps>(time);

	// Update local state when prop changes
	useEffect(() => {
		setLocalTime(time);
	}, [time]);

	// Debounced onChange handler
	const debouncedOnChange = useCallback(
		debounce((newTime: TimeProps) => {
			onChange(() => newTime);
		}, debounceDelay),
		[],
	);

	// Handle time part change
	const handleTimeChange = (part: keyof TimeProps) => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(e.target.value, 10) || 0;
		let newValue = value;

		// Apply constraints based on time part
		if (part === 'hours') {
			newValue = Math.min(Math.max(value, 0), 23);
		} else {
			newValue = Math.min(Math.max(value, 0), 59);
		}

		const newTime = { ...localTime, [part]: newValue };
		setLocalTime(newTime);
		debouncedOnChange(newTime);
	};

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			debouncedOnChange.cancel();
		};
	}, [debouncedOnChange]);

	return (
		<Box display="flex" flexDirection="column" alignItems="center">
			<Typography variant="h6" mr={1}>
				{title}
			</Typography>

			<Grid container spacing={0.5} marginTop={1} justifyContent="center">
				<TimeInput value={localTime.hours} onChange={handleTimeChange('hours')} max={23} disabled={disabled} />

				<Typography variant="h6" component="span" alignSelf="center" sx={{ pointerEvents: 'none', userSelect: 'none' }}>
					:
				</Typography>

				<TimeInput value={localTime.minutes} onChange={handleTimeChange('minutes')} max={59} disabled={disabled} />

				<Typography variant="h6" component="span" alignSelf="center" sx={{ pointerEvents: 'none', userSelect: 'none' }}>
					:
				</Typography>

				<TimeInput value={localTime.seconds} onChange={handleTimeChange('seconds')} max={59} disabled={disabled} />
			</Grid>
		</Box>
	);
};

export default TimeSetter;
