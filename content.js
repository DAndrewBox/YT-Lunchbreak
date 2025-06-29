let observer = null;
let currentFilter = null;

const applyActionToVideo = (apply, video, data) => {
	const action = data.action;
	if (apply) {
		if (action === 'hide') {
			video.style.display = 'none';
			video.style.opacity = '1';
		} else if (action === 'transparent') {
			video.style.display = 'block';
			video.style.opacity = '0.20';
		}
	} else {
		video.style.display = 'block';
		video.style.opacity = '1';
	}
};

// Clean up previous filtering before applying new one
const cleanupFiltering = () => {
	currentFilter = null;

	if (observer) {
		observer.disconnect();
		observer = null;
	}

	// Reset all videos to visible
	const allVideos = document.getElementsByTagName('ytd-rich-item-renderer');
	for (const video of allVideos) {
		video.style.display = '';
		video.style.opacity = '';
	}
};

// Apply the filter based on the provided data
const applyFilter = (data) => {
	cleanupFiltering();
	currentFilter = data;

	// Initial filtering
	hideYouTube(data);

	// Set up observer for dynamic content
	observer = new MutationObserver(() => {
		hideYouTube(data);
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
};

const hideYouTube = (data) => {
	const allVideosInFeed = document.getElementsByTagName('ytd-rich-item-renderer');

	for (const video of allVideosInFeed) {
		// Query for Mixes, apply actions if 'applyOnMixes' is true
		if (data.applyOnMixes) {
			const querySelectorMixes = video.querySelector('div#content > yt-lockup-view-model');
			if (querySelectorMixes) {
				applyActionToVideo(true, video, data);
				continue;
			}
		}

		// Query for live videos, apply actions if 'applyOnLiveVideos' is true
		if (data.applyOnLiveVideos) {
			const querySelectorLive = video.querySelector(
				'div#content > ytd-rich-grid-media > div#dismissible > div#details > div#meta > ytd-badge-supported-renderer > div.badge-style-type-live-now-alternate',
			);
			if (querySelectorLive) {
				applyActionToVideo(true, video, data);
				continue;
			}
		}

		// Query for selectors
		const querySelector = video.querySelector(
			'div#content > ytd-rich-grid-media > div#dismissible > div#thumbnail > ytd-thumbnail > a#thumbnail > div#overlays > ytd-thumbnail-overlay-time-status-renderer > div > badge-shape > div.badge-shape-wiz__text',
		);
		if (!querySelector) continue;

		const timestamp = (querySelector?.textContent ?? '00:00').trim();
		const timeParts = timestamp.split(':').map(Number);
		const videoLengthInSeconds = timeParts.reduce((acc, part, index) => {
			return acc + part * 60 ** (timeParts.length - 1 - index);
		}, 0);

		// Convert maxTime to seconds for easier comparison
		const maxTime = data.maxTime;
		const maxTimeUnits = maxTime.split(':').map(Number);
		const maxTimeInSeconds = maxTimeUnits.reduce(
			(acc, unit, index) => acc + unit * 60 ** (maxTimeUnits.length - 1 - index),
			0,
		);

		// Convert minTime to seconds for easier comparison
		const minTime = data.minTime;
		const minTimeUnits = minTime.split(':').map(Number);
		const minTimeInSeconds = minTimeUnits.reduce(
			(acc, unit, index) => acc + unit * 60 ** (minTimeUnits.length - 1 - index),
			0,
		);

		// Execute the action based on the video length and max time
		const videoIsOutOfRange = videoLengthInSeconds > maxTimeInSeconds || videoLengthInSeconds < minTimeInSeconds;
		applyActionToVideo(videoIsOutOfRange, video, data);
	}
};

// Message listener
chrome.runtime.onMessage.addListener((message) => {
	if (message.type === 'filterVideos') {
		applyFilter(message.data);
	} else if (message.type === 'stopFiltering') {
		cleanupFiltering();
		currentFilter = null;
	}
});

// Reapply filter when history state changes (SPA navigation)
window.addEventListener('yt-navigate-finish', () => {
	if (currentFilter) {
		applyFilter(currentFilter);
	}
});
