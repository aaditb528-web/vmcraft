import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

app = FastAPI(title="VMCraft Snapshot Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SNAPSHOT_DIR = Path(__file__).parent / "snapshots"
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_BYTES = 256 * 1024 * 1024  # 256 MB safety cap


@app.get("/")
def root():
    return {"service": "vmcraft-backend", "status": "ok"}


@app.post("/upload")
async def upload_snapshot(file: UploadFile = File(...)):
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Snapshot too large")

    snapshot_id = uuid.uuid4().hex[:12]
    path = SNAPSHOT_DIR / f"{snapshot_id}.bin"
    with open(path, "wb") as f:
        f.write(contents)

    return {
        "id": snapshot_id,
        "size": len(contents),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/snapshot/{snapshot_id}")
def get_snapshot(snapshot_id: str):
    if not snapshot_id.isalnum() or len(snapshot_id) > 32:
        raise HTTPException(status_code=400, detail="Invalid id")

    path = SNAPSHOT_DIR / f"{snapshot_id}.bin"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Snapshot not found")

    return FileResponse(
        path,
        media_type="application/octet-stream",
        filename=f"vmcraft-{snapshot_id}.bin",
    )


@app.get("/snapshots")
def list_snapshots():
    results = []
    for entry in sorted(
        SNAPSHOT_DIR.glob("*.bin"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    ):
        results.append(
            {
                "id": entry.stem,
                "size": entry.stat().st_size,
                "created_at": datetime.fromtimestamp(
                    entry.stat().st_mtime, tz=timezone.utc
                ).isoformat(),
            }
        )
    return results


@app.delete("/snapshot/{snapshot_id}")
def delete_snapshot(snapshot_id: str):
    if not snapshot_id.isalnum() or len(snapshot_id) > 32:
        raise HTTPException(status_code=400, detail="Invalid id")

    path = SNAPSHOT_DIR / f"{snapshot_id}.bin"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Snapshot not found")
    path.unlink()
    return {"deleted": snapshot_id}