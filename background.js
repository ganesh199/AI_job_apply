// This listener runs when the extension is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Job Autofiller extension installed.");
});

// Listener for when a tab is updated (e.g., URL changes, page loads)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // We only care when the tab finishes loading and has a URL
  if (changeInfo.status === 'complete' && tab.url) {
    // A very basic check: does the URL contain common job board keywords?
    // This will need significant improvement for real-world use.
    const jobBoardKeywords = [
      "linkedin.com/jobs", "indeed.com/jobs", "monster.com", "ziprecruiter.com",
      "glassdoor.com/job", "careers.google.com/jobs", "lever.co", "boards.greenhouse.io",
      "workday.com/en-us/careers", "jobvite.com", "ultipro.com/careers",
      "/apply", "/application", "/careers", "/jobs", "/job-details" // more generic paths
    ];

    const urlLower = tab.url.toLowerCase();
    const isJobApplicationPage = jobBoardKeywords.some(keyword => urlLower.includes(keyword));

    if (isJobApplicationPage) {
      console.log(`Potential job application page detected: ${tab.url}`);

      // Check if the user has any profiles saved
      const result = await chrome.storage.local.get('profiles');
      const profiles = result.profiles || {};

      if (Object.keys(profiles).length > 0) {
        // Send a message to the content script in this tab
        // to show the autofill prompt.
        chrome.tabs.sendMessage(tabId, { action: "showAutofillPrompt" });
      } else {
        console.log("No profiles found. Skipping autofill prompt.");
      }
    }
  }
});