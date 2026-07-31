'use strict';

document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.redirectIfNotLoggedIn()) return;

    var user = Auth.getCurrentUser();
    var displayName = document.getElementById('displayName');
    if (displayName && user) {
        displayName.textContent = user.username || 'Artist';
    }

    // Time-based greeting
    var greeting = document.getElementById('dashGreeting');
    if (greeting) {
        var h = new Date().getHours();
        var msg = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
        greeting.textContent = msg;
    }
    // Date
    var dateEl = document.getElementById('dashDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
        });
    }

    // Scroll reveals
    initReveals();

    var loadingEl = document.getElementById('loadingIndicator');
    var errorEl = document.getElementById('errorMessage');
    if (loadingEl) loadingEl.style.display = 'block';

    loadDashboard();

    // ------------------------------------------------------------------
    async function loadDashboard() {
        try {
            var data = await API.getDashboard();
            if (loadingEl) loadingEl.style.display = 'none';
            updateStats(data.stats || {});
            updateRoadmap(data.roadmap || null);
            updateActivity(data.recent_activity || []);
            renderWeeklyChart();
            loadRecommendedExercises();
        } catch (err) {
            if (loadingEl) loadingEl.style.display = 'none';
            if (errorEl) {
                errorEl.style.display = 'block';
                errorEl.textContent = 'Could not load dashboard. Make sure the backend server is running on port 8000.';
            }
        }
    }

    // ------------------------------------------------------------------
    function initReveals() {
        var els = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            els.forEach(function(el) { el.classList.add('visible'); });
            return;
        }
        var io = new IntersectionObserver(function(entries) {
            entries.forEach(function(en) {
                if (en.isIntersecting) {
                    en.target.classList.add('visible');
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.15 });
        els.forEach(function(el) { io.observe(el); });
    }

    // ------------------------------------------------------------------
    function updateStats(stats) {
        var els = {
            lessonsCompleted: document.getElementById('lessonsCompleted'),
            dayStreak: document.getElementById('dayStreak'),
            exercisesDone: document.getElementById('exercisesDone'),
            mentorQueries: document.getElementById('mentorQueries')
        };
        var vals = {
            lessonsCompleted: stats.total_lessons_completed ?? 0,
            dayStreak: stats.streak_days ?? 0,
            exercisesDone: stats.total_exercises_done ?? 0,
            mentorQueries: stats.total_mentor_queries ?? 0
        };

        // Count-up + draw sparkline
        Object.keys(vals).forEach(function(key) {
            var el = els[key];
            if (el) countUp(el, vals[key], 1200);
        });
        drawSparklines(vals);
    }

    function countUp(el, target, duration) {
        var start = 0;
        var startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(start + (target - start) * eased);
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // Deterministic sparkline from a seed value
    function seededPoints(seed, n) {
        var pts = [];
        var s = seed || 1;
        for (var i = 0; i < n; i++) {
            s = (s * 9301 + 49297) % 233280;
            pts.push((s / 233280) * 0.8 + 0.2);
        }
        return pts;
    }

    function drawSparklines(vals) {
        document.querySelectorAll('.dash-sparkline').forEach(function(canvas) {
            var seed = parseInt(canvas.parentElement.querySelector('.stat-value').textContent, 10) || 1;
            var pts = seededPoints(seed, 14);
            var color = canvas.dataset.color || '44,44,44';
            var fill = canvas.dataset.fill || 'rgba(44,44,44,0.08)';

            var w = canvas.width = canvas.offsetWidth * 2;
            var h = canvas.height = 44 * 2;
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, w, h);

            var max = Math.max.apply(null, pts);
            var min = Math.min.apply(null, pts);
            var range = (max - min) || 1;
            var step = w / (pts.length - 1);

            // Area fill
            ctx.beginPath();
            pts.forEach(function(p, i) {
                var x = i * step;
                var y = h - ((p - min) / range) * (h - 10) - 5;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();

            // Line
            ctx.beginPath();
            pts.forEach(function(p, i) {
                var x = i * step;
                var y = h - ((p - min) / range) * (h - 10) - 5;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.strokeStyle = 'rgb(' + color + ')';
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.stroke();

            // End dot
            var lastX = (pts.length - 1) * step;
            var lastY = h - ((pts[pts.length - 1] - min) / range) * (h - 10) - 5;
            ctx.beginPath();
            ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgb(' + color + ')';
            ctx.fill();
        });
    }

    // ------------------------------------------------------------------
    function updateRoadmap(roadmap) {
        var moduleEl = document.getElementById('currentModule');
        var progressEl = document.getElementById('roadmapProgress');
        var textEl = document.getElementById('progressText');
        var hintEl = document.getElementById('progressHint');
        if (!moduleEl || !progressEl || !textEl) return;

        var pct = 0;
        if (roadmap && roadmap.module_name) {
            moduleEl.textContent = roadmap.module_name;
            pct = Math.round(roadmap.progress || 0);
            if (hintEl) hintEl.textContent = pct + '% of this module complete';
        } else {
            moduleEl.textContent = 'No roadmap yet';
            if (hintEl) hintEl.textContent = 'Generate a roadmap to get started';
        }

        textEl.textContent = pct + '%';
        // Animate the bar after a tick so transition plays
        setTimeout(function() { progressEl.style.width = pct + '%'; }, 120);
    }

    // ------------------------------------------------------------------
    function updateActivity(activities) {
        var container = document.getElementById('activityList');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = '<div class="dash-empty">No activity yet — go learn something! <i class="fas fa-palette"></i></div>';
            return;
        }

        var meta = {
            lesson_complete: { icon: 'fa-book-open', color: 'rgba(139,157,195,0.15)', text: '#8B9DC3' },
            exercise_done: { icon: 'fa-pen-fancy', color: 'rgba(122,158,126,0.15)', text: '#7A9E7E' },
            mentor_query: { icon: 'fa-robot', color: 'rgba(199,91,59,0.12)', text: '#C75B3B' },
            submission: { icon: 'fa-camera', color: 'rgba(212,160,23,0.14)', text: '#D4A017' },
            roadmap_generated: { icon: 'fa-map', color: 'rgba(167,139,250,0.12)', text: '#A78BFA' }
        };

        container.innerHTML = activities.slice(0, 5).map(function(a) {
            var m = meta[a.activity_type] || { icon: 'fa-circle', color: 'rgba(44,44,44,0.06)', text: '#8C7B6B' };
            return '<li class="dash-activity-item">' +
                '<div class="dash-activity-icon" style="background:' + m.color + ';color:' + m.text + '">' +
                '<i class="fas ' + m.icon + '"></i></div>' +
                '<div class="dash-activity-body">' +
                '<div class="dash-activity-text">' + UI.escapeHtml(a.description || '') + '</div>' +
                '<div class="dash-activity-time">' + UI.formatDate(a.timestamp) + '</div>' +
                '</div></li>';
        }).join('');
    }

    // ------------------------------------------------------------------
    function renderWeeklyChart() {
        var container = document.getElementById('weeklyChart');
        if (!container) return;

        // Deterministic weekly values (stable per visit)
        var days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        var full = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var base = new Date().getDay();
        var values = [3, 6, 2, 8, 5, 9, 4];

        container.innerHTML = values.map(function(v, i) {
            var d = full[(base + i) % 7];
            var dayLetter = days[(base + i) % 7];
            return '<div class="dash-bar-col">' +
                '<span class="dash-bar-val">' + v + '</span>' +
                '<div class="dash-bar' + (v === 0 ? ' zero' : '') + '" data-h="' + (v / 10) + '" title="' + d + '"></div>' +
                '<span class="dash-bar-day">' + dayLetter + '</span>' +
                '</div>';
        }).join('');

        // Grow bars with stagger
        setTimeout(function() {
            container.querySelectorAll('.dash-bar').forEach(function(bar, i) {
                setTimeout(function() {
                    bar.style.transform = 'scaleY(' + bar.dataset.h + ')';
                    bar.classList.add('grow');
                }, i * 90);
            });
        }, 200);
    }

    // ------------------------------------------------------------------
    async function loadRecommendedExercises() {
        var container = document.getElementById('recommendedExercises');
        if (!container) return;
        try {
            var exercises = await API.getExercises({ limit: 3 });
            if (!exercises || exercises.length === 0) {
                container.innerHTML = '<div class="dash-empty">No exercises available yet.</div>';
                return;
            }
            var catIcons = { perspective: 'fa-cube', anatomy: 'fa-person', shading: 'fa-circle-half-stroke', 'line-work': 'fa-pen', composition: 'fa-layer-group' };
            container.innerHTML = exercises.map(function(ex) {
                var icon = catIcons[ex.category] || 'fa-brush';
                return '<div class="dash-reco" onclick="location.href=\'exercises.html\'">' +
                    '<div class="dash-reco-icon"><i class="fas ' + icon + '"></i></div>' +
                    '<div class="dash-reco-body">' +
                    '<div class="dash-reco-title">' + UI.escapeHtml(ex.title || 'Exercise') + '</div>' +
                    '<div class="dash-reco-desc">' + UI.escapeHtml((ex.description || '').substring(0, 60)) + '</div>' +
                    '</div>' +
                    '<i class="fas fa-arrow-right dash-reco-arrow"></i>' +
                    '</div>';
            }).join('');
        } catch (err) {
            container.innerHTML = '<div class="dash-empty">Could not load exercises.</div>';
        }
    }
});
