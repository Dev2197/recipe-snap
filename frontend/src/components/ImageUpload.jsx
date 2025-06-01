import React, { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";

const ImageUpload = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          file: file,
          preview: e.target.result,
          name: file.name,
        };
        setPreviewImage(imageData.preview);
        onImageUpload(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      setShowCamera(true);

      // Set video source after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Could not access camera. Please check permissions or use file upload."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", {
              type: "image/jpeg",
            });
            const imageData = {
              file: file,
              preview: canvas.toDataURL("image/jpeg", 0.8),
              name: "camera-capture.jpg",
            };
            setPreviewImage(imageData.preview);
            onImageUpload(imageData);
            stopCamera();
          }
        },
        "image/jpeg",
        0.8
      );
    }
  }, [stopCamera, onImageUpload]);

  const clearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {previewImage ? (
        <div className="card relative">
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full z-10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-4">
              Image uploaded successfully! Click analyze to continue.
            </p>
            <button onClick={clearImage} className="btn-secondary">
              Choose Different Image
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`card border-2 border-dashed transition-colors cursor-pointer ${
            dragActive
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-orange-600" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload Your Fridge Photo
            </h3>
            <p className="text-gray-600 mb-6">
              Drag and drop your image here, or click to browse
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                type="button"
                className="btn-primary flex items-center space-x-2"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-4 w-4" />
                <span>Choose File</span>
              </button>

              <span className="text-gray-400">or</span>

              <button
                type="button"
                className="btn-secondary flex items-center space-x-2"
                onClick={(e) => {
                  e.stopPropagation();
                  startCamera();
                }}
              >
                <Camera className="h-4 w-4" />
                <span>Take Photo</span>
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Supports JPG, PNG, GIF, WEBP (Max 10MB)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Take Photo</h3>
              <button
                onClick={stopCamera}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="flex justify-center space-x-4">
              <button onClick={stopCamera} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="btn-primary flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Capture Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-6 text-center">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Camera className="h-4 w-4 text-blue-500" />
            <span>Take a clear photo</span>
          </div>
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4 text-green-500" />
            <span>Good lighting helps</span>
          </div>
          <div className="flex items-center space-x-2">
            <Upload className="h-4 w-4 text-purple-500" />
            <span>Include all ingredients</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
