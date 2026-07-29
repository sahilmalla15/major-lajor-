'use strict';

document.addEventListener('DOMContentLoaded', function() {
    Auth.redirectIfNotLoggedIn();

    var loadingEl = document.getElementById('loadingIndicator');
    var totalLessonsEl = document.getElementById('totalLessons');
    var totalExercisesEl = document.getElementById('totalExercises');
    var totalQueriesEl = document.getElementById('totalQueries');
    var currentStreakEl = document.getElementById('currentStreak');
    var achievementsContainer = document.getElementById('badgeGrid');
    var activityTimeline = document.getElementById('progressActivityList');

    if (loadingEl) loadingEl.style.display = 'block';

    loadProgressData();

    async function loadProgressData() {
        try {
            var [dashboard, achievements] = await Promise.all([
                API.getDashboard(),
                API.getAchievements()
            ]);

            if (loadingEl) loadingEl.style.display = 'none';

            renderStats(dashboard.stats || {});
            renderLessonsChart(dashboard.lesson_history || generateSampleWeeklyData());
            renderSkillsChart(dashboard.skill_scores || {});
            renderAchievements(achievements || []);
            renderActivityTimeline(dashboard.recent_activity || []);
        } catch (err) {
            if (loadingEl) loadingEl.style.display = 'none';
            UI.showToast('Failed to load progress data.', 'error');
        }
    }

    function renderStats(stats) {
        if (totalLessonsEl) totalLessonsEl.textContent = stats.lessons_completed ?? 0;
        if (totalExercisesEl) totalExercisesEl.textContent = stats.exercises_done ?? 0;
        if (totalQueriesEl) totalQueriesEl.textContent = stats.mentor_queries ?? 0;
        if (currentStreakEl) currentStreakEl.textContent = stats.streak_days ?? 0;
    }

    function renderLessonsChart(lessonHistory) {
        var canvas = document.getElementById('lessonsChart');
        if (!canvas || typeof Chart === 'undefined') return;

        var ctx = canvas.getContext('2d');

        var labels = lessonHistory.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        var data = lessonHistory.data || [2, 3, 5, 4];

        var gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, '#f0a832');
        gradient.addColorStop(1, '#d97706');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lessons Completed',
                    data: data,
                    backgroundColor: gradient,
                    borderColor: '#d97706',
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }

    function renderSkillsChart(skillScores) {
        var canvas = document.getElementById('skillsChart');
        if (!canvas || typeof Chart === 'undefined') return;

        var ctx = canvas.getContext('2d');

        var defaultLabels = ['Perspective', 'Shading', 'Anatomy', 'Line Control', 'Composition'];
        var defaultColors = ['#f0a832', '#34d399', '#60a5fa', '#a78bfa', '#f87171'];

        var labels = defaultLabels;
        var data = defaultLabels.map(function(skill) {
            return skillScores[skill.toLowerCase().replace(' ', '_')] ||
                   skillScores[skill] ||
                   Math.floor(Math.random() * 40) + 30;
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: defaultColors,
                    borderWidth: 2,
                    borderColor: '#1a1a2e'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e0e0e0',
                            padding: 12
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    function renderAchievements(achievements) {
        if (!achievementsContainer) return;
        if (!achievements || achievements.length === 0) {
            achievementsContainer.innerHTML = '<p class="empty-state">No achievements yet. Start learning to earn badges!</p>';
            return;
        }

        achievementsContainer.innerHTML = achievements.map(function(ach) {
            var unlocked = ach.unlocked || ach.status === 'unlocked';
            var filterStyle = unlocked ? '' : 'style="filter: grayscale(1); opacity: 0.5;"';
            return '<div class="achievement-badge" ' + filterStyle + '>' +
                '<div class="achievement-badge__icon">' + (ach.icon || '&#9733;') + '</div>' +
                '<div class="achievement-name">' + UI.escapeHtml(ach.name || 'Achievement') + '</div>' +
                '<div class="achievement-description">' + UI.escapeHtml(ach.description || '') + '</div>' +
                '</div>';
        }).join('');
    }

    function renderActivityTimeline(activities) {
        if (!activityTimeline) return;
        if (!activities || activities.length === 0) {
            activityTimeline.innerHTML = '<p class="empty-state">No recent activity.</p>';
            return;
        }

        activityTimeline.innerHTML = activities.slice(0, 10).map(function(act) {
            return '<div class="timeline-item">' +
                '<div class="timeline-item__dot"></div>' +
                '<div class="timeline-item__content">' +
                '<p>' + UI.escapeHtml(act.description || '') + '</p>' +
                '<span class="timeline-item__time">' + UI.formatDate(act.created_at) + '</span>' +
                '</div>' +
                '</div>';
        }).join('');
    }

    function generateSampleWeeklyData() {
        return {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: [0, 0, 0, 0]
        };
    }
});