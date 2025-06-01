# RecipeSnap - AI Cooking Assistant

Turn your fridge ingredients into delicious recipes using AI image recognition and recipe generation.

## Models Used

- **Image Captioning**: `nlpconnect/vit-gpt2-image-captioning` (VIT-GPT2)
- **Object Detection**: `facebook/detr-resnet-50` (DETR ResNet-50)
- **Recipe Generation**: `mistralai/Mistral-7B-Instruct` (via Ollama)

## Setup

### Prerequisites

- Node.js 14+
- Python 3.8+
- Ollama

### Installation

1. **Clone and install dependencies**:

```bash
npm install
pip install -r requirements.txt
```

2. **Install and setup Ollama**:

```bash
# Install Ollama (visit https://ollama.ai)
ollama pull mistral:7b-instruct
ollama serve
```

3. **Start the application**:

```bash
# Windows Command Prompt
start.bat

# Windows PowerShell
./start.bat

# Mac/Linux - Run in separate terminals:
npm start                    # Backend (port 5000)
cd frontend && npm run dev   # Frontend (port 3000)

# Or create a simple start script for Mac/Linux:
# Terminal 1: npm start
# Terminal 2: cd frontend && npm run dev
```

## Usage

1. Open http://localhost:3000
2. Upload a photo of your fridge ingredients
3. AI analyzes the image to detect ingredients
4. Generate personalized recipes based on detected ingredients

## API Endpoints

- `POST /api/upload` - Upload image
- `POST /api/analyze` - Analyze image for ingredients
- `POST /api/recipe` - Generate recipe from ingredients

## Features

- Image captioning for context understanding
- Object detection with 90%+ confidence threshold
- AI-powered recipe generation using local Mistral model
- Modern responsive web interface
