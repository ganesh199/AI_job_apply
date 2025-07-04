document.addEventListener('DOMContentLoaded', () => {
    const profileNameInput = document.getElementById('profileName');
    const profileDataTextarea = document.getElementById('profileData');
    const saveProfileButton = document.getElementById('saveProfile');
    const clearFormButton = document.getElementById('clearForm');
    const profilesContainer = document.getElementById('profilesContainer');

    // Function to load and display profiles
    async function loadProfiles() {
        profilesContainer.innerHTML = ''; // Clear existing profiles
        const result = await chrome.storage.local.get(['profiles', 'defaultProfileId']);
        const profiles = result.profiles || {};
        const defaultProfileId = result.defaultProfileId || null;

        if (Object.keys(profiles).length === 0) {
            profilesContainer.innerHTML = '<li>No profiles yet. Create one above!</li>';
            return;
        }

        for (const id in profiles) {
            const profile = profiles[id];
            const listItem = document.createElement('li');

            const profileNameSpan = document.createElement('span');
            profileNameSpan.textContent = profile.name;
            listItem.appendChild(profileNameSpan);

            // Edit button
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                profileNameInput.value = profile.name;
                profileDataTextarea.value = profile.data;
                // Temporarily store the ID of the profile being edited
                profileNameInput.dataset.editingId = id;
            });
            listItem.appendChild(editButton);

            // Set as Default button
            const setDefaultButton = document.createElement('button');
            setDefaultButton.textContent = 'Set Default';
            setDefaultButton.classList.add('default-profile-button');
            if (id === defaultProfileId) {
                setDefaultButton.textContent = 'Default';
                setDefaultButton.disabled = true;
                setDefaultButton.style.backgroundColor = '#28a745'; // Green for default
            }
            setDefaultButton.addEventListener('click', async () => {
                await chrome.storage.local.set({ defaultProfileId: id });
                loadProfiles(); // Reload to update button states
            });
            listItem.appendChild(setDefaultButton);

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-profile-button');
            deleteButton.addEventListener('click', async () => {
                if (confirm(`Are you sure you want to delete profile "${profile.name}"?`)) {
                    delete profiles[id];
                    await chrome.storage.local.set({ profiles: profiles });
                    // If the deleted profile was the default, clear default
                    if (defaultProfileId === id) {
                        await chrome.storage.local.remove('defaultProfileId');
                    }
                    loadProfiles(); // Reload profiles after deletion
                }
            });
            listItem.appendChild(deleteButton);

            profilesContainer.appendChild(listItem);
        }
    }

    // Save profile logic
    saveProfileButton.addEventListener('click', async () => {
        const profileName = profileNameInput.value.trim();
        const profileData = profileDataTextarea.value.trim();

        if (!profileName) {
            alert('Profile Name cannot be empty.');
            return;
        }

        const result = await chrome.storage.local.get('profiles');
        const profiles = result.profiles || {};

        let profileId = profileNameInput.dataset.editingId; // Check if editing existing profile

        if (profileId && profiles[profileId]) {
            // Update existing profile
            profiles[profileId] = { name: profileName, data: profileData };
        } else {
            // Create new profile
            profileId = Date.now().toString(); // Simple unique ID
            profiles[profileId] = { name: profileName, data: profileData };
        }

        await chrome.storage.local.set({ profiles: profiles });
        profileNameInput.value = '';
        profileDataTextarea.value = '';
        delete profileNameInput.dataset.editingId; // Clear editing state
        loadProfiles(); // Reload profiles to show new/updated one
    });

    // Clear form logic
    clearFormButton.addEventListener('click', () => {
        profileNameInput.value = '';
        profileDataTextarea.value = '';
        delete profileNameInput.dataset.editingId;
    });

    // Initial load of profiles when popup opens
    loadProfiles();
});