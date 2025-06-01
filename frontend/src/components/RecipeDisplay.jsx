import React, { useEffect } from "react";
import axios from "axios";

const RecipeDisplay = ({
  ingredients,
  caption,
  onRecipeGenerated,
  onError,
  shouldGenerate,
  setLoading,
  recipeInProgress,
}) => {
  useEffect(() => {
    console.log("RecipeDisplay useEffect triggered");
    console.log("shouldGenerate:", shouldGenerate);
    console.log("ingredients:", ingredients);
    console.log("recipeInProgress.current:", recipeInProgress.current);

    if (shouldGenerate && ingredients && ingredients.length > 0) {
      if (!recipeInProgress.current) {
        console.log("Calling generateRecipe...");
        generateRecipe();
      } else {
        console.log("Recipe generation already in progress, skipping");
      }
    } else {
      console.log("Conditions not met for recipe generation");
    }
  }, [shouldGenerate, ingredients]);

  const generateRecipe = async () => {
    console.log("generateRecipe function called");

    if (!ingredients || ingredients.length === 0) {
      console.log("No ingredients available");
      onError("No ingredients available for recipe generation");
      return;
    }

    // Prevent duplicate calls
    if (recipeInProgress.current) {
      console.log("Recipe already in progress, returning");
      return;
    }

    console.log("Starting recipe generation API call");
    recipeInProgress.current = true;
    setLoading(true);

    try {
      console.log("Making POST request to /api/recipe");
      console.log("Payload:", { ingredients, caption: caption || "" });

      const response = await axios.post(
        "/api/recipe",
        {
          ingredients: ingredients,
          caption: caption || "",
        },
        // {
        //   timeout: 180000, // 3 minutes for recipe generation
        // }
      );

      console.log("Recipe API response:", response.data);

      if (response.data.success) {
        console.log("Recipe generation successful");
        onRecipeGenerated(response.data);
      } else {
        throw new Error(response.data.error || "Recipe generation failed");
      }
    } catch (error) {
      console.error("Recipe generation error:", error);

      let errorMessage = "Failed to generate recipe";

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
          "Recipe generation is taking too long. Please try again.";
      } else {
        errorMessage = error.message;
      }

      recipeInProgress.current = false; // Reset flag on error
      onError(errorMessage);
    }
  };

  // This component doesn't render anything visible - it just handles the API calls
  return null;
};

export default RecipeDisplay;
