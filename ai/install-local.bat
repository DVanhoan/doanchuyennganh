@echo off
echo === Installing AI dependencies (local) ===

echo [1/3] Installing dlib-bin (prebuilt)...
pip install dlib-bin

echo [2/3] Installing face_recognition (skip dlib rebuild)...
pip install --no-deps face_recognition

echo [3/3] Installing remaining packages...
pip install flask flask-cors opencv-python numpy Pillow face-recognition-models

echo === Done ===
pause
