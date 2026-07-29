'use strict';

document.addEventListener('DOMContentLoaded', function() {
    Auth.redirectIfNotLoggedIn();

    var roadmapData = null;
    var roadmapTimeline = document.getElementById('roadmapTimeline');
    var generateBtn = document.getElementById('generateRoadmapBtn');
    var generateModal = document.getElementById('generateModal');
    var modalGenerate = document.getElementById('modalGenerate');
    var cancelBtn = document.getElementById('modalCancel');
    var loadingEl = document.getElementById('loadingIndicator');
    var generateError = document.getElementById('generateError');

    if (loadingEl) loadingEl.style.display = 'block';
    loadRoadmap();

    generateBtn?.addEventListener('click', function() {
        if (generateModal) generateModal.style.display = 'block';
    });

    cancelBtn?.addEventListener('click', function() {
        if (generateModal) generateModal.style.display = 'none';
    });

    var modalCloseBtn = document.getElementById('modalClose');
    modalCloseBtn?.addEventListener('click', function() {
        if (generateModal) generateModal.style.display = 'none';
    });

    modalGenerate?.addEventListener('click', async function() {
        var skillLevel = document.getElementById('roadmapSkillLevel')?.value || 'beginner';
        var interestCheckboxes = document.querySelectorAll('#generateModal input[type="checkbox"]:checked');
        var interests = Array.from(interestCheckboxes).map(function(cb) { return cb.value; });

        modalGenerate.disabled = true;
        modalGenerate.innerHTML = '<span class="spinner"></span> Generating...';

        try {
            var result = await API.generateRoadmap({
                skill_level: skillLevel,
                interests: interests
            });
            if (result.success) {
                if (generateModal) generateModal.style.display = 'none';
                UI.showToast('Roadmap generated successfully!', 'success');
                loadRoadmap();
            } else {
                if (generateError) {
                    generateError.textContent = result.error || 'Failed to generate roadmap.';
                    generateError.style.display = 'block';
                } else {
                    UI.showToast(result.error || 'Failed to generate roadmap.', 'error');
                }
            }
        } catch (err) {
            UI.showToast('Failed to generate roadmap.', 'error');
        } finally {
            modalGenerate.disabled = false;
            modalGenerate.textContent = 'Generate Roadmap';
        }
    });

    // Close modal on overlay click
    generateModal?.addEventListener('click', function(e) {
        if (e.target === generateModal) {
            generateModal.style.display = 'none';
        }
    });

    // --- Functions ---

    async function loadRoadmap() {
        try {
            roadmapData = await API.getRoadmap();
            if (loadingEl) loadingEl.style.display = 'none';
            renderRoadmap();
        } catch (err) {
            if (loadingEl) loadingEl.style.display = 'none';
            UI.showToast('Failed to load roadmap.', 'error');
            if (roadmapTimeline) {
                roadmapTimeline.innerHTML = '<p class="empty-state">Could not load roadmap data.</p>';
            }
        }
    }

    function renderRoadmap() {
        if (!roadmapTimeline) return;

        if (!roadmapData || !roadmapData.items || roadmapData.items.length === 0) {
            roadmapTimeline.innerHTML = '<div class="empty-state">' +
                '<h3>No Roadmap Yet</h3>' +
                '<p>Generate a personalized learning roadmap tailored to your skill level and interests.</p>' +
                '<button id="emptyGenerateBtn" class="btn btn-primary">Generate Your Roadmap</button>' +
                '</div>';
            var emptyBtn = document.getElementById('emptyGenerateBtn');
            if (emptyBtn) {
                emptyBtn.addEventListener('click', function() {
                    if (generateModal) generateModal.style.display = 'block';
                });
            }
            return;
        }

        var items = roadmapData.items;
        roadmapTimeline.innerHTML = items.map(function(module, idx) {
            var statusBadge = module.status || 'locked';
            var progressPct = Math.round(module.progress || 0);
            var isCollapsed = idx !== 0; // first module expanded by default

            return '<div class="roadmap-module ' + (statusBadge === 'completed' ? 'roadmap-module--completed' : '') + '" data-module-id="' + module.id + '">' +
                '<div class="roadmap-module__header" data-toggle> ' +
                '<span class="badge badge-' + statusBadge + '">' + UI.escapeHtml(statusBadge) + '</span>' +
                '<h3>' + UI.escapeHtml(module.title || module.name || 'Module ' + (idx + 1)) + '</h3>' +
                '<div class="progress-bar"><div class="progress-bar-fill" style="width:' + progressPct + '%"></div></div>' +
                '<span class="roadmap-module__toggle">' + (isCollapsed ? '+' : '-') + '</span>' +
                '</div>' +
                '<div class="roadmap-module__lessons" style="display:' + (isCollapsed ? 'none' : 'block') + '">' +
                renderLessons(module.lessons || []) +
                '</div>' +
                '</div>';
        }).join('');

        // Toggle expand/collapse
        roadmapTimeline.querySelectorAll('.roadmap-module__header[data-toggle]').forEach(function(header) {
            header.addEventListener('click', function() {
                var lessonsEl = this.nextElementSibling;
                if (lessonsEl) {
                    var isVisible = lessonsEl.style.display !== 'none';
                    lessonsEl.style.display = isVisible ? 'none' : 'block';
                    var toggle = this.querySelector('.roadmap-module__toggle');
                    if (toggle) toggle.textContent = isVisible ? '+' : '-';
                }
            });
        });

        // Mark complete buttons
        roadmapTimeline.querySelectorAll('.btn-mark-complete').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                var lessonId = parseInt(this.dataset.lessonId, 10);
                if (!lessonId) return;
                this.disabled = true;
                this.textContent = 'Updating...';
                try {
                    await API.updateRoadmapItem(lessonId, { status: 'completed' });
                    UI.showToast('Lesson marked as complete!', 'success');
                    loadRoadmap(); // reload entire roadmap
                } catch (err) {
                    UI.showToast('Failed to update lesson.', 'error');
                    this.disabled = false;
                    this.textContent = 'Mark Complete';
                }
            });
        });
    }

    function renderLessons(lessons) {
        if (!lessons || lessons.length === 0) {
            return '<p class="empty-state">No lessons in this module yet.</p>';
        }
        return '<ul class="lesson-list">' + lessons.map(function(lesson) {
            var completedClass = lesson.status === 'completed' ? 'lesson--completed' : '';
            return '<li class="lesson-item ' + completedClass + '">' +
                '<span style="font-size:1.125rem;font-weight:600">' + UI.escapeHtml(lesson.title || 'Untitled Lesson') + '</span>' +
                (lesson.status !== 'completed'
                    ? '<button class="btn btn-sm btn-mark-complete" data-lesson-id="' + lesson.id + '">Mark Complete</button>'
                    : '<span class="lesson-checkmark">&#10003;</span>') +
                '</li>';
        }).join('') + '</ul>';
    }
});