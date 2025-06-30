# Fica em: src/main.py

from pdf_reader import extract_text_from_pdf
# Importa as funções de chamada de agente
from agent_connector import call_agent, get_folha_pagamento_prompt_and_schema, get_interface_contabil_prompt_and_schema
# Importa as funções de geração de documento
from support_generator import create_support_document, create_interface_contabil_support_doc
import json
import os

def run_specialized_system():
    # --- Define a estrutura de pastas e arquivos ---
    base_dir = os.path.join(os.path.dirname(__file__), '..')
    input_dir = os.path.join(base_dir, 'input')
    output_dir = os.path.join(base_dir, 'output')
    
    input_filename = 'input_usuario.pdf'
    input_pdf_path = os.path.join(input_dir, input_filename)

    # Cria as pastas de saída
    output_json_dir = os.path.join(output_dir, '2_json_extracao')
    output_docx_dir = os.path.join(output_dir, '3_documento_suporte')
    os.makedirs(output_json_dir, exist_ok=True)
    os.makedirs(output_docx_dir, exist_ok=True)

    # --- 1. Ler o texto do PDF de entrada ---
    raw_text = extract_text_from_pdf(input_pdf_path)
    if not raw_text:
        return

    # --- 2. Chamar os AGENTES ESPECIALIZADOS ---
    
    # Agente 1: Folha de Pagamento
    folha_prompt, _ = get_folha_pagamento_prompt_and_schema()
    folha_data = call_agent(raw_text, folha_prompt, "Folha de Pagamento")
    
    # Agente 2: Interface Contábil
    contabil_prompt, _ = get_interface_contabil_prompt_and_schema()
    contabil_data = call_agent(raw_text, contabil_prompt, "Interface Contábil")

    # --- 3. Salvar os JSONs extraídos para depuração ---
    if folha_data:
        json_folha_path = os.path.join(output_json_dir, 'extracted_data_folha.json')
        with open(json_folha_path, 'w', encoding='utf-8') as f:
            json.dump(folha_data, f, indent=2, ensure_ascii=False)
        print(f"Dados da Folha de Pagamento salvos em: {json_folha_path}")

    if contabil_data:
        json_contabil_path = os.path.join(output_json_dir, 'extracted_data_contabil.json')
        with open(json_contabil_path, 'w', encoding='utf-8') as f:
            json.dump(contabil_data, f, indent=2, ensure_ascii=False)
        print(f"Dados da Interface Contábil salvos em: {json_contabil_path}")

    # --- 4. Gerar os DOIS documentos de suporte ---
    input_name_base = os.path.splitext(os.path.basename(input_pdf_path))[0]
    
    # Gera Doc 1
    if folha_data:
        folha_output_name = f"Documento_Suporte_Folha_Pagamento_{input_name_base}.docx"
        docx_folha_path = os.path.join(output_docx_dir, folha_output_name)
        create_support_document(folha_data, docx_folha_path)
    
    # Gera Doc 2
    if contabil_data:
        contabil_output_name = f"Documento_Suporte_Interface_Contabil_{input_name_base}.docx"
        docx_contabil_path = os.path.join(output_docx_dir, contabil_output_name)
        create_interface_contabil_support_doc(contabil_data, docx_contabil_path)

if __name__ == "__main__":
    run_specialized_system()