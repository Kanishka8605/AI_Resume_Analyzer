def parse_txt(file_content: bytes) -> str:
    """
    Decodes plain text content bytes using UTF-8, falling back to Latin-1 if needed.
    """
    for encoding in ('utf-8', 'latin-1', 'cp1252', 'utf-16'):
        try:
            return file_content.decode(encoding).strip()
        except UnicodeDecodeError:
            continue
    raise ValueError("Failed to decode plain text file. Please ensure it is a valid text document.")
