/**
 * AtelierAI — Camera Capture Module
 * Handles device camera access via MediaDevices API
 */

const CameraCapture = (() => {
  let stream = null;
  let videoElement = null;
  let canvasElement = null;
  let capturedImage = null;

  /**
   * Open device camera and show preview in a video element
   * @param {string} videoElementId - ID of the <video> element
   * @param {object} options - { facingMode: 'user' | 'environment' }
   */
  async function openCamera(videoElementId, options = {}) {
    const video = document.getElementById(videoElementId);
    if (!video) {
      throw new Error(`Video element #${videoElementId} not found`);
    }

    videoElement = video;
    const facingMode = options.facingMode || 'environment';

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      video.srcObject = stream;
      video.play();
      video.style.display = 'block';

      return true;
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        throw new Error('Camera access denied. Please allow camera permissions.');
      } else if (err.name === 'NotFoundError') {
        throw new Error('No camera found on this device.');
      } else {
        throw new Error(`Camera error: ${err.message}`);
      }
    }
  }

  /**
   * Capture a photo from the video stream
   * @param {string} canvasId - ID of the canvas element to draw the capture onto
   * @returns {string} - Data URL of captured image
   */
  function capturePhoto(canvasId) {
    if (!videoElement) {
      throw new Error('Camera not open. Call openCamera() first.');
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      throw new Error(`Canvas element #${canvasId} not found`);
    }

    canvasElement = canvas;

    // Set canvas size to match video
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    capturedImage = canvas.toDataURL('image/png');

    // Hide video, show captured image
    videoElement.style.display = 'none';
    canvas.style.display = 'block';

    return capturedImage;
  }

  /**
   * Close the camera and release resources
   */
  function closeCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }

    if (videoElement) {
      videoElement.srcObject = null;
      videoElement.style.display = 'none';
    }

    videoElement = null;
  }

  /**
   * Convert a data URL to a File object
   * @param {string} dataUrl - Data URL of the image
   * @param {string} filename - Filename for the file
   * @returns {File} - File object ready for upload
   */
  function dataURLtoFile(dataUrl, filename = 'drawing.png') {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Get the captured image as a File object
   */
  function getCapturedImageFile(filename = 'drawing.png') {
    if (!capturedImage) return null;
    return dataURLtoFile(capturedImage, filename);
  }

  /**
   * Get the captured image as a data URL
   */
  function getCapturedImageDataURL() {
    return capturedImage;
  }

  /**
   * Reset the capture state
   */
  function reset() {
    capturedImage = null;
    if (canvasElement) {
      const ctx = canvasElement.getContext('2d');
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasElement.style.display = 'none';
    }
  }

  /**
   * Check if camera is available on this device
   */
  async function isCameraAvailable() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return false;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }

  return {
    openCamera,
    capturePhoto,
    closeCamera,
    dataURLtoFile,
    getCapturedImageFile,
    getCapturedImageDataURL,
    reset,
    isCameraAvailable
  };
})();