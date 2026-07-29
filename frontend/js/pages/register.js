'use strict';

document.addEventListener('DOMContentLoaded', function() {
    Auth.redirectIfLoggedIn();

    const form = document.getElementById('registerForm');
    const errorDiv = document.getElementById('registerError');
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        UI.hideError(errorDiv);
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Creating Account...';

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const skillLevel = document.getElementById('skillLevel')?.value || 'beginner';
        const artisticGoals = document.getElementById('goals')?.value.trim() || '';

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            UI.showError(errorDiv, 'Please fill in all required fields.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            return;
        }

        if (password !== confirmPassword) {
            UI.showError(errorDiv, 'Passwords do not match.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            return;
        }

        if (password.length < 6) {
            UI.showError(errorDiv, 'Password must be at least 6 characters.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            return;
        }

        const result = await Auth.register({
            username,
            email,
            password,
            password2: password,
            skill_level: skillLevel,
            artistic_goals: artisticGoals
        });

        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            UI.showError(errorDiv, result.error);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    });
});