import React, { useEffect } from "react";
import axios from "axios";

const AnalysisResults = ({
  imageData,
  onAnalysisComplete,
  onError,
  setLoading,
  analysisInProgress,
}) => {
  useEffect(() => {
    if (imageData && !analysisInProgress.current) {
      analyzeImage();
    }
  }, [imageData]);

  const analyzeImage = async () => {
    if (!imageData || !imageData.file) {
      onError("No image data available");
      return;
    }

    // Prevent duplicate calls
    if (analysisInProgress.current) {
      return;
    }

    analysisInProgress.current = true;
    setLoading(true);

    try {
      // First, upload the image
      const formData = new FormData();
      formData.append("image", imageData.file);

      const uploadResponse = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 seconds
      });

      if (!uploadResponse.data.success) {
        throw new Error("Failed to upload image");
      }

      const filename = uploadResponse.data.filename;

      // Then, analyze the uploaded image
      const analysisResponse = await axios.post(
        "/api/analyze",
        {
          filename: filename,
        },
        {
          timeout: 120000, // 2 minutes for AI processing
        }
      );

      if (analysisResponse.data.success) {
        onAnalysisComplete(analysisResponse.data);
      } else {
        throw new Error(analysisResponse.data.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);

      let errorMessage = "Failed to analyze image";

      if (error.response) {
        // Server responded with error
        errorMessage =
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.code === "ECONNABORTED") {
        // Timeout
        errorMessage =
          "Analysis is taking too long. Please try with a smaller image.";
      } else {
        errorMessage = error.message;
      }

      analysisInProgress.current = false; // Reset flag on error
      onError(errorMessage);
    }
  };

  // This component doesn't render anything visible - it just handles the API calls
  return null;
};

export default AnalysisResults;
