'use strict';

document.addEventListener('DOMContentLoaded', function() {
    Auth.redirectIfNotLoggedIn();

    // --- Elements ---
    var tabs = document.querySelectorAll('.tab-btn');
    var tabSections = document.querySelectorAll('.tab-panel');

    // Watch tab elements
    var demoSelect = document.getElementById('demoSelect');
    var playPauseBtn = document.getElementById('playPauseBtn');
    var stopBtn = document.getElementById('stopBtn');
    var speedSelect = document.getElementById('speedSelect');
    var stepIndicator = document.getElementById('stepIndicator');

    // Try It tab elements
    var penTool = document.getElementById('penTool');
    var eraserTool = document.getElementById('eraserTool');
    var colorPicker = document.getElementById('colorPicker');
    var brushSize = document.getElementById('brushSize');
    var clearCanvas = document.getElementById('clearCanvas');
    var undoBtn = document.getElementById('undoBtn');
    var referenceToggle = document.getElementById('referenceToggle');

    // Submit tab elements
    var uploadArea = document.getElementById('uploadArea');
    var fileInput = document.getElementById('fileInput');
    var previewImage = document.getElementById('previewImage');
    var openCameraBtn = document.getElementById('openCameraBtn');
    var videoPreview = document.getElementById('videoPreview');
    var cameraFeed = document.getElementById('cameraFeed');
    var captureBtn = document.getElementById('captureBtn');
    var evaluateBtn = document.getElementById('evaluateBtn');
    var evaluationResults = document.getElementById('evaluationResults');
    var scoreCircle = document.getElementById('scoreCircle');
    var scoreValue = document.getElementById('scoreValue');
    var strengthsList = document.getElementById('strengthsList');
    var improvementsList = document.getElementById('improvementsList');
    var detailedFeedback = document.getElementById('detailedFeedback');
    var evaluationLoading = document.getElementById('evaluationLoading');

    // --- State ---
    var currentDemoName = null;
    var drawingCanvas = null;
    var animationPlayer = null;
    var capturedImageBlob = null;
    var uploadedImageBlob = null;

    // --- Tab Switching ---
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            var target = this.dataset.tab;
            tabs.forEach(function(t) { t.classList.remove('tab-btn--active'); });
            this.classList.add('tab-btn--active');
            tabSections.forEach(function(s) {
                s.style.display = s.id === 'tab-' + target ? 'block' : 'none';
            });
        });
    });

    // Activate default tab (Watch)
    var defaultTab = document.querySelector('.tab-btn[data-tab="watch"]');
    if (defaultTab) defaultTab.click();

    // --- Watch & Learn Tab ---
    // Populate demo selector
    if (demoSelect && CanvasDraw.DEMONSTRATIONS) {
        var demos = CanvasDraw.DEMONSTRATIONS;
        demos.forEach(function(demo) {
            var opt = document.createElement('option');
            opt.value = demo.name || demo.title || demo;
            opt.textContent = demo.title || demo.name || demo;
            demoSelect.appendChild(opt);
        });
    }

    demoSelect?.addEventListener('change', function() {
        var demoName = this.value;
        if (!demoName) return;
        loadDemo(demoName);
    });

    playPauseBtn?.addEventListener('click', function() {
        if (!animationPlayer) return;
        if (animationPlayer.isPlaying) {
            animationPlayer.pause();
            playPauseBtn.textContent = 'Play';
        } else {
            animationPlayer.play();
            playPauseBtn.textContent = 'Pause';
        }
    });

    stopBtn?.addEventListener('click', function() {
        if (!animationPlayer) return;
        animationPlayer.stop();
        playPauseBtn.textContent = 'Play';
        if (stepIndicator) stepIndicator.textContent = 'Step 0 / 0';
    });

    speedSelect?.addEventListener('change', function() {
        var speed = parseFloat(this.value);
        if (animationPlayer) animationPlayer.setSpeed(speed);
    });

    function loadDemo(demoName) {
        currentDemoName = demoName;
        var animCanvas = document.getElementById('animationCanvas');
        var animContainer = animCanvas ? animCanvas.parentElement : null;
        if (!animContainer) return;

        // Create AnimationPlayer
        if (animationPlayer) {
            animationPlayer.stop();
        }

        if (typeof AnimationPlayer !== 'undefined') {
            animationPlayer = new AnimationPlayer(animContainer);
            var demoData = CanvasDraw.getDemonstration(demoName);
            if (demoData) {
                animationPlayer.load(demoData);
                animationPlayer.onComplete = function() {
                    UI.showToast('Drawing complete!', 'success');
                    playPauseBtn.textContent = 'Play';
                };
                // Show step indicator update
                if (stepIndicator) {
                    stepIndicator.textContent = 'Step 0 / ' + (demoData.steps ? demoData.steps.length : '?');
                }
                if (playPauseBtn) playPauseBtn.textContent = 'Pause';
            }
        } else {
            UI.showToast('Animation player not available.', 'error');
        }
    }

    // --- Try It Yourself Tab ---
    function initDrawingCanvas() {
        var drawCanvas = document.getElementById('drawCanvas');
        var drawContainer = drawCanvas ? drawCanvas.parentElement : null;
        if (!drawContainer || typeof DrawingCanvas === 'undefined') return;
        if (drawingCanvas) return;

        drawingCanvas = new DrawingCanvas(drawContainer);
    }

    // Initialize when Try It tab is shown
    document.querySelector('.tab-btn[data-tab="draw"]')?.addEventListener('click', function() {
        setTimeout(initDrawingCanvas, 100);
    });

    penTool?.addEventListener('click', function() {
        if (!drawingCanvas) return;
        drawingCanvas.setTool('pen');
        penTool.classList.add('tool-btn--active');
        eraserTool.classList.remove('tool-btn--active');
    });

    eraserTool?.addEventListener('click', function() {
        if (!drawingCanvas) return;
        drawingCanvas.setTool('eraser');
        eraserTool.classList.add('tool-btn--active');
        penTool.classList.remove('tool-btn--active');
    });

    colorPicker?.addEventListener('input', function() {
        if (!drawingCanvas) return;
        drawingCanvas.setColor(this.value);
    });

    brushSize?.addEventListener('input', function() {
        var size = parseInt(this.value, 10);
        if (!drawingCanvas) return;
        drawingCanvas.setBrushSize(size);
    });

    clearCanvas?.addEventListener('click', function() {
        if (!drawingCanvas) return;
        drawingCanvas.clearCanvas();
    });

    undoBtn?.addEventListener('click', function() {
        if (!drawingCanvas) return;
        drawingCanvas.undo();
    });

    referenceToggle?.addEventListener('change', function() {
        if (!drawingCanvas || !currentDemoName) return;
        var demoData = CanvasDraw.getDemonstration(currentDemoName);
        if (demoData && demoData.referenceImage) {
            drawingCanvas.toggleReference(demoData.referenceImage);
        }
    });

    // --- Submit & Evaluate Tab ---
    uploadArea?.addEventListener('click', function() {
        fileInput?.click();
    });

    fileInput?.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        uploadedImageBlob = file;
        capturedImageBlob = null;
        var reader = new FileReader();
        reader.onload = function(ev) {
            if (previewImage) {
                previewImage.src = ev.target.result;
                previewImage.style.display = 'block';
            }
            if (cameraFeed) cameraFeed.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });

    openCameraBtn?.addEventListener('click', function() {
        if (typeof CameraCapture === 'undefined') {
            UI.showToast('Camera not available.', 'error');
            return;
        }
        CameraCapture.openCamera(function(stream) {
            if (cameraFeed) {
                cameraFeed.srcObject = stream;
                if (videoPreview) videoPreview.style.display = 'block';
                captureBtn.style.display = 'inline-block';
            }
        }, function(err) {
            UI.showToast('Could not access camera: ' + err, 'error');
        });
    });

    captureBtn?.addEventListener('click', function() {
        if (typeof CameraCapture === 'undefined') return;
        CameraCapture.capturePhoto(function(blob, dataUrl) {
            capturedImageBlob = blob;
            uploadedImageBlob = null;
            if (previewImage) {
                previewImage.src = dataUrl;
                previewImage.style.display = 'block';
            }
            if (videoPreview) videoPreview.style.display = 'none';
            captureBtn.style.display = 'none';
            // Stop camera stream
            if (cameraFeed && cameraFeed.srcObject) {
                cameraFeed.srcObject.getTracks().forEach(function(t) { t.stop(); });
            }
        });
    });

    evaluateBtn?.addEventListener('click', evaluateSketch);

    async function evaluateSketch() {
        var imageBlob = capturedImageBlob || uploadedImageBlob;
        if (!imageBlob) {
            UI.showToast('Please upload or capture an image first.', 'error');
            return;
        }

        if (evaluationLoading) evaluationLoading.style.display = 'block';
        if (evaluationResults) evaluationResults.style.display = 'none';
        evaluateBtn.disabled = true;
        evaluateBtn.textContent = 'Evaluating...';

        try {
            var formData = new FormData();
            formData.append('image', imageBlob, 'sketch.' + (imageBlob.type === 'image/png' ? 'png' : 'jpg'));
            formData.append('exercise', currentDemoName || 'General Sketch');

            var result = await API.evaluateSketch(formData);

            if (evaluationLoading) evaluationLoading.style.display = 'none';
            if (evaluationResults) evaluationResults.style.display = 'block';

            var score = result.score || 0;
            displayScore(score);
            renderList(strengthsList, result.strengths || []);
            renderList(improvementsList, result.improvements || []);
            if (detailedFeedback) {
                detailedFeedback.textContent = result.feedback || 'No detailed feedback available.';
            }
        } catch (err) {
            if (evaluationLoading) evaluationLoading.style.display = 'none';
            UI.showToast('Evaluation failed. Please try again.', 'error');
        } finally {
            evaluateBtn.disabled = false;
            evaluateBtn.textContent = 'Evaluate with AI';
        }
    }

    function displayScore(score) {
        if (!scoreCircle || !scoreValue) return;
        var normalizedScore = Math.min(100, Math.max(0, score));
        var circumference = 2 * Math.PI * 54; // r=54
        var offset = circumference - (normalizedScore / 100) * circumference;

        scoreValue.textContent = normalizedScore;

        var circle = scoreCircle.querySelector('.score-circle__progress');
        if (circle) {
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = offset;
        }
    }

    function renderList(container, items) {
        if (!container) return;
        if (!items || items.length === 0) {
            container.innerHTML = '<li class="list-item list-item--empty">None</li>';
            return;
        }
        container.innerHTML = items.map(function(item) {
            return '<li class="list-item">' + UI.escapeHtml(item) + '</li>';
        }).join('');
    }

    // --- URL Params: ?exercise=X ---
    var urlParams = new URLSearchParams(window.location.search);
    var exerciseParam = urlParams.get('exercise');
    if (exerciseParam && demoSelect) {
        // Try to select matching demo
        for (var i = 0; i < demoSelect.options.length; i++) {
            if (demoSelect.options[i].text.toLowerCase() === exerciseParam.toLowerCase() ||
                demoSelect.options[i].value.toLowerCase() === exerciseParam.toLowerCase()) {
                demoSelect.value = demoSelect.options[i].value;
                demoSelect.dispatchEvent(new Event('change'));
                // Switch to Watch tab
                var watchTab = document.querySelector('.tab-btn[data-tab="watch"]');
                if (watchTab) watchTab.click();
                break;
            }
        }
    }
});