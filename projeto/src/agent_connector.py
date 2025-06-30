# Fica em: src/agent_connector.py

import requests
import json

API_KEY = "SUA_NOVA_CHAVE_API_AQUI"
ENDPOINT_URI = "https://reconheceai-chat-resource.cognitiveservices.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2025-01-01-preview"

# ==============================================================================
# SCHEMA E PROMPT PARA O ESPECIALISTA EM FOLHA DE PAGAMENTO
# ==============================================================================
def get_folha_pagamento_prompt_and_schema():
    """Retorna o schema e o prompt detalhado para o Diagnóstico de Folha de Pagamento."""
    
    schema = {
      "identificacao_documento": {
        "nome_cliente": "string",
        "responsavel_cliente": "string",
        "vigencia": "string",
        "data_base_categoria": "string"
      },
      "pisos_salariais": [
        {"cargo": "string", "valor_piso": "float"}
      ],
      "reajuste_salarial": {
        "percentual": "string",
        "detalhes": "string"
      },
      "beneficios": {
        "vale_alimentacao": {
          "possui": "boolean",
          "valor": "string",
          "condicoes": "string"
        },
        "seguro_de_vida": {
          "possui": "boolean",
          "cobertura_morte": "string",
          "cobertura_invalidez": "string"
        },
        "auxilio_creche": {
          "possui": "boolean",
          "valor_reembolso": "string",
          "idade_limite_filho": "string"
        },
        "assistencia_odontologica": {
          "possui": "boolean",
          "contribuicao_empresa": "string",
          "detalhes": "string"
        }
      },
      "adicionais": {
        "horas_extras": {
          "percentual_dias_uteis": "string",
          "percentual_feriados_dsr": "string"
        },
        "adicional_noturno": {
          "percentual": "string",
          "horario": "string",
          "duracao_hora": "string"
        },
        "insalubridade": {
          "percentual_grau_maximo": "string",
          "condicoes": "string"
        },
        "periculosidade": {
          "possui": "boolean",
          "detalhes": "string"
        },
        "acumulo_funcao": {
          "percentual": "string",
          "detalhes": "string"
        }
      },
      "jornada_trabalho": {
        "jornada_12x36": {
          "permitida": "boolean",
          "detalhes": "string"
        },
        "banco_de_horas": {
          "permitido": "boolean",
          "prazo_compensacao": "string"
        }
      },
      "estabilidade": {
        "gestante": {
          "periodo_complementar": "string"
        },
        "pre_aposentadoria": {
          "tempo_faltante": "string",
          "condicoes": "string"
        }
      },
      "rescisao": {
        "assistencia_sindical_obrigatoria": "string (ex: para mais de 1 ano de serviço)",
        "documentos_necessarios": ["string"]
      }
    }

    prompt = f"""
    Você é um analista especialista em Folha de Pagamento. Sua tarefa é ler a Convenção Coletiva de Trabalho (CCT) e extrair TODAS as informações relevantes para preencher o schema JSON a seguir.
    Se uma informação para um campo específico não for encontrada no documento, você DEVE preencher este campo com o texto exato: "Dado não encontrado, analisar na documentação". NÃO omita nenhuma chave.
    Sua resposta deve ser APENAS o código JSON bem formatado.

    Schema JSON de Folha de Pagamento para preenchimento:
    {json.dumps(schema, indent=2, ensure_ascii=False)}
    """
    return prompt, schema

# ==============================================================================
# SCHEMA E PROMPT PARA O ESPECIALISTA EM INTERFACE CONTÁBIL
# ==============================================================================
def get_interface_contabil_prompt_and_schema():
    """Retorna o schema e o prompt detalhado para o Diagnóstico de Interface Contábil."""
    
    schema = {
      "especificacoes_layout": {
        "formato_arquivo": "string",
        "campos": [{"campo": "string", "formato": "string", "regra": "string"}]
      },
      "conceitos_contabilizacao": {
        "sistema_contabil": "string",
        "codigos_empresa_iguais": "boolean",
        "tipo_agrupamento": "string",
        "plano_contas_unico": "boolean",
        "tipo_partida": "string (Dobrada ou Simples)",
        "codificacao_conta": "string (Classificação, Reduzido, Outros)",
        "detalhes_regras_gerais": "string"
      },
      "configuracao_conta_contabil": {
        "tamanho_codigo": "int",
        "mascara": "string",
        "conceitos_lancamento": ["string"],
        "tipo_lancamento": "string (Múltiplo ou Único)",
        "complemento_contas": "boolean",
        "regra_complemento": "string",
        "historico_contabil_unico": "boolean",
        "historico_por_conta": "boolean",
        "usa_chave_lancamento": "boolean"
      },
      "configuracao_rateio": {
        "possui_rateio": "boolean",
        "criterio_apuracao_custo": ["string"],
        "tipo_lancamento_rateio": "string",
        "calculo_automatico": "boolean",
        "detalhes_regras_rateio": "string"
      }
    }
    
    prompt = f"""
    Você é um analista especialista em Contabilidade e Sistemas. Sua tarefa é ler o documento fornecido e extrair TODAS as informações relevantes para preencher o schema JSON de Interface Contábil a seguir.
    Se uma informação para um campo específico não for encontrada no documento, você DEVE preencher este campo com o texto exato: "Dado não encontrado, analisar na documentação". NÃO omita nenhuma chave.
    Sua resposta deve ser APENAS o código JSON bem formatado.

    Schema JSON de Interface Contábil para preenchimento:
    {json.dumps(schema, indent=2, ensure_ascii=False)}
    """
    return prompt, schema

# ==============================================================================
# FUNÇÃO GENÉRICA PARA CHAMAR A API
# ==============================================================================
def call_agent(raw_text: str, system_prompt: str, agent_name: str):
    """Função genérica que chama a API da LLM com um prompt específico."""
    headers = {"Content-Type": "application/json", "api-key": API_KEY}
    payload = {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": raw_text}
        ],
        "max_tokens": 4096,
        "temperature": 0.3,
        "top_p": 1.0
    }
    try:
        print(f"Enviando requisição para o Agente Especialista: {agent_name}...")
        response = requests.post(ENDPOINT_URI, headers=headers, data=json.dumps(payload), timeout=180)
        response.raise_for_status()
        print(f"Resposta de {agent_name} recebida com sucesso.")
        response_json = response.json()
        json_content_string = response_json["choices"][0]["message"]["content"]
        if json_content_string.strip().startswith("```json"):
            json_content_string = json_content_string.strip()[7:-4]
        extracted_data = json.loads(json_content_string)
        return extracted_data
    except Exception as e:
        print(f"Ocorreu um erro ao chamar o agente {agent_name}: {e}")
        if 'response' in locals() and hasattr(response, 'text'):
            print(f"Resposta recebida (pode ser inválida): {response.text}")
        return None