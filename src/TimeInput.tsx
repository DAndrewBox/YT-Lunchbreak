import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

interface TimeInputProps {
	value: number;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	max: number;
	disabled?: boolean;
}

const TimeInput = ({ value, onChange, max, disabled }: TimeInputProps) => (
	<Grid size={{ xs: 3 }}>
		<TextField
			type="number"
			variant="standard"
			size="small"
			value={value}
			onChange={onChange}
			slotProps={{
				htmlInput: {
					min: 0,
					max: max,
					step: 1,
					style: {
						textAlign: 'right',
					},
				},
			}}
			fullWidth
			disabled={disabled}
		/>
	</Grid>
);

export default TimeInput;
