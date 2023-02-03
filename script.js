const video = document.getElementById("video");

Promise.all([
  faceapi.nets.ageGenderNet.loadFromUri("models"),
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startVideo);

//untuk memulai stream atau live video
function startVideo() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((cameraStream) => {
      video.srcObject = cameraStream;
    });
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize); //mengubah ukuran gambar masukan atau bingkai video ke ukuran yang diperlukan oleh model deteksi wajah

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, displaySize); //mengubah ukuran hasil deteksi agar sesuai dengan dimensi gambar masukan atau bingkai video.
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections); //kotak detector
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections); //garis2 membentuk wajah
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections); // memunculkan value ekspresi

    resizedDetections.forEach((detection) => {
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: Math.round(detection.age) + " year old " + detection.gender,
      });
      drawBox.draw(canvas);
    }); //memunculkan umur dan gender
  }, 200);
});
