import io
import re
from typing import Optional
from bs4 import BeautifulSoup
import httpx
from app.core.openai_client import get_openai_client


async def transcribe_audio_file(file_bytes: bytes, filename: str = "audio.wav") -> str:
    """Transcribes audio using OpenAI Whisper API or returns fallback note."""
    client = get_openai_client()
    if client:
        try:
            buffer = io.BytesIO(file_bytes)
            buffer.name = filename
            transcript = await client.audio.transcriptions.create(
                model="whisper-1",
                file=buffer
            )
            return transcript.text
        except Exception as e:
            print(f"Whisper API error: {e}")

    # Fallback simulated transcript for offline/demo use
    return (
        "Audio voice note transcribed: Discussing long-term memory architectures, "
        "temporal decay curves, and entity linking for personal archives."
    )


async def perform_vision_ocr(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Performs OCR and scene description using GPT-4o-mini Vision or fallback."""
    client = get_openai_client()
    if client:
        try:
            import base64
            b64_img = base64.b64encode(image_bytes).decode("utf-8")
            data_url = f"data:{mime_type};base64,{b64_img}"
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Carefully transcribe any visible handwritten or printed text in this image, followed by a 1-sentence description of the visual scene.",
                            },
                            {"type": "image_url", "image_url": {"url": data_url}},
                        ],
                    }
                ],
                max_tokens=300,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            print(f"Vision OCR error: {e}")

    return "Visual artifact: Preserved snapshot from memory vault."


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts plain text from PDF documents using PyMuPDF (fitz)."""
    try:
        import pymupdf
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
        extracted = []
        for page in doc:
            text = page.get_text()
            if text:
                extracted.append(text.strip())
        return "\n\n".join(extracted) if extracted else "Empty PDF document"
    except Exception as e:
        return f"PDF document preserved (Extraction notice: {e})"


async def scrape_url_content(url: str) -> dict:
    """Scrapes page title, description, and readable text from a URL."""
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(url, headers={"User-Agent": "ShadowMemoryBot/1.0"})
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                title = soup.title.string.strip() if soup.title and soup.title.string else url
                
                # Check meta description
                desc = ""
                meta_desc = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
                if meta_desc and meta_desc.get("content"):
                    desc = meta_desc["content"].strip()
                
                # Clean paragraphs
                paragraphs = [p.get_text().strip() for p in soup.find_all("p") if len(p.get_text().strip()) > 20]
                body_sample = " ".join(paragraphs[:5])

                return {
                    "title": title,
                    "description": desc,
                    "content": f"{title}\n\n{desc}\n\n{body_sample}".strip()
                }
    except Exception as e:
        print(f"URL scrape error: {e}")

    return {"title": url, "description": "", "content": f"Saved link: {url}"}
