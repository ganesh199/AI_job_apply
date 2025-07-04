document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    // Modal elements
    const profileModal = document.getElementById('profileModal');
    const closeButton = profileModal ? profileModal.querySelector('.close-button') : null;
    const cancelButton = profileModal ? profileModal.querySelector('.cancel-button') : null;
    const profileForm = profileModal ? document.getElementById('profileForm') : null;

    // Form input elements (inside modal) - Existing Personal Info Fields
    const profileNameInput = profileForm ? document.getElementById('profileName') : null;
    const firstNameInput = profileForm ? document.getElementById('firstName') : null;
    const lastNameInput = profileForm ? document.getElementById('lastName') : null;
    const emailAddressInput = profileForm ? document.getElementById('emailAddress') : null;
    const dateOfBirthInput = profileForm ? document.getElementById('dateOfBirth') : null;
    const phoneNumberInput = profileForm ? document.getElementById('phoneNumber') : null;
    const locationInput = profileForm ? document.getElementById('location') : null;
    const addressLine1Input = profileForm ? document.getElementById('addressLine1') : null;
    const addressLine2Input = profileForm ? document.getElementById('addressLine2') : null;
    const addressLine3Input = profileForm ? document.getElementById('addressLine3') : null;
    const postalCodeInput = profileForm ? document.getElementById('postalCode') : null;

    // NEW: Form input elements (inside modal) - EEO Fields
    const ethnicityInput = profileForm ? document.getElementById('ethnicity') : null;
    const authWorkUSInput = profileForm ? document.getElementById('authWorkUS') : null;
    const authWorkCanadaInput = profileForm ? document.getElementById('authWorkCanada') : null;
    const authWorkUKInput = profileForm ? document.getElementById('authWorkUK') : null;
    const sponsorshipInput = profileForm ? document.getElementById('sponsorship') : null;
    const disabilityInput = profileForm ? document.getElementById('disability') : null;
    const lgbtqInput = profileForm ? document.getElementById('lgbtq') : null;
    const genderInput = profileForm ? document.getElementById('gender') : null;
    const veteranInput = profileForm ? document.getElementById('veteran') : null;


    let editingProfileId = null;

    // --- Modal Functions ---
    function openProfileModal(profileData = {}) {
        profileModal.style.display = 'flex';
        // Pre-fill form if editing an existing profile (or default values for new)

        // Personal Info fields
        if (profileNameInput) profileNameInput.value = profileData.name || '';
        const fullNameParts = profileData.fullName ? profileData.fullName.split(' ') : ['', ''];
        if (firstNameInput) firstNameInput.value = fullNameParts[0] || '';
        if (lastNameInput) lastNameInput.value = fullNameParts.slice(1).join(' ') || '';
        if (emailAddressInput) emailAddressInput.value = profileData.email || '';
        if (dateOfBirthInput) dateOfBirthInput.value = profileData.dateOfBirth || '';
        if (phoneNumberInput) phoneNumberInput.value = profileData.phoneNumber || '';
        if (locationInput) locationInput.value = profileData.location || '';
        if (addressLine1Input) addressLine1Input.value = profileData.addressLine1 || '';
        if (addressLine2Input) addressLine2Input.value = profileData.addressLine2 || '';
        if (addressLine3Input) addressLine3Input.value = profileData.addressLine3 || '';
        if (postalCodeInput) postalCodeInput.value = profileData.postalCode || '';

        // NEW: EEO Fields - Added checks to ensure elements exist
        if (ethnicityInput) ethnicityInput.value = profileData.ethnicity || '';
        if (authWorkUSInput) authWorkUSInput.value = profileData.authWorkUS || '';
        if (authWorkCanadaInput) authWorkCanadaInput.value = profileData.authWorkCanada || '';
        if (authWorkUKInput) authWorkUKInput.value = profileData.authWorkUK || '';
        if (sponsorshipInput) sponsorshipInput.value = profileData.sponsorship || '';
        if (disabilityInput) disabilityInput.value = profileData.disability || '';
        if (lgbtqInput) lgbtqInput.value = profileData.lgbtq || '';
        if (genderInput) genderInput.value = profileData.gender || '';
        if (veteranInput) veteranInput.value = profileData.veteran || '';

        editingProfileId = profileData.id || null;
    }

    function closeProfileModal() {
        if (profileModal) profileModal.style.display = 'none';
        if (profileForm) profileForm.reset();
        editingProfileId = null;
    }

    // --- Event Listeners for Modal ---
    if (closeButton) {
        closeButton.addEventListener('click', closeProfileModal);
    }
    if (cancelButton) {
        cancelButton.addEventListener('click', closeProfileModal);
    }
    if (profileModal) {
        window.addEventListener('click', (event) => {
            if (event.target === profileModal) {
                closeProfileModal();
            }
        });
    }

    // --- Handle Profile Form Submission ---
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Collect Personal Info data
            const profileName = profileNameInput.value.trim();
            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();
            const emailAddress = emailAddressInput.value.trim();
            const dateOfBirth = dateOfBirthInput.value;
            const phoneNumber = phoneNumberInput.value.trim();
            const location = locationInput.value.trim();
            const addressLine1 = addressLine1Input.value.trim();
            const addressLine2 = addressLine2Input.value.trim();
            const addressLine3 = addressLine3Input.value.trim();
            const postalCode = postalCodeInput.value.trim();

            // NEW: Collect EEO field values
            const ethnicity = ethnicityInput.value;
            const authWorkUS = authWorkUSInput.value;
            const authWorkCanada = authWorkCanadaInput.value;
            const authWorkUK = authWorkUKInput.value;
            const sponsorship = sponsorshipInput.value;
            const disability = disabilityInput.value;
            const lgbtq = lgbtqInput.value;
            const gender = genderInput.value;
            const veteran = veteranInput.value;


            if (!profileName || !firstName || !lastName || !emailAddress) {
                alert('Profile Name, First Name, Last Name, and Email Address are required.');
                return;
            }

            chrome.storage.local.get(['userProfiles', 'defaultProfileId'], function(result) {
                let userProfiles = result.userProfiles || [];
                let defaultProfileId = result.defaultProfileId || null;
                let currentProfile = {};

                if (editingProfileId) {
                    const index = userProfiles.findIndex(p => p.id === editingProfileId);
                    if (index !== -1) {
                        currentProfile = userProfiles[index];
                    }
                } else {
                    currentProfile.id = Date.now().toString();
                }

                // Update Personal Info data
                currentProfile.name = profileName;
                currentProfile.fullName = `${firstName} ${lastName}`;
                currentProfile.email = emailAddress;
                currentProfile.dateOfBirth = dateOfBirth;
                currentProfile.phoneNumber = phoneNumber;
                currentProfile.location = location;
                currentProfile.addressLine1 = addressLine1;
                currentProfile.addressLine2 = addressLine2;
                currentProfile.addressLine3 = addressLine3;
                currentProfile.postalCode = postalCode;
                currentProfile.isDefault = currentProfile.isDefault || false;

                // NEW: Update EEO data fields in the profile object
                currentProfile.ethnicity = ethnicity;
                currentProfile.authWorkUS = authWorkUS;
                currentProfile.authWorkCanada = authWorkCanada;
                currentProfile.authWorkUK = authWorkUK;
                currentProfile.sponsorship = sponsorship;
                currentProfile.disability = disability;
                currentProfile.lgbtq = lgbtq;
                currentProfile.gender = gender;
                currentProfile.veteran = veteran;


                // Initialize empty arrays/objects for other fields if they don't exist
                currentProfile.resume = currentProfile.resume || null;
                currentProfile.workExperience = currentProfile.workExperience || [];
                currentProfile.education = currentProfile.education || [];
                currentProfile.projects = currentProfile.projects || [];
                currentProfile.links = currentProfile.links || { linkedin: '', github: '', portfolio: '', other: '' };
                currentProfile.skills = currentProfile.skills || [];
                currentProfile.languages = currentProfile.languages || [];


                if (!editingProfileId) {
                    userProfiles.push(currentProfile);
                } else {
                    const index = userProfiles.findIndex(p => p.id === editingProfileId);
                    if (index !== -1) {
                        userProfiles[index] = currentProfile;
                    }
                }

                if (!defaultProfileId && userProfiles.length > 0) {
                    userProfiles[0].isDefault = true;
                    defaultProfileId = userProfiles[0].id;
                } else if (defaultProfileId && !userProfiles.some(p => p.id === defaultProfileId)) {
                    if (userProfiles.length > 0) {
                        userProfiles[0].isDefault = true;
                        defaultProfileId = userProfiles[0].id;
                    } else {
                        defaultProfileId = null;
                    }
                }

                chrome.storage.local.set({
                    userProfiles: userProfiles,
                    defaultProfileId: defaultProfileId
                }, function() {
                    if (chrome.runtime.lastError) {
                        console.error("Error saving profile:", chrome.runtime.lastError);
                        alert('Error saving profile: ' + chrome.runtime.lastError.message);
                    } else {
                        alert(`Profile "${profileName}" saved successfully!`);
                        closeProfileModal();

                        if (currentPage === 'first_user_dashboard.html') {
                            window.location.href = 'dashboard.html';
                        } else {
                            displayProfiles();
                        }
                    }
                });
            });
        });
    }


    // --- Dashboard Specific Logic ---
    if (currentPage === 'first_user_dashboard.html') {
        const addProfileNavItem = document.querySelector('.nav-links .nav-item.active');
        if (addProfileNavItem && addProfileNavItem.textContent.includes('Add Profile')) {
            addProfileNavItem.addEventListener('click', (e) => {
                e.preventDefault();
                openProfileModal();
            });
        }

        const editIconSmall = document.querySelector('.edit-icon-small');
        if (editIconSmall) {
            editIconSmall.addEventListener('click', (e) => {
                e.preventDefault();
                openProfileModal();
            });
        }

        const profileUtilInfo = document.querySelector('.profile-sections .section-card.profile-util-info p');
        if (profileUtilInfo) {
            profileUtilInfo.textContent = 'Welcome! Please create your first profile to get started with autofill. Click the "Add Profile" link in the navigation bar or the pencil icon.';
        }

    } else if (currentPage === 'dashboard.html') {
        console.log('Loading full dashboard.html');
        displayProfiles();
        setupDashboardListeners();
    }


    // --- Profile Display and Update Functions for dashboard.html ---
    function displayProfiles() {
        chrome.storage.local.get(['userProfiles', 'defaultProfileId'], function(result) {
            const userProfiles = result.userProfiles || [];
            const defaultProfileId = result.defaultProfileId;

            // Select elements to update in dashboard.html
            const profileSummaryName = document.querySelector('.profile-summary h3');
            const userAvatarLarge = document.querySelector('.profile-summary .avatar-large');
            const resumeFileNameSpan = document.querySelector('.resume-info span');
            const linkedinLinkElement = document.querySelector('.link-item .icon-box.linkedin + div a');
            const githubLinkElement = document.querySelector('.link-item .icon-box.github + div p');
            const portfolioLinkElement = document.querySelector('.link-item .icon-box.portfolio + div p');
            const otherLinkElement = document.querySelector('.link-item .icon-box.other + div p');
            const skillsGrid = document.querySelector('.skills-grid');
            const languagesGrid = document.querySelector('.languages-grid');
            const profileUtilInfo = document.querySelector('.profile-sections .section-card.profile-util-info p');
            const profileSummarySmallEditIcon = document.querySelector('.profile-summary .edit-icon-small');

            // Personal Info display elements
            const displayFirstName = document.getElementById('displayFirstName');
            const displayLastName = document.getElementById('displayLastName');
            const displayEmail = document.getElementById('displayEmail');
            const displayDateOfBirth = document.getElementById('displayDateOfBirth');
            const displayPhoneNumber = document.getElementById('displayPhoneNumber');
            const displayLocation = document.getElementById('displayLocation');
            const displayAddress1 = document.getElementById('displayAddress1');
            const displayAddress2 = document.getElementById('displayAddress2');
            const displayAddress3 = document.getElementById('displayAddress3');
            const displayPostalCode = document.getElementById('displayPostalCode');
            const personalInfoEditIcon = document.querySelector('.personal-info-edit-icon');

            // NEW: EEO display elements
            const displayEthnicity = document.getElementById('displayEthnicity');
            const displayAuthWorkUS = document.getElementById('displayAuthWorkUS');
            const displayAuthWorkCanada = document.getElementById('displayAuthWorkCanada');
            const displayAuthWorkUK = document.getElementById('displayAuthWorkUK');
            const displaySponsorship = document.getElementById('displaySponsorship');
            const displayDisability = document.getElementById('displayDisability');
            const displayLGBTQ = document.getElementById('displayLGBTQ');
            const displayGender = document.getElementById('displayGender');
            const displayVeteran = document.getElementById('displayVeteran');
            const employmentInfoEditIcon = document.querySelector('.employment-info-edit-icon');


            if (userProfiles.length > 0) {
                const defaultProfile = userProfiles.find(p => p.id === defaultProfileId) || userProfiles[0];

                if (profileSummaryName) profileSummaryName.textContent = defaultProfile.fullName || 'No Name Set';
                if (userAvatarLarge) userAvatarLarge.textContent = defaultProfile.fullName ? defaultProfile.fullName.substring(0, 2).toUpperCase() : 'NP';

                // Populate Personal Info section
                if (displayFirstName) displayFirstName.textContent = defaultProfile.fullName ? defaultProfile.fullName.split(' ')[0] : '--';
                if (displayLastName) displayLastName.textContent = defaultProfile.fullName ? defaultProfile.fullName.split(' ').slice(1).join(' ') : '--';
                if (displayEmail) displayEmail.textContent = defaultProfile.email || '--';
                if (displayDateOfBirth) displayDateOfBirth.textContent = defaultProfile.dateOfBirth || '--';
                if (displayPhoneNumber) displayPhoneNumber.textContent = defaultProfile.phoneNumber || '--';
                if (displayLocation) displayLocation.textContent = defaultProfile.location || '--';
                if (displayAddress1) displayAddress1.textContent = defaultProfile.addressLine1 || '--';
                if (displayAddress2) displayAddress2.textContent = defaultProfile.addressLine2 || '--';
                if (displayAddress3) displayAddress3.textContent = defaultProfile.addressLine3 || '--';
                if (displayPostalCode) displayPostalCode.textContent = defaultProfile.postalCode || '--';

                if (personalInfoEditIcon) {
                    personalInfoEditIcon.onclick = () => openProfileModal(defaultProfile);
                }

                // NEW: Populate EEO section
                if (displayEthnicity) displayEthnicity.textContent = defaultProfile.ethnicity || '--';
                if (displayAuthWorkUS) displayAuthWorkUS.textContent = defaultProfile.authWorkUS || '--';
                if (displayAuthWorkCanada) displayAuthWorkCanada.textContent = defaultProfile.authWorkCanada || '--';
                if (displayAuthWorkUK) displayAuthWorkUK.textContent = defaultProfile.authWorkUK || '--';
                if (displaySponsorship) displaySponsorship.textContent = defaultProfile.sponsorship || '--';
                if (displayDisability) displayDisability.textContent = defaultProfile.disability || '--';
                if (displayLGBTQ) displayLGBTQ.textContent = defaultProfile.lgbtq || '--';
                if (displayGender) displayGender.textContent = defaultProfile.gender || '--';
                if (displayVeteran) displayVeteran.textContent = defaultProfile.veteran || '--';

                // Set up edit listener for the NEW Employment Info section's pencil icon
                if (employmentInfoEditIcon) {
                    employmentInfoEditIcon.onclick = () => openProfileModal(defaultProfile);
                }


                if (resumeFileNameSpan) resumeFileNameSpan.textContent = defaultProfile.resume ? defaultProfile.resume.name : 'No Resume Uploaded';

                if (linkedinLinkElement) {
                    linkedinLinkElement.textContent = defaultProfile.links?.linkedin || '--';
                    linkedinLinkElement.href = defaultProfile.links?.linkedin ? defaultProfile.links.linkedin.startsWith('http') ? defaultProfile.links.linkedin : `https://${defaultProfile.links.linkedin}` : '#';
                }
                if (githubLinkElement) githubLinkElement.textContent = defaultProfile.links?.github || '--';
                if (portfolioLinkElement) portfolioLinkElement.textContent = defaultProfile.links?.portfolio || '--';
                if (otherLinkElement) otherLinkElement.textContent = defaultProfile.links?.other || '--';

                if (skillsGrid) {
                    skillsGrid.innerHTML = '';
                    (defaultProfile.skills || []).forEach(skill => {
                        const span = document.createElement('span');
                        span.className = 'skill-tag';
                        span.innerHTML = `<i class="fas fa-check"></i> ${skill}`;
                        skillsGrid.appendChild(span);
                    });
                }
                if (languagesGrid) {
                    languagesGrid.innerHTML = '';
                    (defaultProfile.languages || []).forEach(lang => {
                        const span = document.createElement('span');
                        span.className = 'language-tag';
                        span.textContent = lang;
                        languagesGrid.appendChild(span);
                    });
                }

                if (profileUtilInfo) {
                    profileUtilInfo.textContent = 'Your Simplify profile is used directly to autofill your job applications!';
                }

                if (profileSummarySmallEditIcon) {
                    profileSummarySmallEditIcon.onclick = () => openProfileModal(defaultProfile);
                }


            } else {
                // This case handles if dashboard.html is loaded but no profiles exist (e.g., manually navigated)
                if (profileSummaryName) profileSummaryName.textContent = 'No Profile';
                if (userAvatarLarge) userAvatarLarge.textContent = 'NP';
                if (profileUtilInfo) profileUtilInfo.textContent = 'No profiles found. Please create one to get started!';

                // Also clear the new personal info section if no profile
                if (displayFirstName) displayFirstName.textContent = '--';
                if (displayLastName) displayLastName.textContent = '--';
                if (displayEmail) displayEmail.textContent = '--';
                if (displayDateOfBirth) displayDateOfBirth.textContent = '--';
                if (displayPhoneNumber) displayPhoneNumber.textContent = '--';
                if (displayLocation) displayLocation.textContent = '--';
                if (displayAddress1) displayAddress1.textContent = '--';
                if (displayAddress2) displayAddress2.textContent = '--';
                if (displayAddress3) displayAddress3.textContent = '--';
                if (displayPostalCode) displayPostalCode.textContent = '--';

                // NEW: Clear EEO section if no profile
                if (displayEthnicity) displayEthnicity.textContent = '--';
                if (displayAuthWorkUS) displayAuthWorkUS.textContent = '--';
                if (displayAuthWorkCanada) displayAuthWorkCanada.textContent = '--';
                if (displayAuthWorkUK) displayAuthWorkUK.textContent = '--';
                if (displaySponsorship) displaySponsorship.textContent = '--';
                if (displayDisability) displayDisability.textContent = '--';
                if (displayLGBTQ) displayLGBTQ.textContent = '--';
                if (displayGender) displayGender.textContent = '--';
                if (displayVeteran) displayVeteran.textContent = '--';


                window.location.href = 'first_user_dashboard.html';
            }
        });
    }

    function setupDashboardListeners() {
        const addProfileNavItem = document.querySelector('.navbar-left .nav-links .nav-item');
        if (addProfileNavItem && addProfileNavItem.textContent.includes('Add Profile')) {
            addProfileNavItem.addEventListener('click', (e) => {
                e.preventDefault();
                openProfileModal();
            });
        }
        const resumeEditIcon = document.querySelector('.section-card .section-header .edit-icon:not(.personal-info-edit-icon):not(.employment-info-edit-icon)');
        if (resumeEditIcon) {
            resumeEditIcon.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Resume editing functionality will open here!');
            });
        }
    }
});