import io
import re
import logging

logger = logging.getLogger("uvicorn.error")

def parse_pdf(file_content: bytes) -> str:
    """
    Multi-tier robust PDF text extraction:
    1. Try pdfplumber
    2. Fallback to pypdf (if available)
    3. Fallback to binary regex pattern extraction for non-standard or scanned PDF text streams
    """
    extracted_lines = []

    # Tier 1: pdfplumber
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    extracted_lines.append(page_text.strip())
        
        result_text = "\n".join(extracted_lines).strip()
        if len(result_text) > 30:
            return result_text
    except Exception as e:
        logger.warning(f"pdfplumber extraction failed: {str(e)}. Trying pypdf fallback.")

    # Tier 2: pypdf
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_content))
        pypdf_lines = []
        for page in reader.pages:
            t = page.extract_text()
            if t and t.strip():
                pypdf_lines.append(t.strip())
        result_text = "\n".join(pypdf_lines).strip()
        if len(result_text) > 30:
            return result_text
    except Exception as e:
        logger.warning(f"pypdf extraction failed or unavailable: {str(e)}. Trying regex stream fallback.")

    # Tier 3: Regex string extraction from binary stream
    try:
        pattern = re.compile(b'[a-zA-Z0-9\\s\\.,;:!\\?\\-\\@\\_\\(\\)\\[\\]\\{\\}/\\\\"\'\\&\\+\\#\\*\\=\\%\\<\\>]{4,}')
        text_runs = []
        for match in pattern.finditer(file_content):
            try:
                decoded = match.group(0).decode('utf-8', errors='ignore').strip()
                if decoded and len(re.sub(r'[\s\.\,\-_]+', '', decoded)) > 2:
                    text_runs.append(decoded)
            except Exception:
                pass

        extracted_text = "\n".join(text_runs)
        extracted_text = re.sub(r'\n+', '\n', extracted_text)
        extracted_text = re.sub(r'[ \t]+', ' ', extracted_text)
        
        if len(extracted_text.strip()) > 30:
            return extracted_text.strip()
    except Exception as e:
        logger.error(f"Regex stream fallback failed: {str(e)}")

    if extracted_lines:
        return "\n".join(extracted_lines).strip()

    raise ValueError(
        "Could not extract readable text from PDF file. "
        "Please ensure the file is not encrypted or completely empty."
    )

