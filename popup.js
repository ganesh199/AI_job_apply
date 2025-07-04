document.addEventListener('DOMContentLoaded', () => {
    const autofillTabButton = document.getElementById('autofillTab');
    const keywordsTabButton = document.getElementById('keywordsTab');
    const profileTabButton = document.getElementById('profileTab');
    const closeButton = document.getElementById('closeButton');

    const autofillContent = document.getElementById('autofillContent');
    const keywordsContent = document.getElementById('keywordsContent');
    const profileContent = document.getElementById('profileContent');
    const autofillStatusMessage = document.getElementById('autofillStatusMessage');

    const referenceProfileButton = document.getElementById('referenceProfileButton');

    // Function to show a specific tab content
    function showTab(tabName) {
        // Deactivate all tab buttons and hide all content
        autofillTabButton.classList.remove('active');
        keywordsTabButton.classList.remove('active');
        profileTabButton.classList.remove('active');

        autofillContent.style.display = 'none';
        keywordsContent.style.display = 'none';
        profileContent.style.display = 'none';

        // Activate the selected tab button and show its content
        if (tabName === 'autofill') {
            autofillTabButton.classList.add('active');
            autofillContent.style.display = 'block';
        } else if (tabName === 'keywords') {
            keywordsTabButton.classList.add('active');
            keywordsContent.style.display = 'block';
        } else if (tabName === 'profile') {
            profileTabButton.classList.add('active');
            profileContent.style.display = 'block';
        }
    }

    // Event Listeners for tab buttons
    autofillTabButton.addEventListener('click', () => showTab('autofill'));
    keywordsTabButton.addEventListener('click', () => showTab('keywords'));
    profileTabButton.addEventListener('click', () => {
        // Open the profile_manager.html in a new tab
        chrome.tabs.create({ url: 'profile_manager.html' });
        window.close(); // Close the popup after opening the new tab
    });

    // MODIFIED EVENT LISTENER for "Reference Profile" button
    referenceProfileButton.addEventListener('click', () => {
        // Use chrome.storage.local.get to check for existing profiles
        // We assume profiles will be stored under a key named 'userProfiles' as an array
        chrome.storage.local.get(['userProfiles'], function(result) {
            const userProfiles = result.userProfiles || []; // Default to an empty array if no profiles exist
            let targetPage = 'dashboard.html'; // Default to the main dashboard

            // If no profiles are found (array is empty), redirect to first_user_dashboard.html
            if (userProfiles.length === 0) {
                targetPage = 'first_user_dashboard.html'; //
            }

            chrome.tabs.create({ url: targetPage });
            window.close(); // Close the popup after opening the new tab
        });
    });

    // Close button functionality
    closeButton.addEventListener('click', () => {
        window.close(); // Closes the extension popup
    });

    // Initial state: Show Autofill tab by default
    showTab('autofill');

    // Check if the current page is supported for autofill (simple example)
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0].url.toLowerCase();
        const jobBoardKeywords = [
            "linkedin.com/jobs", "indeed.com/jobs", "monster.com", "ziprecruiter.com",
            "glassdoor.com/job", "careers.google.com/jobs", "lever.co", "boards.greenhouse.io",
            "workday.com/en-us/careers", "jobvite.com", "ultipro.com/careers",
            "/apply", "/application", "/careers", "/jobs", "/job-details"
        ];
        const isSupported = jobBoardKeywords.some(keyword => currentUrl.includes(keyword));

        if (!isSupported) {
            autofillStatusMessage.style.display = 'flex'; // Show the "not supported" message
        } else {
            autofillStatusMessage.style.display = 'none'; // Hide if supported
        }
    });

    // TODO: Add functionality for "Save Job" and other option items
    document.getElementById('saveJobLink').addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        alert('Save Job functionality to be implemented!');
    });
});