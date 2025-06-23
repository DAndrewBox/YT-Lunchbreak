// Track active filtering state
let isFilteringActive = false;
let currentFilterData: null | Record<string, string | boolean> = null;
let activeTabId: null | number = null;

// Handle messages from popup/content script
chrome.runtime.onMessage.addListener(async (message, _sender, _sendResponse) => {
	if (message.type === 'startFiltering') {
		isFilteringActive = true;
		currentFilterData = message.data;

		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (tab && tab?.id) {
			activeTabId = tab.id;
			await applyFiltering(tab.id);
		}
	} else if (message.type === 'stopFiltering') {
		isFilteringActive = false;
		currentFilterData = null;

		if (activeTabId) {
			try {
				chrome.storage.local.set({
					isFilteringActive: false,
				});
				await chrome.tabs.sendMessage(activeTabId, {
					type: 'stopFiltering',
				});
				chrome.action.setIcon({ tabId: activeTabId, path: 'src/assets/logo-disabled-128.png' });
			} catch (error) {
				console.warn('Content script not available to stop filtering');
			}
		}
	}
});

// Handle tab updates (page navigation)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
	if (tabId === activeTabId && changeInfo.status === 'complete') {
		if (isFilteringActive && currentFilterData) {
			await applyFiltering(tabId);
		}
	}
});

async function applyFiltering(tabId: number) {
	try {
		// First try sending message to existing content script
		await chrome.tabs.sendMessage(
			tabId,
			{
				type: 'filterVideos',
				data: currentFilterData,
			},
			() => {
				chrome.action.setIcon({ tabId, path: 'src/assets/logo-128.png' });
			},
		);
	} catch (error) {
		// If no content script, inject fresh
		try {
			await chrome.scripting.executeScript({
				target: { tabId },
				files: ['content.js'],
			});
		} catch (injectionError) {
			console.error('Failed to inject content script:', injectionError);
		}
	}
}
