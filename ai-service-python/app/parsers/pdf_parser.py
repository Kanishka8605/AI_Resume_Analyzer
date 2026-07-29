import io
import pdfplumber

def parse_pdf(file_content: bytes) -> str:
    """
    Extracts text from PDF file content bytes using pdfplumber.
    """
    extracted_lines = []
    try:
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    extracted_lines.append(page_text)
        return "\n".join(extracted_lines)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF file: {str(e)}")
