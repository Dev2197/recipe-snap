#!/usr/bin/env python3
"""
Recipe Generation Script using Mistral-7B-Instruct via Ollama
Generates cooking recipes based on detected ingredients
"""

import sys
import json
import requests

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python recipe_generation.py <ingredients_json> [caption]"}))
        sys.exit(1)
    
    try:
        # Parse ingredients
        ingredients_json = sys.argv[1]
        if ingredients_json.startswith('[') and ingredients_json.endswith(']'):
            try:
                ingredients = json.loads(ingredients_json)
            except json.JSONDecodeError:
                ingredients = ingredients_json.strip('[]').replace("'", "").replace('"', '').split(',')
                ingredients = [ing.strip() for ing in ingredients]
        else:
            ingredients = ingredients_json.split(',')
            ingredients = [ing.strip() for ing in ingredients]
        
        caption = sys.argv[2] if len(sys.argv) > 2 else ""
        ingredients_text = ", ".join(ingredients)
        
        prompt = f"""You are a professional chef. Create a recipe using these ingredients: {ingredients_text}

Additional context: {caption}

Provide:
1. Recipe name
2. Cooking time
3. Ingredients list
4. Step-by-step instructions
5. Serving suggestions

Recipe:"""

        # Call Ollama API
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral:7b-instruct",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 1000,
                    "top_p": 0.9
                }
            },
        )
        
        if response.status_code == 200:
            result = response.json()
            recipe_text = result.get("response", "No recipe generated")
            
            result = {
                "recipe": recipe_text,
                "success": True
            }
            print(json.dumps(result))
        else:
            raise Exception(f"Ollama API error: {response.status_code}")
            
    except Exception as e:
        result = {
            "error": str(e),
            "success": False
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main() 