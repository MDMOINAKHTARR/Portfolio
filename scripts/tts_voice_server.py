"""
Self-hosted zero-shot voice cloning TTS server for WADE (/api/dossier-voice -> CUSTOM_TTS_URL).
Run on a GPU machine (Hugging Face Spaces, Modal, RunPod, or local CUDA GPU):

  pip install fastapi uvicorn TTS torch
  # Place a clean 6-10s mono WAV reference clip at ./reference_voice.wav
  uvicorn scripts.tts_voice_server:app --host 0.0.0.0 --port 7860

Then set CUSTOM_TTS_URL=https://<your-gpu-host>/tts in Vercel Environment Variables.
"""

import base64
import io
import os
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from scipy.io.wavfile import write as write_wav
import numpy as np
from TTS.api import TTS

app = FastAPI(title="WADE Custom Voice Server")

REFERENCE_WAV = os.getenv("REFERENCE_WAV", "reference_voice.wav")
API_SECRET = os.getenv("CUSTOM_TTS_SECRET", "")

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)


class TtsRequest(BaseModel):
    text: str
    language: str = "en"


@app.post("/tts")
def synthesize(req: TtsRequest, authorization: str = Header(default="")):
    if API_SECRET and authorization != f"Bearer {API_SECRET}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not os.path.exists(REFERENCE_WAV):
        raise HTTPException(status_code=500, detail=f"Missing {REFERENCE_WAV}")

    wav = tts.tts(text=req.text, speaker_wav=REFERENCE_WAV, language=req.language)
    pcm = np.int16(np.clip(np.array(wav), -1.0, 1.0) * 32767)
    buf = io.BytesIO()
    write_wav(buf, 24000, pcm)
    return {
        "audioBase64": base64.b64encode(buf.getvalue()).decode("ascii"),
        "mimeType": "audio/wav",
    }
