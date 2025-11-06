"""
FastAPI backend for chest X-ray classification with Grad-CAM visualization.
Uses DenseNet-121 with 14-class multi-label classification for NIH ChestX-ray14.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
import numpy as np
import io
import base64
from typing import List
import cv2

app = FastAPI(title="Chest X-Ray Classifier API")

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NIH ChestX-ray14 labels
LABELS = [
    "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration",
    "Mass", "Nodule", "Pneumonia", "Pneumothorax",
    "Consolidation", "Edema", "Emphysema", "Fibrosis",
    "Pleural_Thickening", "Hernia"
]

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Load model
def create_model():
    """Create DenseNet-121 with ImageNet weights and 14-class head."""
    model = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)
    num_features = model.classifier.in_features
    model.classifier = nn.Linear(num_features, 14)
    model = model.to(device)
    model.eval()
    return model

model = create_model()

# Grad-CAM setup
target_layer = model.features[-1]
cam = GradCAM(model=model, target_layers=[target_layer])


def preprocess_image(image: Image.Image) -> tuple[torch.Tensor, np.ndarray]:
    """Preprocess image for model and return both tensor and RGB array."""
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize for display
    image_resized = image.resize((224, 224))
    rgb_img = np.array(image_resized) / 255.0
    
    # Transform for model
    input_tensor = transform(image_resized).unsqueeze(0).to(device)
    
    return input_tensor, rgb_img


def generate_gradcam(input_tensor: torch.Tensor, rgb_img: np.ndarray, target_class: int) -> str:
    """Generate Grad-CAM heatmap and return as base64 PNG."""
    # Generate CAM
    targets = [torch.nn.modules.activation.Sigmoid()(target_class)]
    grayscale_cam = cam(input_tensor=input_tensor, targets=None)
    grayscale_cam = grayscale_cam[0, :]
    
    # Overlay on image
    visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)
    
    # Convert to PNG base64
    _, buffer = cv2.imencode('.png', cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR))
    png_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return png_base64


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "healthy", "model": "DenseNet-121", "labels": len(LABELS)}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict chest X-ray findings with Grad-CAM visualization.
    
    Args:
        file: Uploaded image file (JPEG, PNG)
    
    Returns:
        JSON with labels, scores, top prediction, and heatmap
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read and preprocess image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        input_tensor, rgb_img = preprocess_image(image)
        
        # Get predictions
        with torch.no_grad():
            logits = model(input_tensor)
            scores = torch.sigmoid(logits).cpu().numpy()[0]
        
        # Find top prediction
        top_idx = int(np.argmax(scores))
        top_label = LABELS[top_idx]
        top_score = float(scores[top_idx])
        
        # Generate Grad-CAM for top prediction
        heatmap_base64 = generate_gradcam(input_tensor, rgb_img, top_idx)
        
        # Prepare response
        return {
            "labels": LABELS,
            "scores": [float(s) for s in scores],
            "top_label": top_label,
            "top_score": top_score,
            "heatmap_png_base64": heatmap_base64
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
