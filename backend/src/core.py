
from pathlib import Path
import uuid
from fastapi import HTTPException, UploadFile
from src.path import UPLOADS_DIR


async def save_file(file: UploadFile) -> str:
    
    if not file.filename:
        raise HTTPException(400, "Uploaded file must have a filename")
    
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOADS_DIR / unique_filename

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    return unique_filename
    

