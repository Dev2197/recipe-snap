#!/usr/bin/env python3
"""
Image Captioning Script using VIT-GPT2 model
Generates descriptive captions for fridge images
"""

import sys
import json
import torch
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
from PIL import Image
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python image_captioning.py <image_path>"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    try:
        # Load model
        model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
        feature_extractor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
        tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
        
        # Process image
        image = Image.open(image_path).convert("RGB")
        pixel_values = feature_extractor(images=image, return_tensors="pt").pixel_values
        
        # Generate caption
        model.eval()
        with torch.no_grad():
            output_ids = model.generate(
                pixel_values,
                max_length=50,
                num_beams=1,
                do_sample=False,
                pad_token_id=tokenizer.eos_token_id
            )
        
        caption = tokenizer.decode(output_ids[0], skip_special_tokens=True)
        
        result = {
            "caption": caption,
            "success": True
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        result = {
            "error": str(e),
            "success": False,
            "caption": ""
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main() 