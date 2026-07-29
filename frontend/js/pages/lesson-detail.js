'use strict';

document.addEventListener('DOMContentLoaded', function() {
    Auth.redirectIfNotLoggedIn();

    var urlParams = new URLSearchParams(window.location.search);
    var lessonId = urlParams.get('id');

    if (!lessonId) {
        UI.showToast('No lesson specified.', 'error');
        var lessonContent = document.getElementById('lessonContent');
        if (lessonContent) {
            lessonContent.innerHTML = '<p class="empty-state">No lesson ID provided. Please go back and select a lesson.</p>';
        }
        return;
    }

    var lessonContent = document.getElementById('lessonContent');
    var loadingEl = document.getElementById('loadingIndicator');
    var lessonTitle = document.getElementById('lessonTitle');
    var lessonText = document.getElementById('lessonText');
    var estimatedTime = document.getElementById('estimatedTime');
    var lessonDifficulty = document.getElementById('lessonDifficulty');
    var breadcrumbModule = document.getElementById('breadcrumbModule');
    var breadcrumbLesson = document.getElementById('breadcrumbLesson');
    var markCompleteBtn = document.getElementById('markCompleteBtn');
    var nextLessonBtn = document.getElementById('nextLessonBtn');
    var animationCard = document.getElementById('animationCard');
    var relatedExercises = document.getElementById('relatedExercises');

    if (loadingEl) loadingEl.style.display = 'block';

    loadLesson();

    async function loadLesson() {
        try {
            var lesson = await API.getLesson(parseInt(lessonId, 10));
            if (loadingEl) loadingEl.style.display = 'none';

            if (!lesson) {
                if (lessonContent) {
                    lessonContent.innerHTML = '<p class="empty-state">Lesson not found.</p>';
                }
                return;
            }

            renderLesson(lesson);
        } catch (err) {
            if (loadingEl) loadingEl.style.display = 'none';
            UI.showToast('Failed to load lesson.', 'error');
            if (lessonContent) {
                lessonContent.innerHTML = '<p class="empty-state">Could not load lesson data.</p>';
            }
        }
    }

    function renderLesson(lesson) {
        // Breadcrumb
        if (breadcrumbModule) breadcrumbModule.textContent = lesson.module_name || '';
        if (breadcrumbLesson) breadcrumbLesson.textContent = lesson.title || '';

        // Title
        if (lessonTitle) lessonTitle.textContent = lesson.title || 'Untitled Lesson';

        // Time
        if (estimatedTime) estimatedTime.textContent = lesson.estimated_time || lesson.duration || 'N/A';

        // Difficulty
        var difficulty = lesson.difficulty || 'beginner';
        if (lessonDifficulty) {
            lessonDifficulty.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        }

        // Content: split by double newlines into paragraphs
        var contentHtml = '';
        if (lesson.content) {
            var paragraphs = lesson.content.split(/\n\n+/);
            contentHtml = paragraphs.map(function(p) {
                var trimmed = p.trim();
                if (!trimmed) return '';
                // Detect image markers like ![alt](url)
                trimmed = trimmed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="lesson-image">');
                // Detect links
                trimmed = trimmed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
                return '<p>' + trimmed + '</p>';
            }).join('');
        }
        if (lessonText) lessonText.innerHTML = contentHtml || '<p>No content available.</p>';

        // Show lesson content
        if (lessonContent) lessonContent.style.display = 'block';

        // Related exercises
        renderRelatedExercises(lesson.related_exercises || []);

        // Mark as Complete button
        if (markCompleteBtn) {
            markCompleteBtn.style.display = 'inline-block';
            markCompleteBtn.onclick = async function() {
                this.disabled = true;
                this.textContent = 'Recording...';
                try {
                    await API.recordActivity({
                        type: 'lesson_completed',
                        lesson_id: lesson.id || lessonId,
                        lesson_title: lesson.title
                    });
                    UI.showToast('Lesson marked as complete!', 'success');
                    this.textContent = 'Completed';
                    this.classList.add('btn--completed');
                } catch (err) {
                    UI.showToast('Failed to record completion.', 'error');
                    this.disabled = false;
                    this.textContent = 'Mark as Complete';
                }
            };
        }

        // Next Lesson button
        if (nextLessonBtn && lesson.next_lesson_id) {
            nextLessonBtn.style.display = 'inline-block';
            nextLessonBtn.onclick = function() {
                location.href = 'lesson-detail.html?id=' + lesson.next_lesson_id;
            };
        } else if (nextLessonBtn) {
            nextLessonBtn.style.display = 'none';
        }

        // Animation card (View in Drawing Lab)
        if (animationCard) {
            if (lesson.has_demo) {
                animationCard.style.display = 'block';
                var animBtn = animationCard.querySelector('.btn');
                if (animBtn) {
                    animBtn.onclick = function() {
                        location.href = 'drawing-lab.html?exercise=' + encodeURIComponent(lesson.title || '');
                    };
                }
            } else {
                animationCard.style.display = 'none';
            }
        }
    }

    function renderRelatedExercises(exercises) {
        if (!relatedExercises) return;
        if (!exercises || exercises.length === 0) {
            relatedExercises.style.display = 'none';
            return;
        }

        relatedExercises.style.display = 'block';
        relatedExercises.innerHTML =
            exercises.map(function(ex) {
                return '<a href="exercises.html" class="exercise-list__item">' +
                    UI.escapeHtml(ex.title || 'Exercise') +
                    ' <span class="badge badge-' + (ex.difficulty || 'beginner') + '">' +
                    UI.escapeHtml(ex.difficulty) + '</span>' +
                    '</a>';
            }).join('');
    }
});