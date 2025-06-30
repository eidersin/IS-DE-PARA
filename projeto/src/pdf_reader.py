# pdf_reader.py

import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extrai todo o texto de um arquivo PDF.
    """
    try:
        doc = fitz.open(pdf_path)
        full_text = ""
        for page in doc:
            full_text += page.get_text("text", sort=True) + "\n"
        
        print(f"Texto extraído com sucesso de '{pdf_path}'.")
        return full_text
    except Exception as e:
        print(f"Erro ao ler o arquivo PDF '{pdf_path}': {e}")
        return None