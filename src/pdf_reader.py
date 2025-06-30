# pdf_reader.py

import fitz  # PyMuPDF
from config import logging # Importa o logger configurado

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extrai todo o texto de um arquivo PDF.

    Args:
        pdf_path (str): O caminho para o arquivo PDF.

    Returns:
        str: O texto extraído do PDF, ou None em caso de erro.
    """
    try:
        logging.info(f"Iniciando extração de texto de '{pdf_path}'.")
        doc = fitz.open(pdf_path)
        full_text = ""
        for page_num, page in enumerate(doc, start=1):
            full_text += page.get_text("text", sort=True) + "\n"
        
        logging.info(f"Texto extraído com sucesso de {len(doc)} páginas em '{pdf_path}'.")
        return full_text
    except Exception as e:
        logging.error(f"Erro ao ler o arquivo PDF '{pdf_path}': {e}", exc_info=True)
        return None