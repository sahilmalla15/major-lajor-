'use strict';

document.addEventListener('DOMContentLoaded', function() {
    Auth.redirectIfNotLoggedIn();

    var profileData = null;
    var selectedInterests = [];
    var avatarFile = null;

    var profileAvatar = document.getElementById('profileAvatar');
    var profileForm = document.getElementById('profileForm');
    var avatarInitials = profileAvatar ? profileAvatar.querySelector('.avatar-initials') : null;
    var displayUsername = document.getElementById('displayUsername');
    var profileEmail = document.getElementById('profileEmail');
    var profileUsername = document.getElementById('profileUsername');
    var memberSince = document.getElementById('memberSince');
    var profileGoals = document.getElementById('profileGoals');
    var profileSkillLevel = document.getElementById('profileSkillLevel');
    var interestsTags = document.getElementById('interestsTags');
    var avatarUpload = document.getElementById('avatarUpload');
    var avatarInput = document.getElementById('avatarInput');
    var profileError = document.getElementById('profileError');
    var profileSuccess = document.getElementById('profileSuccess');

    loadProfile();

    // Avatar upload
    avatarUpload?.addEventListener('click', function() {
        if (avatarInput) avatarInput.click();
    });

    avatarInput?.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        avatarFile = file;
        var reader = new FileReader();
        reader.onload = function(ev) {
            if (profileAvatar) {
                profileAvatar.style.backgroundImage = 'url(' + ev.target.result + ')';
                profileAvatar.style.backgroundSize = 'cover';
                profileAvatar.style.backgroundPosition = 'center';
            }
            if (avatarInitials) avatarInitials.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });

    // Save changes
    profileForm?.addEventListener('submit', saveProfile);

    // --- Functions ---

    async function loadProfile() {
        try {
            profileData = await API.getProfile();

            if (!profileData) {
                if (profileError) {
                    profileError.textContent = 'Could not load profile.';
                    profileError.style.display = 'block';
                }
                return;
            }

            renderProfile(profileData);
        } catch (err) {
            UI.showToast('Failed to load profile.', 'error');
            if (profileError) {
                profileError.textContent = 'Error loading profile.';
                profileError.style.display = 'block';
            }
        }
    }

    function renderProfile(profile) {
        // Avatar
        var initials = getInitials(profile.username || profile.email || 'A');
        if (avatarInitials) avatarInitials.textContent = initials;

        if (profile.avatar_url && profileAvatar) {
            profileAvatar.style.backgroundImage = 'url(' + profile.avatar_url + ')';
            profileAvatar.style.backgroundSize = 'cover';
            profileAvatar.style.backgroundPosition = 'center';
            if (avatarInitials) avatarInitials.style.display = 'none';
        }

        // Display info (header)
        if (profileUsername) profileUsername.textContent = profile.username || 'Unknown';
        if (memberSince) {
            memberSince.textContent = profile.created_at
                ? UI.formatDate(profile.created_at)
                : '';
        }

        // Form fields
        if (displayUsername) displayUsername.value = profile.username || '';
        if (profileEmail) profileEmail.value = profile.email || '';
        if (profileGoals) profileGoals.value = profile.bio || '';

        // Interests
        selectedInterests = profile.interests || [];
        renderInterestTags(selectedInterests);
    }

    function renderInterestTags(interests) {
        if (!interestsTags) return;

        var allInterests = [
            'Perspective', 'Anatomy', 'Shading', 'Line Control',
            'Composition', 'Color Theory', 'Figure Drawing',
            'Portrait', 'Landscape', 'Digital Art', 'Sketching',
            'Watercolor', 'Oil Painting', 'Charcoal'
        ];

        interestsTags.innerHTML = allInterests.map(function(interest) {
            var isActive = interests.indexOf(interest) !== -1;
            return '<span class="interest-tag ' + (isActive ? 'interest-tag--active' : '') +
                '" data-interest="' + interest + '">' +
                UI.escapeHtml(interest) +
                '</span>';
        }).join('');

        // Click to toggle
        interestsTags.querySelectorAll('.interest-tag').forEach(function(tag) {
            tag.addEventListener('click', function() {
                var interest = this.dataset.interest;
                var idx = selectedInterests.indexOf(interest);
                if (idx === -1) {
                    selectedInterests.push(interest);
                    this.classList.add('interest-tag--active');
                } else {
                    selectedInterests.splice(idx, 1);
                    this.classList.remove('interest-tag--active');
                }
            });
        });
    }

    function getInitials(name) {
        if (!name) return '?';
        var parts = name.trim().split(/\s+/);
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    async function saveProfile(e) {
        if (e) e.preventDefault();
        var submitBtn = profileForm ? profileForm.querySelector('button[type="submit"]') : null;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
        }

        try {
            var data = {
                username: displayUsername?.value || '',
                email: profileEmail?.value || '',
                bio: profileGoals?.value || '',
                interests: selectedInterests
            };

            // If avatar file selected, append as base64 or use FormData
            if (avatarFile) {
                data.avatar = await fileToBase64(avatarFile);
            }

            var result = await API.updateProfile(data);
            if (result && result.success !== false) {
                UI.showToast('Profile updated successfully!', 'success');
                // Update displayed info
                if (profileUsername) profileUsername.textContent = data.username;
                if (profileEmail) profileEmail.value = data.email;
                if (avatarInitials) avatarInitials.textContent = getInitials(data.username);
                if (profileError) profileError.style.display = 'none';
                if (profileSuccess) {
                    profileSuccess.textContent = 'Profile saved successfully.';
                    profileSuccess.style.display = 'block';
                    setTimeout(function() { profileSuccess.style.display = 'none'; }, 3000);
                }
            } else {
                UI.showToast(result.error || 'Failed to update profile.', 'error');
            }
        } catch (err) {
            UI.showToast('Failed to update profile.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Changes';
            }
        }
    }

    function fileToBase64(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function() { resolve(reader.result); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

});