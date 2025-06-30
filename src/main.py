# Fica em: src/main.py

import json
import os

from pdf_reader import extract_text_from_pdf
from agent_connector import call_agent, get_folha_pagamento_prompt_and_schema, get_interface_contabil_prompt_and_schema
from support_generator import create_folha_pagamento_support_document, create_interface_contabil_support_doc
from config import INPUT_DIR, OUTPUT_DIR, logging

# ... (constantes permanecem as mesmas) ...
INPUT_FILENAME = 'input_usuario.pdf'
FOLHA_JSON_OUTPUT = 'extracted_data_folha.json'
CONTABIL_JSON_OUTPUT = 'extracted_data_contabil.json'
FOLHA_DOCX_OUTPUT = 'Documento_Suporte_Folha_Pagamento.docx'
CONTABIL_DOCX_OUTPUT = 'Documento_Suporte_Interface_Contabil.docx'

def run_specialized_system():
    # ... (código de setup de pastas permanece o mesmo) ...
    logging.info("==================================================")
    logging.info("INICIANDO SISTEMA DE ANÁLISE DE DOCUMENTOS")
    logging.info("==================================================")

    input_pdf_path = os.path.join(INPUT_DIR, INPUT_FILENAME)
    output_json_dir = os.path.join(OUTPUT_DIR, '2_json_extracao')
    output_docx_dir = os.path.join(OUTPUT_DIR, '3_documento_suporte')
    os.makedirs(output_json_dir, exist_ok=True)
    os.makedirs(output_docx_dir, exist_ok=True)

    if not os.path.exists(input_pdf_path):
        logging.error(f"Arquivo de entrada não encontrado: {input_pdf_path}")
        return
        
    raw_text = extract_text_from_pdf(input_pdf_path)
    if not raw_text:
        logging.error("A extração de texto do PDF falhou. O sistema será encerrado.")
        return

    # --- Agente 1: Folha de Pagamento ---
    logging.info("--- Preparando Agente de Folha de Pagamento ---")
    folha_prompt, folha_schema = get_folha_pagamento_prompt_and_schema()
    folha_data = None 

    if folha_prompt and folha_schema:
        # *** AJUSTE AQUI: Passando o caminho para o arquivo de falha ***
        failed_path = os.path.join(output_json_dir, FOLHA_JSON_OUTPUT + ".failed")
        folha_data = call_agent(raw_text, folha_prompt, "Folha de Pagamento", failed_path)
    else:
        logging.error("Não foi possível carregar o prompt/schema para o agente de Folha de Pagamento. A chamada será pulada.")
    
    # --- Agente 2: Interface Contábil ---
    logging.info("--- Preparando Agente de Interface Contábil ---")
    contabil_prompt, contabil_schema = get_interface_contabil_prompt_and_schema()
    contabil_data = None 

    if contabil_prompt and contabil_schema:
        # *** AJUSTE AQUI: Passando o caminho para o arquivo de falha ***
        failed_path = os.path.join(output_json_dir, CONTABIL_JSON_OUTPUT + ".failed")
        contabil_data = call_agent(raw_text, contabil_prompt, "Interface Contábil", failed_path)
    else:
        logging.error("Não foi possível carregar o prompt/schema para o agente de Interface Contábil. A chamada será pulada.")

    # ... (O resto do código para salvar JSONs e gerar DOCX permanece o mesmo) ...
    if folha_data:
        json_folha_path = os.path.join(output_json_dir, FOLHA_JSON_OUTPUT)
        try:
            with open(json_folha_path, 'w', encoding='utf-8') as f:
                json.dump(folha_data, f, indent=2, ensure_ascii=False)
            logging.info(f"Dados da Folha de Pagamento salvos em: {json_folha_path}")
        except Exception as e:
            logging.error(f"Falha ao salvar o JSON da Folha de Pagamento: {e}")

    if contabil_data:
        json_contabil_path = os.path.join(output_json_dir, CONTABIL_JSON_OUTPUT)
        try:
            with open(json_contabil_path, 'w', encoding='utf-8') as f:
                json.dump(contabil_data, f, indent=2, ensure_ascii=False)
            logging.info(f"Dados da Interface Contábil salvos em: {json_contabil_path}")
        except Exception as e:
            logging.error(f"Falha ao salvar o JSON da Interface Contábil: {e}")

    if folha_data:
        docx_folha_path = os.path.join(output_docx_dir, FOLHA_DOCX_OUTPUT)
        create_folha_pagamento_support_document(folha_data, docx_folha_path)
    
    if contabil_data:
        docx_contabil_path = os.path.join(output_docx_dir, CONTABIL_DOCX_OUTPUT)
        create_interface_contabil_support_doc(contabil_data, docx_contabil_path)
        
    logging.info("==================================================")
    logging.info("SISTEMA DE ANÁLISE DE DOCUMENTOS FINALIZADO")
    logging.info("==================================================")


if __name__ == "__main__":
    run_specialized_system()