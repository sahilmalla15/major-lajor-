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
    var submissionPreview = document.getElementById('submissionPreview');
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
    var currentDemoId = null;
    var drawingCanvas = null;
    var animationPlayer = null;
    var capturedImageBlob = null;
    var uploadedImageBlob = null;

    // --- Tab Switching ---
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            var target = this.dataset.tab;
            tabs.forEach(function(t) { t.classList.remove('active', 'tab-btn--active'); });
            this.classList.add('active');
            tabSections.forEach(function(s) {
                s.style.display = s.id === 'tab-' + target ? 'block' : 'none';
            });
        });
    });

    // Activate default tab (Watch)
    var defaultTab = document.querySelector('.tab-btn[data-tab="watch"]');
    if (defaultTab) defaultTab.click();

    // --- Watch & Learn Tab ---
    // Populate demo selector from CanvasDraw demonstrations
    if (demoSelect && CanvasDraw && CanvasDraw.DEMONSTRATIONS) {
        var demos = Object.values(CanvasDraw.DEMONSTRATIONS);
        demos.forEach(function(demo) {
            if (demo && demo.id && demo.title) {
                var opt = document.createElement('option');
                opt.value = demo.id;
                opt.textContent = demo.title;
                demoSelect.appendChild(opt);
            }
        });
        // Auto-load first demo
        if (demoSelect.options.length > 1) {
            loadDemo(demoSelect.value);
        }
    }

    demoSelect?.addEventListener('change', function() {
        var demoId = this.value;
        if (!demoId) return;
        loadDemo(demoId);
    });

    playPauseBtn?.addEventListener('click', function() {
        if (!animationPlayer) return;
        if (animationPlayer.isPlaying) {
            animationPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        } else {
            animationPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
    });

    stopBtn?.addEventListener('click', function() {
        if (!animationPlayer) return;
        animationPlayer.stop();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        if (stepIndicator) {
            var stepInfo = animationPlayer.getCurrentStep();
            stepIndicator.textContent = 'Step 0 / ' + (stepInfo ? stepInfo.total : 0);
        }
    });

    speedSelect?.addEventListener('change', function() {
        var speed = parseFloat(this.value);
        if (animationPlayer) animationPlayer.setSpeed(speed);
    });

    function loadDemo(demoId) {
        currentDemoId = demoId;
        if (!CanvasDraw || !CanvasDraw.AnimationPlayer) {
            UI.showToast('Animation player not available.', 'error');
            return;
        }

        // Clean up previous player
        if (animationPlayer) {
            animationPlayer.stop();
        }

        animationPlayer = new CanvasDraw.AnimationPlayer('animationCanvas');
        var loaded = animationPlayer.load(demoId);
        if (loaded) {
            animationPlayer.onStepChange = function(stepInfo) {
                if (stepIndicator && stepInfo) {
                    stepIndicator.textContent = 'Step ' + (stepInfo.index + 1) + ' / ' + stepInfo.total;
                }
            };
            animationPlayer.onComplete = function() {
                UI.showToast('Drawing complete!', 'success');
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            };
            if (stepIndicator) {
                var totalSteps = (CanvasDraw.DEMONSTRATIONS[demoId]?.steps || []).length;
                stepIndicator.textContent = 'Step 0 / ' + totalSteps;
            }
            animationPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        } else {
            UI.showToast('Could not load demonstration.', 'error');
        }
    }

    // --- Try It Yourself Tab ---
    function initDrawingCanvas() {
        if (!CanvasDraw || !CanvasDraw.DrawingCanvas) return;
        if (drawingCanvas) return;
        drawingCanvas = new CanvasDraw.DrawingCanvas('drawCanvas');
    }

    // Initialize when Try It tab is shown
    document.querySelector('.tab-btn[data-tab="draw"]')?.addEventListener('click', function() {
        setTimeout(initDrawingCanvas, 100);
    });

    penTool?.addEventListener('click', function() {
        if (!drawingCanvas) return;
        drawingCanvas.setTool('pen');
        penTool.classList.add('active');
        eraserTool.classList.remove('active');
    });

    eraserTool?.addEventListener('click', function() {
        if (!drawingCanvas) return;
        drawingCanvas.setTool('eraser');
        eraserTool.classList.add('active');
        penTool.classList.remove('active');
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
        if (!drawingCanvas || !currentDemoId) return;
        var demoData = CanvasDraw.DEMONSTRATIONS[currentDemoId];
        if (demoData && demoData.referenceImage) {
            drawingCanvas.setReferenceImage(this.checked ? demoData.referenceImage : null);
        }
    });

    // --- Submit & Evaluate Tab ---
    uploadArea?.addEventListener('click', function() {
        fileInput?.click();
    });

    uploadArea?.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea?.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });

    uploadArea?.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        var file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    });

    fileInput?.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (file) handleFileSelect(file);
    });

    function handleFileSelect(file) {
        if (!file) return;
        uploadedImageBlob = file;
        capturedImageBlob = null;
        if (submissionPreview) submissionPreview.style.display = 'block';
        var reader = new FileReader();
        reader.onload = function(ev) {
            if (previewImage) previewImage.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    openCameraBtn?.addEventListener('click', function() {
        if (typeof CameraCapture === 'undefined') {
            UI.showToast('Camera module not available.', 'error');
            return;
        }
        CameraCapture.openCamera('cameraFeed', { facingMode: 'environment' })
            .then(function() {
                if (videoPreview) videoPreview.style.display = 'block';
            })
            .catch(function(err) {
                UI.showToast(err.message || 'Could not access camera.', 'error');
            });
    });

    captureBtn?.addEventListener('click', function() {
        if (typeof CameraCapture === 'undefined') return;
        try {
            var dataUrl = CameraCapture.capturePhoto('captureCanvas');
            if (dataUrl) {
                capturedImageBlob = CameraCapture.getCapturedImageFile('sketch.png');
                uploadedImageBlob = null;
                if (previewImage) previewImage.src = dataUrl;
                if (submissionPreview) submissionPreview.style.display = 'block';
                if (videoPreview) videoPreview.style.display = 'none';
                CameraCapture.closeCamera();
            }
        } catch (err) {
            UI.showToast('Failed to capture photo.', 'error');
        }
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
            var ext = imageBlob.type === 'image/png' ? 'png' : 'jpg';
            formData.append('image', imageBlob, 'sketch.' + ext);
            formData.append('exercise', currentDemoId || 'General Sketch');

            var result = await API.evaluateSketch(formData);

            if (evaluationLoading) evaluationLoading.style.display = 'none';
            if (evaluationResults) evaluationResults.style.display = 'block';

            var score = result.score || 0;
            displayScore(score);
            renderList(strengthsList, result.strengths || []);
            renderList(improvementsList, result.improvements || []);
            if (detailedFeedback) {
                detailedFeedback.textContent = result.feedback || result.detailed_feedback || 'No detailed feedback available.';
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
        var circumference = 2 * Math.PI * 54;
        var offset = circumference - (normalizedScore / 100) * circumference;

        scoreValue.textContent = normalizedScore;

        scoreCircle.style.strokeDasharray = circumference;
        scoreCircle.style.strokeDashoffset = offset;
    }

    function renderList(container, items) {
        if (!container) return;
        if (!items || items.length === 0) {
            container.innerHTML = '<li class="list-item">None</li>';
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
        for (var i = 0; i < demoSelect.options.length; i++) {
            if (demoSelect.options[i].text.toLowerCase().indexOf(exerciseParam.toLowerCase()) !== -1 ||
                demoSelect.options[i].value.toLowerCase() === exerciseParam.toLowerCase()) {
                demoSelect.value = demoSelect.options[i].value;
                demoSelect.dispatchEvent(new Event('change'));
                var watchTab = document.querySelector('.tab-btn[data-tab="watch"]');
                if (watchTab) watchTab.click();
                break;
            }
        }
    }
});
