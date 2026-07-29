'use strict';

document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.redirectIfNotLoggedIn()) return;

    var user = Auth.getCurrentUser();
    var displayName = document.getElementById('displayName');
    if (displayName && user) {
        displayName.textContent = user.username || 'Artist';
    }

    var loadingEl = document.getElementById('loadingIndicator');
    var errorEl = document.getElementById('errorMessage');
    if (loadingEl) loadingEl.style.display = 'block';

    loadDashboard();

    async function loadDashboard() {
        try {
            var data = await API.getDashboard();
            if (loadingEl) loadingEl.style.display = 'none';
            updateStats(data.stats || {});
            updateRoadmap(data.roadmap || null);
            updateActivity(data.recent_activity || []);
            loadRecommendedExercises();
        } catch (err) {
            if (loadingEl) loadingEl.style.display = 'none';
            if (errorEl) {
                errorEl.style.display = 'block';
                errorEl.textContent = 'Could not load dashboard. Make sure the backend server is running on port 8000.';
            }
        }
    }

    function updateStats(stats) {
        var els = {
            lessonsCompleted: document.getElementById('lessonsCompleted'),
            dayStreak: document.getElementById('dayStreak'),
            exercisesDone: document.getElementById('exercisesDone'),
            mentorQueries: document.getElementById('mentorQueries')
        };
        if (els.lessonsCompleted) els.lessonsCompleted.textContent = stats.total_lessons_completed ?? 0;
        if (els.dayStreak) els.dayStreak.textContent = stats.streak_days ?? 0;
        if (els.exercisesDone) els.exercisesDone.textContent = stats.total_exercises_done ?? 0;
        if (els.mentorQueries) els.mentorQueries.textContent = stats.total_mentor_queries ?? 0;
    }

    function updateRoadmap(roadmap) {
        var moduleEl = document.getElementById('currentModule');
        var progressEl = document.getElementById('roadmapProgress');
        var textEl = document.getElementById('progressText');
        if (!moduleEl || !progressEl || !textEl) return;

        if (roadmap && roadmap.module_name) {
            var pct = Math.round(roadmap.progress || 0);
            moduleEl.textContent = roadmap.module_name;
            progressEl.style.width = pct + '%';
            textEl.textContent = pct + '% complete';
        } else {
            moduleEl.textContent = 'No roadmap yet';
            progressEl.style.width = '0%';
            textEl.textContent = 'Generate a roadmap to get started';
        }
    }

    function updateActivity(activities) {
        var container = document.getElementById('activityList');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = '<li class="activity-item">No recent activity. Start learning!</li>';
            return;
        }

        var icons = { lesson_complete: '📖', exercise_done: '✏️', mentor_query: '🤖', submission: '📸', roadmap_generated: '🗺️' };
        container.innerHTML = activities.slice(0, 5).map(function(a) {
            var icon = icons[a.activity_type] || '📌';
            return '<li class="activity-item">' + icon + ' ' +
                UI.escapeHtml(a.description || '') +
                ' <span style="color:var(--color-text-muted);font-size:12px">' + UI.formatDate(a.timestamp) + '</span></li>';
        }).join('');
    }

    async function loadRecommendedExercises() {
        var container = document.getElementById('recommendedExercises');
        if (!container) return;
        try {
            var exercises = await API.getExercises({ limit: 3 });
            if (!exercises || exercises.length === 0) {
                container.innerHTML = '<p style="color:var(--color-text-muted)">No exercises available yet.</p>';
                return;
            }
            container.innerHTML = exercises.map(function(ex) {
                return '<div class="card" style="cursor:pointer">' +
                    '<div class="card-header" style="border:none;margin-bottom:8px">' +
                    '<h4 style="font-size:1rem;margin:0">' + UI.escapeHtml(ex.title) + '</h4>' +
                    '<span class="badge badge-' + (ex.difficulty || 'beginner') + '">' + UI.escapeHtml(ex.difficulty || 'Beginner') + '</span>' +
                    '</div>' +
                    '<p style="font-size:0.875rem;color:var(--color-text-secondary);margin-bottom:12px">' +
                    UI.escapeHtml((ex.description || '').substring(0, 80)) + '</p>' +
                    '<a href="exercises.html" class="btn btn-sm btn-secondary">Try It</a>' +
                    '</div>';
            }).join('');
        } catch (err) {
            container.innerHTML = '<p style="color:var(--color-text-muted)">Could not load exercises.</p>';
        }
    }
});