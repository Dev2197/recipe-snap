import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  ChefHat,
  Sparkles,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";
import ImageUpload from "./components/ImageUpload";
import AnalysisResults from "./components/AnalysisResults";
import RecipeDisplay from "./components/RecipeDisplay";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const [currentStep, setCurrentStep] = useState("upload"); // upload, analyzing, results, recipe
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add ref to prevent duplicate API calls
  const analysisInProgress = useRef(false);
  const recipeInProgress = useRef(false);

  const handleImageUpload = (imageData) => {
    setUploadedImage(imageData);
    setCurrentStep("analyzing");
    setError(null);
    analysisInProgress.current = false; // Reset analysis state
  };

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
    setCurrentStep("results");
    setLoading(false);
    analysisInProgress.current = false; // Reset analysis state
  };

  const handleRecipeGenerated = (recipeData) => {
    setRecipe(recipeData);
    setCurrentStep("recipe");
    setLoading(false);
    recipeInProgress.current = false; // Reset recipe state
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
    analysisInProgress.current = false; // Reset analysis state
    recipeInProgress.current = false; // Reset recipe state
  };

  const resetApp = () => {
    setCurrentStep("upload");
    setUploadedImage(null);
    setAnalysisResults(null);
    setRecipe(null);
    setLoading(false);
    setError(null);
    analysisInProgress.current = false;
    recipeInProgress.current = false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-xl">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RecipeSnap</h1>
                <p className="text-sm text-gray-600">
                  AI Cooking Assistant from Your Fridge
                </p>
              </div>
            </div>
            {currentStep !== "upload" && (
              <button
                onClick={resetApp}
                className="btn-secondary flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>New Photo</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Something went wrong</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div
              className={`flex items-center space-x-2 ${
                currentStep === "upload"
                  ? "text-primary-600"
                  : ["analyzing", "results", "recipe"].includes(currentStep)
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "upload"
                    ? "bg-primary-100 border-2 border-primary-600"
                    : ["analyzing", "results", "recipe"].includes(currentStep)
                    ? "bg-green-100 border-2 border-green-600"
                    : "bg-gray-100 border-2 border-gray-300"
                }`}
              >
                <Upload className="h-4 w-4" />
              </div>
              <span className="font-medium">Upload</span>
            </div>

            <div
              className={`h-0.5 w-16 ${
                ["analyzing", "results", "recipe"].includes(currentStep)
                  ? "bg-green-600"
                  : "bg-gray-300"
              }`}
            />

            <div
              className={`flex items-center space-x-2 ${
                currentStep === "analyzing"
                  ? "text-primary-600"
                  : ["results", "recipe"].includes(currentStep)
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "analyzing"
                    ? "bg-primary-100 border-2 border-primary-600"
                    : ["results", "recipe"].includes(currentStep)
                    ? "bg-green-100 border-2 border-green-600"
                    : "bg-gray-100 border-2 border-gray-300"
                }`}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-medium">Analyze</span>
            </div>

            <div
              className={`h-0.5 w-16 ${
                ["recipe"].includes(currentStep)
                  ? "bg-green-600"
                  : "bg-gray-300"
              }`}
            />

            <div
              className={`flex items-center space-x-2 ${
                currentStep === "recipe" ? "text-green-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "recipe"
                    ? "bg-green-100 border-2 border-green-600"
                    : "bg-gray-100 border-2 border-gray-300"
                }`}
              >
                <ChefHat className="h-4 w-4" />
              </div>
              <span className="font-medium">Recipe</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === "upload" && (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Turn Your Fridge Into Delicious Meals
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Take a photo of your fridge ingredients and let our AI create
                  amazing recipes just for you. Our advanced image recognition
                  identifies your ingredients and suggests personalized recipes.
                </p>
              </div>
              <ImageUpload onImageUpload={handleImageUpload} />
            </div>
          )}

          {currentStep === "analyzing" && (
            <div className="text-center py-12">
              <LoadingSpinner />
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
                Analyzing Your Ingredients
              </h3>
              <p className="text-gray-600">
                Our AI is identifying ingredients and understanding what's in
                your fridge...
              </p>
              <AnalysisResults
                imageData={uploadedImage}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
                setLoading={setLoading}
                analysisInProgress={analysisInProgress}
              />
            </div>
          )}

          {currentStep === "results" && analysisResults && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Here's What We Found!
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                    Image Description
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {analysisResults.caption || "No description available"}
                  </p>
                </div>

                <div className="card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ChefHat className="h-5 w-5 text-green-500 mr-2" />
                    Detected Ingredients (
                    {analysisResults.ingredients?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {analysisResults.ingredients &&
                    analysisResults.ingredients.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.ingredients.map(
                          (ingredient, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {ingredient}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No ingredients detected. Try a clearer photo.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    console.log("Generate Recipe button clicked");
                    console.log(
                      "Current recipeInProgress:",
                      recipeInProgress.current
                    );
                    console.log(
                      "Available ingredients:",
                      analysisResults.ingredients
                    );

                    if (!recipeInProgress.current) {
                      console.log(
                        "Setting currentStep to recipe and loading to true"
                      );
                      setCurrentStep("recipe");
                      setLoading(true);
                    } else {
                      console.log("Recipe generation already in progress");
                    }
                  }}
                  disabled={
                    !analysisResults.ingredients ||
                    analysisResults.ingredients.length === 0 ||
                    recipeInProgress.current
                  }
                  className="btn-primary flex items-center space-x-2 mx-auto text-lg px-8 py-3"
                >
                  <ChefHat className="h-5 w-5" />
                  <span>Generate Recipe</span>
                </button>
              </div>
            </div>
          )}

          {/* Recipe Generation Component - Always available after analysis */}
          {analysisResults && (
            <RecipeDisplay
              ingredients={analysisResults.ingredients}
              caption={analysisResults.caption}
              onRecipeGenerated={handleRecipeGenerated}
              onError={handleError}
              shouldGenerate={currentStep === "recipe" && loading}
              setLoading={setLoading}
              recipeInProgress={recipeInProgress}
            />
          )}

          {currentStep === "recipe" && recipe && (
            <div className="card max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <ChefHat className="h-6 w-6 text-green-600 mr-3" />
                  Your Personalized Recipe
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Ready to cook</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Fresh ingredients</span>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {recipe.recipe}
                </div>
              </div>

              <div className="mt-6 flex justify-center space-x-4">
                <button onClick={resetApp} className="btn-secondary">
                  Try Another Photo
                </button>
                <button
                  onClick={() => {
                    if (!recipeInProgress.current) {
                      setCurrentStep("recipe");
                      setLoading(true);
                    }
                  }}
                  disabled={recipeInProgress.current}
                  className="btn-primary"
                >
                  Generate New Recipe
                </button>
              </div>
            </div>
          )}

          {currentStep === "recipe" && loading && (
            <div className="text-center py-12">
              <LoadingSpinner />
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
                Crafting Your Perfect Recipe
              </h3>
              <p className="text-gray-600">
                Our AI chef is creating a delicious recipe with your
                ingredients...
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Powered by AI • VIT-GPT2 • DETR ResNet-50 • Mistral-7B
            </p>
            <p className="text-sm">
              Transform your ingredients into culinary masterpieces
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
