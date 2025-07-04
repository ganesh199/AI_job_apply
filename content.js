// This content script will run on every page due to manifest.json setup.
// It will listen for messages from the background script.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showAutofillPrompt") {
        console.log("Received request to show autofill prompt.");
        // We will inject a div here to ask the user to select a profile
        showAutofillSelectionPrompt();
    }
});

function showAutofillSelectionPrompt() {
    // Prevent multiple prompts if the message is sent multiple times
    if (document.getElementById('autofill-selection-popup')) {
        console.log("Autofill prompt already exists.");
        return;
    }

    // Create the overlay and popup elements
    const overlay = document.createElement('div');
    overlay.id = 'autofill-selection-popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    const popup = document.createElement('div');
    popup.id = 'autofill-selection-popup';
    popup.style.cssText = `
        background-color: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        text-align: center;
        width: 350px;
        font-family: Arial, sans-serif;
        color: #333;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Autofill Job Application?';
    title.style.cssText = `
        margin-top: 0;
        margin-bottom: 20px;
        color: #2c3e50;
    `;

    const selectProfileLabel = document.createElement('label');
    selectProfileLabel.textContent = 'Select a profile:';
    selectProfileLabel.htmlFor = 'profile-select';
    selectProfileLabel.style.cssText = `
        display: block;
        margin-bottom: 10px;
        font-weight: bold;
    `;

    const profileSelect = document.createElement('select');
    profileSelect.id = 'profile-select';
    profileSelect.style.cssText = `
        width: 100%;
        padding: 8px;
        margin-bottom: 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: space-around;
        margin-top: 20px;
    `;

    const autofillButton = document.createElement('button');
    autofillButton.textContent = 'Autofill Selected';
    autofillButton.style.cssText = `
        background-color: #4CAF50;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 15px;
        flex: 1;
        margin-right: 10px;
    `;
    autofillButton.addEventListener('mouseover', (e) => e.target.style.backgroundColor = '#45a049');
    autofillButton.addEventListener('mouseout', (e) => e.target.style.backgroundColor = '#4CAF50');


    const useDefaultButton = document.createElement('button');
    useDefaultButton.textContent = 'Use Default';
    useDefaultButton.style.cssText = `
        background-color: #007bff;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 15px;
        flex: 1;
        margin-left: 10px;
    `;
    useDefaultButton.addEventListener('mouseover', (e) => e.target.style.backgroundColor = '#0056b3');
    useDefaultButton.addEventListener('mouseout', (e) => e.target.style.backgroundColor = '#007bff');


    const closeButton = document.createElement('button');
    closeButton.textContent = 'No, thanks';
    closeButton.style.cssText = `
        background-color: #f44336;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 15px;
        margin-top: 15px;
        width: 100%;
    `;
    closeButton.addEventListener('mouseover', (e) => e.target.style.backgroundColor = '#d32f2f');
    closeButton.addEventListener('mouseout', (e) => e.target.style.backgroundColor = '#f44336');


    closeButton.addEventListener('click', () => {
        overlay.remove();
    });

    autofillButton.addEventListener('click', () => {
        const selectedProfileId = profileSelect.value;
        if (selectedProfileId) {
            alert(`Autofilling with profile: ${profileSelect.options[profileSelect.selectedIndex].text}`);
            // TODO: Add actual autofill logic here
            overlay.remove();
        } else {
            alert('Please select a profile.');
        }
    });

    useDefaultButton.addEventListener('click', async () => {
        const result = await chrome.storage.local.get('defaultProfileId');
        const defaultProfileId = result.defaultProfileId;
        if (defaultProfileId) {
            const profilesResult = await chrome.storage.local.get('profiles');
            const defaultProfile = profilesResult.profiles[defaultProfileId];
            if (defaultProfile) {
                alert(`Autofilling with default profile: ${defaultProfile.name}`);
                // TODO: Add actual autofill logic here
                overlay.remove();
            } else {
                alert('Default profile not found or deleted. Please select another profile or set a new default.');
            }
        } else {
            alert('No default profile set. Please select one from the dropdown or set a default in the extension popup.');
        }
    });

    // Populate the dropdown with profiles
    chrome.storage.local.get(['profiles', 'defaultProfileId'], (result) => {
        const profiles = result.profiles || {};
        const defaultProfileId = result.defaultProfileId;

        // Add a disabled default option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "--- Select a Profile ---";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        profileSelect.appendChild(defaultOption);


        if (Object.keys(profiles).length === 0) {
            const noProfileOption = document.createElement('option');
            noProfileOption.value = "no-profiles";
            noProfileOption.textContent = "No profiles available. Create one in the extension popup!";
            noProfileOption.disabled = true;
            profileSelect.appendChild(noProfileOption);
            autofillButton.disabled = true;
            useDefaultButton.disabled = true;
        } else {
            for (const id in profiles) {
                const profile = profiles[id];
                const option = document.createElement('option');
                option.value = id;
                option.textContent = profile.name;
                profileSelect.appendChild(option);

                // If this is the default profile, pre-select it
                if (id === defaultProfileId) {
                    profileSelect.value = id;
                }
            }
        }
    });

    popup.appendChild(title);
    popup.appendChild(selectProfileLabel);
    popup.appendChild(profileSelect);
    buttonContainer.appendChild(autofillButton);
    buttonContainer.appendChild(useDefaultButton);
    popup.appendChild(buttonContainer);
    popup.appendChild(closeButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}