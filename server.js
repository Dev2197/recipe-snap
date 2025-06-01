const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");
const { spawn } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
fs.ensureDirSync(uploadsDir);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Utility function to run Python scripts
const runPythonScript = (scriptPath, args = []) => {
  return new Promise((resolve, reject) => {
    // Try different Python commands in order of preference
    const pythonCommands = ["python", "python3", "py"];
    let attempts = 0;

    const tryPython = (command) => {
      const python = spawn(command, [scriptPath, ...args]);
      let output = "";
      let error = "";

      python.stdout.on("data", (data) => {
        output += data.toString();
      });

      python.stderr.on("data", (data) => {
        error += data.toString();
      });

      python.on("close", (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            resolve({ output: output.trim(), success: true });
          }
        } else {
          attempts++;
          if (attempts < pythonCommands.length) {
            // Try next Python command
            tryPython(pythonCommands[attempts]);
          } else {
            reject(
              new Error(
                `Python script failed after trying all commands. Last error: ${
                  error || "Unknown error"
                }`
              )
            );
          }
        }
      });

      python.on("error", (err) => {
        attempts++;
        if (attempts < pythonCommands.length) {
          // Try next Python command
          tryPython(pythonCommands[attempts]);
        } else {
          reject(new Error(`Failed to spawn Python process: ${err.message}`));
        }
      });
    };

    tryPython(pythonCommands[0]);
  });
};

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "RecipeSnap AI Cooking Assistant API",
    version: "1.0.0",
    endpoints: {
      upload: "POST /api/upload",
      analyze: "POST /api/analyze",
      recipe: "POST /api/recipe",
    },
  });
});

// Upload image endpoint
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze image endpoint (caption + object detection)
app.post("/api/analyze", async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      console.error("No filename provided in analyze request");
      return res.status(400).json({ error: "No filename provided" });
    }

    const imagePath = path.join(uploadsDir, filename);
    console.log(`Analyzing image: ${imagePath}`);

    if (!fs.existsSync(imagePath)) {
      console.error(`Image file not found: ${imagePath}`);
      return res.status(404).json({ error: "Image file not found" });
    }

    console.log("Starting image captioning...");
    // Run image captioning
    const captionResult = await runPythonScript(
      path.join(__dirname, "ai_scripts", "image_captioning.py"),
      [imagePath]
    );
    console.log("Image captioning completed:", captionResult);

    console.log("Starting object detection...");
    // Run object detection
    const detectionResult = await runPythonScript(
      path.join(__dirname, "ai_scripts", "object_detection.py"),
      [imagePath]
    );
    console.log("Object detection completed:", detectionResult);

    const response = {
      success: true,
      caption: captionResult.caption || captionResult.output,
      ingredients: detectionResult.ingredients || [],
      detections: detectionResult.detections || [],
    };

    console.log("Sending analysis response:", response);
    res.json(response);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: error.message,
      details: "Check server logs for more information",
    });
  }
});

// Generate recipe endpoint
app.post("/api/recipe", async (req, res) => {
  try {
    const { ingredients, caption } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "No ingredients provided" });
    }

    console.log("Starting recipe generation with ingredients:", ingredients);
    console.log("Caption context:", caption);

    // Run recipe generation with extended timeout (5 minutes for Ollama)
    const recipeResult = await runPythonScript(
      path.join(__dirname, "ai_scripts", "recipe_generation.py"),
      [JSON.stringify(ingredients), caption || ""]
    );

    console.log("Recipe generation completed successfully", recipeResult);

    res.json({
      success: true,
      recipe: recipeResult.recipe || recipeResult.output,
    });
  } catch (error) {
    console.error("Recipe generation error:", error);

    res.status(500).json({
      error: error.message,
      details:
        "If the issue persists, check that Ollama is running with the mistral:7b-instruct model",
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" });
    }
  }
  res.status(500).json({ error: error.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 RecipeSnap API Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}`);
});
