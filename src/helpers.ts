export interface TimeProps {
	hours: number;
	minutes: number;
	seconds: number;
}

/**
 * Converts a time object into total seconds.
 * @param time - An object representing time with hours, minutes, and seconds.
 * @returns The total time in seconds.
 */
export const timeToSeconds = (time: TimeProps): number => {
	return time.hours * 3600 + time.minutes * 60 + time.seconds;
};

/**
 * Formats the given time object into a string representation.
 * @param time - An object containing hours, minutes, and seconds.
 * @returns A string formatted as "MM:SS" or "HH:MM:SS" depending on the value of hours.
 */
export const formatTime = (time: TimeProps) => {
	// If hours are 0, format as MM:SS
	if (time.hours < 1) {
		return `${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
	}
	// Otherwise, format as HH:MM:SS
	return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
};

/**
 * Converts a time string in the format "MM:SS" or "HH:MM:SS" into an object with hours, minutes, and seconds.
 * @param timeString - The time string to be converted.
 * @returns An object containing the hours, minutes, and seconds.
 * @throws Error if the time format is invalid.
 */
export const deFormatTime = (timeString: string): TimeProps => {
	const parts = timeString.split(':').map(Number);

	// If it has 2 parts, it's MM:SS, so hours should be 0
	if (parts.length === 2) {
		return { hours: 0, minutes: parts[0], seconds: parts[1] };
	}

	// If it has 3 parts, it's HH:MM:SS
	if (parts.length === 3) {
		return { hours: parts[0], minutes: parts[1], seconds: parts[2] };
	}

	// If it has neither 2 nor 3 parts, the format is invalid
	throw new Error('Invalid time format');
};
