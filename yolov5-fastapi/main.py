from fastapi import FastAPI, File, Form
from segmentation import get_yolov5, get_image_from_bytes
from starlette.responses import Response
import io
from PIL import Image
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import uvicorn
import base64
import numpy as NumPy

model = get_yolov5()

def init_webhooks(base_url):
    # Update inbound traffic via APIs to use the public-facing ngrok URL
    pass

app = FastAPI(
    title="Custom YOLOV5 Machine Learning API",
    description="""Obtain object value out of image
                    and return image and json result""",
    version="0.0.1",
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    expose_headers=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

logger.info("API started successfully!")


@app.get('/notify/v1/health')
def get_health():
    """
    Usage on K8S
    readinessProbe:
        httpGet:
            path: /notify/v1/health
            port: 80
    livenessProbe:
        httpGet:
            path: /notify/v1/health
            port: 80
    :return:
        dict(msg='OK')
    """
    return dict(msg='OK')

def get_image_from_bytes(file: bytes) -> Image.Image:
    return Image.open(io.BytesIO(file))

class ImageData(BaseModel):
    image: str

@app.post("/object-to-json")
async def detect_food_return_json_result(image_data: ImageData):
    # print(image_data.image)
    # print(image_data)
    try:
        # image_as_bytes = str.encode(image_data.image)
        # img_recovered = base64.b64decode(image_as_bytes)
        
        # # Convert bytes to PIL Image
        # image_pil = Image.open(io.BytesIO(img_recovered))

        # print(image_pil)
        
        # # Convert PIL Image to NumPy array
        # image_np = NumPy.array(image_pil)
        image_np = get_image_from_bytes(base64.b64decode(image_data.image))

        # Process the image with YOLO model
        results = model(image_np)
        detect_res = results.pandas().xyxy[0].to_json(orient="records")  # JSON img1 predictions
        detect_res = json.loads(detect_res)
        return {"result": detect_res}
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return {"error": str(e)}


@app.post("/object-to-img")
async def detect_food_return_base64_img(file: bytes = File(...)):
    input_image = get_image_from_bytes(file)
    results = model(input_image)
    results.render()  # updates results.imgs with boxes and labels
    for img in results.imgs:
        bytes_io = io.BytesIO()
        img_base64 = Image.fromarray(img)
        img_base64.save(bytes_io, format="jpeg")
    return Response(content=bytes_io.getvalue(), media_type="image/jpeg")

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)