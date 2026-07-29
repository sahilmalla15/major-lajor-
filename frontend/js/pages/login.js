'use strict';

document.addEventListener('DOMContentLoaded', function() {
    Auth.redirectIfLoggedIn();

    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('loginError');
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        UI.hideError(errorDiv);
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Signing In...';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const result = await Auth.login(username, password);
        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            UI.showError(errorDiv, result.error);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    });
});