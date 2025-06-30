# Fica em: src/agent_connector.py

import requests
import json
import os
from typing import Dict, Any, Tuple

from config import API_KEY, ENDPOINT_URI, load_schema, logging, OUTPUT_DIR

def _repair_json_with_llm(broken_json_string: str, original_error: str) -> str:
    """
    Usa uma chamada de LLM dedicada para tentar reparar uma string JSON quebrada,
    informando ao modelo o erro original para uma correção mais precisa.
    """
    logging.warning("JSON inválido detectado. Acionando agente de reparo cirúrgico de JSON...")
    
    # --- PROMPT DE REPARO APRIMORADO ---
    repair_prompt = f"""
    The following text is supposed to be a single, valid JSON object, but it failed to parse.
    The parsing error was: "{original_error}".
    This error, especially 'Unterminated string', is often caused by an unescaped double quote (") inside a string value.
    Please meticulously analyze the text, correct the specific error, and fix any other syntax issues.
    Return ONLY the valid JSON object. Do not add any explanation, comments, or markdown fences like ```json.
    Your entire response must be only the corrected, raw JSON object.

    Broken JSON text to fix:
    {broken_json_string}
    """
    
    headers = {"Content-Type": "application/json", "api-key": API_KEY}
    payload = {
        "messages": [{"role": "user", "content": repair_prompt}],
        "max_tokens": 4096,
        "temperature": 0.0,
        "top_p": 1.0,
    }

    try:
        response = requests.post(ENDPOINT_URI, headers=headers, data=json.dumps(payload), timeout=180)
        response.raise_for_status()
        repaired_content = response.json()["choices"][0]["message"]["content"]
        
        if repaired_content.strip().startswith("```json"):
            repaired_content = repaired_content.strip()[7:-4].strip()
        
        logging.info("Reparo de JSON via LLM concluído. Tentando validar o resultado.")
        return repaired_content
    except Exception as e:
        logging.error(f"A chamada à LLM para reparar o JSON falhou: {e}")
        return None

def call_agent(raw_text: str, system_prompt: str, agent_name: str, failed_json_output_path: str) -> Dict[str, Any]:
    """
    Função genérica que chama a API da LLM e inclui uma tentativa de reparo inteligente para JSON inválido.
    Se tudo falhar, salva o JSON quebrado para análise manual.
    """
    # ... (código para montar headers e payload permanece o mesmo) ...
    headers = {"Content-Type": "application/json", "api-key": API_KEY}
    payload = {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": raw_text}
        ],
        "max_tokens": 4096,
        "temperature": 0.2,
        "top_p": 1.0,
        "response_format": {"type": "json_object"}
    }

    try:
        logging.info(f"Enviando requisição para o Agente Especialista: {agent_name}...")
        response = requests.post(ENDPOINT_URI, headers=headers, data=json.dumps(payload), timeout=240)
        response.raise_for_status()
        
        logging.info(f"Resposta de {agent_name} recebida com sucesso (Status: {response.status_code}).")
        
        json_content_string = response.json()["choices"][0]["message"]["content"]
        
        try:
            extracted_data = json.loads(json_content_string)
            logging.info(f"JSON do agente '{agent_name}' validado com sucesso na primeira tentativa.")
            return extracted_data
        except json.JSONDecodeError as json_err:
            logging.error(f"Erro de decodificação do JSON recebido do agente {agent_name}. Erro: {json_err}")
            
            repaired_json_string = _repair_json_with_llm(json_content_string, str(json_err))

            if repaired_json_string:
                try:
                    extracted_data = json.loads(repaired_json_string)
                    logging.info("JSON reparado por LLM e validado com sucesso!")
                    return extracted_data
                except json.JSONDecodeError as final_err:
                    logging.error(f"A tentativa de reparo com LLM falhou na validação final. Erro: {final_err}")
                    # --- REDE DE SEGURANÇA ---
                    try:
                        with open(failed_json_output_path, 'w', encoding='utf-8') as f:
                            f.write(json_content_string)
                        logging.warning(f"O JSON original quebrado foi salvo para análise em: {failed_json_output_path}")
                    except Exception as e:
                        logging.error(f"Não foi possível salvar o arquivo de JSON quebrado: {e}")
                    return None
            else:
                return None

    except requests.exceptions.RequestException as req_err:
        logging.error(f"Ocorreu um erro de requisição ao chamar o agente {agent_name}: {req_err}", exc_info=True)
        return None
    except Exception as e:
        logging.error(f"Ocorreu um erro inesperado ao chamar o agente {agent_name}: {e}", exc_info=True)
        return None

# Funções de prompt permanecem as mesmas
def get_folha_pagamento_prompt_and_schema() -> Tuple[str, Dict[str, Any]]:
    schema = load_schema("super_schema_folha.json")
    if not schema: return None, None
    prompt = f"""
    Você é um analista sênior especialista em Folha de Pagamento...
    (O resto do prompt continua o mesmo, com a instrução sobre escapar aspas)
    Schema JSON de Folha de Pagamento para preenchimento:
    {json.dumps(schema, indent=2, ensure_ascii=False)}
    """
    return prompt, schema

def get_interface_contabil_prompt_and_schema() -> Tuple[str, Dict[str, Any]]:
    schema = load_schema("super_schema_contabil.json")
    if not schema: return None, None
    prompt = f"""
    Você é um analista sênior especialista em Contabilidade e Sistemas...
    (O resto do prompt continua o mesmo, com a instrução sobre escapar aspas)
    Schema JSON de Interface Contábil para preenchimento:
    {json.dumps(schema, indent=2, ensure_ascii=False)}
    """
    return prompt, schema