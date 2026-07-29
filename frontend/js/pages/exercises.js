'use strict';

document.addEventListener('DOMContentLoaded', function() {
    Auth.redirectIfNotLoggedIn();

    var exercisesData = [];
    var exercisesGrid = document.getElementById('exercisesGrid');
    var loadingEl = document.getElementById('loadingIndicator');
    var filterCategory = document.getElementById('categoryFilter');
    var filterDifficulty = document.getElementById('difficultyFilter');
    var exerciseModal = document.getElementById('exerciseModal');
    var modalExerciseTitle = document.getElementById('modalExerciseTitle');
    var modalExerciseDescription = document.getElementById('modalExerciseDescription');
    var modalExerciseDifficulty = document.getElementById('modalExerciseDifficulty');
    var modalExerciseCategory = document.getElementById('modalExerciseCategory');
    var modalExerciseInstructions = document.getElementById('modalExerciseInstructions');
    var modalClose = document.getElementById('exerciseModalClose');
    var applyFiltersBtn = document.getElementById('applyFiltersBtn');

    if (loadingEl) loadingEl.style.display = 'block';
    loadExercises();

    filterCategory?.addEventListener('change', applyFilters);
    filterDifficulty?.addEventListener('change', applyFilters);
    applyFiltersBtn?.addEventListener('click', applyFilters);

    modalClose?.addEventListener('click', function() {
        if (exerciseModal) exerciseModal.style.display = 'none';
    });

    exerciseModal?.addEventListener('click', function(e) {
        if (e.target === exerciseModal) {
            exerciseModal.style.display = 'none';
        }
    });

    // --- Functions ---

    async function loadExercises() {
        try {
            exercisesData = await API.getExercises() || [];
            if (loadingEl) loadingEl.style.display = 'none';
            renderExercises(exercisesData);
        } catch (err) {
            if (loadingEl) loadingEl.style.display = 'none';
            UI.showToast('Failed to load exercises.', 'error');
            if (exercisesGrid) {
                exercisesGrid.innerHTML = '<p class="empty-state">Could not load exercises.</p>';
            }
        }
    }

    async function applyFilters() {
        var params = {};
        if (filterCategory && filterCategory.value) {
            params.category = filterCategory.value;
        }
        if (filterDifficulty && filterDifficulty.value) {
            params.difficulty = filterDifficulty.value;
        }

        if (loadingEl) loadingEl.style.display = 'block';
        if (exercisesGrid) exercisesGrid.innerHTML = '';

        try {
            var filtered = await API.getExercises(params);
            exercisesData = filtered || [];
            if (loadingEl) loadingEl.style.display = 'none';
            renderExercises(exercisesData);
        } catch (err) {
            if (loadingEl) loadingEl.style.display = 'none';
            UI.showToast('Failed to filter exercises.', 'error');
        }
    }

    function renderExercises(exercises) {
        if (!exercisesGrid) return;

        if (!exercises || exercises.length === 0) {
            exercisesGrid.innerHTML = '<div class="empty-state">' +
                '<h3>No Exercises Found</h3>' +
                '<p>Try adjusting your filters or check back later for new exercises.</p>' +
                '</div>';
            return;
        }

        exercisesGrid.innerHTML = exercises.map(function(ex) {
            var desc = ex.description || '';
            if (desc.length > 100) desc = desc.substring(0, 100) + '...';

            return '<div class="exercise-card" data-exercise-id="' + ex.id + '">' +
                '<div class="exercise-card__header">' +
                '<h3>' + UI.escapeHtml(ex.title) + '</h3>' +
                '</div>' +
                '<div class="exercise-card__badges">' +
                '<span class="badge badge-' + (ex.difficulty || 'beginner') + '">' +
                UI.escapeHtml(ex.difficulty) + '</span>' +
                '<span class="badge badge-category">' +
                UI.escapeHtml(ex.category || 'General') + '</span>' +
                '</div>' +
                '<p>' + UI.escapeHtml(desc) + '</p>' +
                '<button class="btn btn-primary btn-sm btn-try-it" data-exercise=\'' +
                JSON.stringify(ex).replace(/'/g, '&#39;') + '\'>Try It</button>' +
                '</div>';
        }).join('');

        // Attach "Try It" buttons
        exercisesGrid.querySelectorAll('.btn-try-it').forEach(function(btn) {
            btn.addEventListener('click', function() {
                try {
                    var exData = JSON.parse(this.dataset.exercise);
                    openExerciseModal(exData);
                } catch (e) {
                    UI.showToast('Could not open exercise details.', 'error');
                }
            });
        });
    }

    function openExerciseModal(exercise) {
        if (!exerciseModal) return;

        if (modalExerciseTitle) modalExerciseTitle.textContent = exercise.title || '';
        if (modalExerciseDescription) modalExerciseDescription.textContent = exercise.description || '';
        if (modalExerciseDifficulty) {
            modalExerciseDifficulty.textContent = exercise.difficulty || 'beginner';
            modalExerciseDifficulty.className = 'badge badge-' + (exercise.difficulty || 'beginner');
        }
        if (modalExerciseCategory) modalExerciseCategory.textContent = exercise.category || 'General';
        if (modalExerciseInstructions) {
            modalExerciseInstructions.innerHTML = '<p>' + UI.escapeHtml(exercise.instructions || exercise.description || 'Follow the exercise prompts to practice your skills.') + '</p>';
        }

        var startBtn = document.getElementById('startExerciseBtn');
        if (startBtn) {
            startBtn.onclick = function() {
                location.href = 'drawing-lab.html?exercise=' + encodeURIComponent(exercise.title || '');
            };
        }

        exerciseModal.style.display = 'block';
    }
});