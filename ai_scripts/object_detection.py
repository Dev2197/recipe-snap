#!/usr/bin/env python3
"""
DETR Object Detection - High Confidence Only
"""

import sys
import json
import torch
from transformers import DetrImageProcessor, DetrForObjectDetection
from PIL import Image
import warnings
import os

warnings.filterwarnings("ignore")

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python object_detection.py <image_path>"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Load model
        processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
        model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-50")
        
        # Process image
        image = Image.open(image_path).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")
        
        # Run inference
        model.eval()
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Get high-confidence detections (>90%)
        target_sizes = torch.tensor([image.size[::-1]])
        results = processor.post_process_object_detection(
            outputs, 
            target_sizes=target_sizes, 
            threshold=0.9
        )[0]
        
        # Extract detections
        detections = []
        detected_labels = []
        
        for score, label_id, box in zip(results["scores"], results["labels"], results["boxes"]):
            confidence = float(score.item())
            label_name = model.config.id2label[label_id.item()]
            
            detections.append({
                "label": label_name,
                "confidence": round(confidence, 3),
                "box": [round(float(x), 2) for x in box.tolist()]
            })
            
            detected_labels.append(label_name)
        
        result = {
            "detections": detections,
            "ingredients": list(set(detected_labels)),
            "success": True
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        result = {
            "error": str(e),
            "success": False,
            "detections": [],
            "ingredients": []
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main() 