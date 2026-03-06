export function stopCameraStream(webcamRef) {
  try {
    const video = webcamRef?.current?.video;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  } catch (_) {}
}
