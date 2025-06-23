import { useEffect, useState } from 'react';
// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
// Icons
import Search from '@mui/icons-material/Search';
// Components & Helpers
import TimeSetter from './TimeSetter';
import { deFormatTime, formatTime, timeToSeconds, type TimeProps } from './helpers';

const App = () => {
	const [isFilterEnabled, setIsFilterEnabled] = useState(false);
	const [applyOnMixes, setApplyOnMixes] = useState(true);
	const [applyOnLiveVideos, setApplyOnLiveVideos] = useState(true);
	const [minTime, setMinTime] = useState<TimeProps>({
		hours: 0,
		minutes: 0,
		seconds: 0,
	});
	const [maxTime, setMaxTime] = useState<TimeProps>({
		hours: 0,
		minutes: 15,
		seconds: 0,
	});
	const isFilterActionDisabled = timeToSeconds(maxTime) <= timeToSeconds(minTime);
	const [outsideRangeAction, setOutsideRangeAction] = useState<'transparent' | 'hide'>('transparent');

	/**
	 * Initiates the filtering process asynchronously.
	 * This function may involve operations such as fetching data,
	 * processing the video list, or updating the UI based on the filtering criteria.
	 */
	const handleStartFiltering = () => {
		setIsFilterEnabled(true);

		const parsedData = {
			minTime: formatTime(minTime),
			maxTime: formatTime(maxTime),
			action: outsideRangeAction,
			applyOnMixes: applyOnMixes,
			applyOnLiveVideos: applyOnLiveVideos,
		};

		chrome.runtime.sendMessage({
			type: 'startFiltering',
			data: parsedData,
		});

		chrome.storage.local.set({
			isFilteringActive: true,
			filterData: parsedData,
		});
	};

	/**
	 * Handles the action to stop filtering.
	 * This function is called when the user decides to stop the current filtering process.
	 */
	const handleStopFiltering = () => {
		setIsFilterEnabled(false);
		chrome.runtime.sendMessage({
			type: 'stopFiltering',
		});
	};

	useEffect(() => {
		chrome.storage?.local?.get(['isFilteringActive', 'filterData'], (result) => {
			if (result.filterData) {
				setMinTime(deFormatTime(result.filterData.minTime));
				setMaxTime(deFormatTime(result.filterData.maxTime));
				setOutsideRangeAction(result.filterData.action);
				setApplyOnMixes(result.filterData.applyOnMixes || true);
			}
			setIsFilterEnabled(result?.isFilteringActive || false);
		});
	}, []);

	return (
		<Box
			sx={{
				minWidth: '600px',
			}}
		>
			<Box
				display="flex"
				alignContent="center"
				justifyContent="center"
				flexDirection="column"
				margin={1}
				textAlign="center"
				gap={2}
			>
				<Typography variant="h4" my={1} fontWeight="800">
					YouTube Lunchbreak
				</Typography>

				<Divider />

				<Grid container spacing={2} mx={2}>
					<Grid size={{ xs: 5 }}>
						<TimeSetter title="Min. duration" time={minTime} onChange={setMinTime} disabled={isFilterEnabled} />
					</Grid>

					<Grid size={{ xs: 2 }}>
						<Divider orientation="vertical" sx={{ width: '50%' }} />
					</Grid>

					<Grid size={{ xs: 5 }}>
						<TimeSetter title="Max. duration" time={maxTime} onChange={setMaxTime} disabled={isFilterEnabled} />
					</Grid>
				</Grid>

				<Divider />

				<Grid container spacing={1} justifyContent="space-between" alignItems="center" mx={1}>
					<Grid size={{ xs: 6 }} textAlign="left">
						<Typography variant="caption" color="text.secondary">
							* Videos outside time range should be:
						</Typography>
					</Grid>

					<Grid size={{ xs: 6 }}>
						<ToggleButtonGroup
							exclusive
							fullWidth
							color="standard"
							value={outsideRangeAction}
							size="small"
							onChange={(_, value) => {
								if (value !== null) {
									setOutsideRangeAction(value);
								}
							}}
							disabled={isFilterEnabled}
						>
							<ToggleButton value="transparent">
								<Typography variant="button">Transparent</Typography>
							</ToggleButton>
							<ToggleButton value="hide">
								<Typography variant="button">hidden</Typography>
							</ToggleButton>
						</ToggleButtonGroup>
					</Grid>

					<Grid size={{ xs: 6 }} textAlign="left">
						<Typography variant="caption" color="text.secondary">
							* Apply action on mixes:
						</Typography>
					</Grid>

					<Grid size={{ xs: 6 }} textAlign="right">
						<Checkbox
							size="small"
							checked={applyOnMixes}
							onChange={(e) => setApplyOnMixes(e.target.checked)}
							disabled={isFilterEnabled}
						/>
					</Grid>

					<Grid size={{ xs: 6 }} textAlign="left">
						<Typography variant="caption" color="text.secondary">
							* Apply action on live videos:
						</Typography>
					</Grid>

					<Grid size={{ xs: 6 }} textAlign="right">
						<Checkbox
							size="small"
							checked={applyOnLiveVideos}
							onChange={(e) => setApplyOnLiveVideos(e.target.checked)}
							disabled={isFilterEnabled}
						/>
					</Grid>
				</Grid>

				<Divider />

				{isFilterEnabled ? (
					<Button
						variant="outlined"
						color="error"
						fullWidth
						startIcon={<CircularProgress size={16} color="inherit" />}
						onClick={handleStopFiltering}
					>
						Stop Filtering
					</Button>
				) : (
					<Button
						variant="contained"
						color="error"
						fullWidth
						startIcon={<Search />}
						onClick={handleStartFiltering}
						disabled={isFilterActionDisabled}
					>
						Start filtering!
					</Button>
				)}

				<Typography variant="caption" color="text.secondary" letterSpacing=".75px">
					Made with ❤️ by{' '}
					<Typography
						component="a"
						color="error"
						variant="caption"
						letterSpacing=".75px"
						sx={{
							textDecoration: 'none',
							cursor: 'pointer',
							'&:hover': {
								textDecoration: 'underline',
							},
						}}
						onClick={() => {
							window.open('https://www.dandrewbox.dev', '_blank');
						}}
					>
						DAndrëwBox
					</Typography>
				</Typography>
			</Box>

			<Box display="flex" alignItems="center" justifyContent="center" flexDirection="row" width="100%">
				<Typography
					textAlign="center"
					variant="caption"
					width="100%"
					color="white"
					sx={{
						backgroundColor: (theme) => theme.palette.error.dark,
					}}
				>
					You can{' '}
					<Typography
						component="a"
						variant="caption"
						sx={{
							textDecoration: 'underline',
							cursor: 'pointer',
							'&:hover': {
								color: (theme) => theme.palette.primary.contrastText,
							},
						}}
						onClick={() => {
							window.open('https://ko-fi.com/dandrewbox', '_blank');
						}}
					>
						support me with a coffee
					</Typography>{' '}
					if you liked this extension!
				</Typography>
			</Box>
		</Box>
	);
};

export default App;
