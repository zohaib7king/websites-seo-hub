import io

import cv2
import insightface
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import Response
from insightface.app import FaceAnalysis

app = FastAPI(title="Remake Memory Face Swap", version="1.0.0")

face_app = None
swapper = None


def read_image(file_bytes: bytes) -> np.ndarray:
    arr = np.frombuffer(file_bytes, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
    return image


@app.on_event("startup")
def load_models() -> None:
    global face_app, swapper
    face_app = FaceAnalysis(name="buffalo_l")
    face_app.prepare(ctx_id=-1, det_size=(640, 640))
    swapper = insightface.model_zoo.get_model(
        "inswapper_128.onnx",
        download=True,
        download_zip=True,
    )


@app.get("/health")
def health():
    return {
        "ok": face_app is not None and swapper is not None,
        "engine": "insightface-inswapper",
        "paid": False,
    }


@app.post("/swap")
async def swap(
    target_image: UploadFile = File(...),
    swap_image: UploadFile = File(...),
):
    if face_app is None or swapper is None:
        raise HTTPException(status_code=503, detail="Face swap models are still loading")

    target = read_image(await target_image.read())
    source = read_image(await swap_image.read())

    target_faces = sorted(face_app.get(target), key=lambda face: face.bbox[0])
    source_faces = sorted(face_app.get(source), key=lambda face: face.bbox[0])

    if not target_faces:
        raise HTTPException(status_code=400, detail="No face found in the old photo")
    if not source_faces:
        raise HTTPException(status_code=400, detail="No face found in the new portrait")

    # Swap the left-most detected face first. For multi-person photos the API
    # chains swaps in left-to-right order from the Node service.
    result = target.copy()
    result = swapper.get(result, target_faces[0], source_faces[0], paste_back=True)

    ok, buf = cv2.imencode(".jpg", result, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to encode result image")

    return Response(content=buf.tobytes(), media_type="image/jpeg")
