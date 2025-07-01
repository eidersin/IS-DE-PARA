export const folhaSchema = {
  "identificacao_documento": {
    "sindicato_empregados": {
      "nome": "string",
      "cnpj": "string",
      "representante": "string"
    },
    "sindicato_patronal": {
      "nome": "string",
      "cnpj": "string",
      "representante": "string"
    },
    "vigencia": "string",
    "data_base_categoria": "string",
    "abrangencia_territorial": ["string"]
  },
  "pisos_salariais": [
    {
      "cargo_funcao": "string",
      "valor_piso": "float",
      "observacoes": "string"
    }
  ],
  "reajuste_salarial": {
    "percentual_reajuste": "string",
    "data_aplicacao": "string",
    "regras_proporcionalidade_admitidos": "string",
    "compensacoes_permitidas": "string"
  },
  "beneficios": {
    "vale_alimentacao": {
      "obrigatorio_cct": "boolean",
      "valor_mensal_ou_diario": "string",
      "condicoes_concessao": "string",
      "natureza_salarial": "boolean",
      "desconto_trabalhador_permitido": "string"
    },
    "vale_refeicao": {
      "obrigatorio_cct": "boolean",
      "valor_diario": "string",
      "condicoes": "string"
    },
    "auxilio_creche": {
      "obrigatorio_cct": "boolean",
      "valor_reembolso": "string",
      "idade_limite_filho": "string",
      "condicoes_para_concessao": "string"
    },
    "seguro_de_vida_em_grupo": {
      "obrigatorio_cct": "boolean",
      "cobertura_morte": "string",
      "cobertura_invalidez_acidente": "string",
      "onus_para_trabalhador": "boolean"
    },
    "assistencia_odontologica": {
      "obrigatorio_cct": "boolean",
      "modelo": "string",
      "contribuicao_empresa": "string",
      "contribuicao_empregado": "string",
      "detalhes": "string"
    },
    "auxilio_funeral": {
      "obrigatorio_cct": "boolean",
      "valor_ou_condicoes": "string"
    }
  },
  "adicionais_e_gratificacoes": {
    "horas_extras": {
      "percentual_dias_uteis": "string",
      "percentual_domingos_feriados": "string",
      "divisor_aplicavel": "string"
    },
    "adicional_noturno": {
      "percentual": "string",
      "horario_considerado_noturno": "string",
      "duracao_hora_noturna_minutos": "string"
    },
    "adicional_insalubridade": {
      "grau_maximo": {
        "percentual": "string",
        "base_calculo": "string",
        "atividades_aplicaveis": "string"
      },
      "outros_graus": "string"
    },
    "adicional_periculosidade": {
      "percentual": "string",
      "base_calculo": "string",
      "possibilidade_cumulacao_insalubridade": "boolean"
    },
    "adicional_acumulo_funcao": {
      "percentual": "string",
      "base_calculo": "string",
      "condicoes_aplicacao": "string"
    },
    "quebra_de_caixa": {
      "percentual": "string",
      "cargos_aplicaveis": ["string"]
    }
  },
  "jornada_de_trabalho": {
    "jornada_12x36": {
      "permitida_cct": "boolean",
      "remuneracao_feriados": "string",
      "intervalo_intrajornada": "string",
      "dispensa_licenca_previa_insalubridade": "boolean"
    },
    "banco_de_horas": {
      "permitido_cct": "boolean",
      "prazo_compensacao_meses": "string",
      "forma_pagamento_saldo_nao_compensado": "string"
    },
    "dia_da_categoria": {
      "data_comemorativa": "string",
      "regra_trabalho_nesse_dia": "string"
    }
  },
  "estabilidade_provisoria": {
    "gestante": {
      "periodo_convencional_complementar": "string"
    },
    "pre_aposentadoria": {
      "tempo_faltante_para_aposentadoria": "string",
      "condicoes_e_requisitos": "string"
    },
    "retorno_afastamento_previdenciario": {
      "periodo_estabilidade": "string"
    },
    "cipeiro": {
      "estabilidade_suplente": "boolean"
    }
  }
}

export const contabilSchema = {
  "informacoes_gerais": {
    "nome_cliente": "string",
    "responsavel_aprovacao_diagnostico": "string",
    "sistema_contabil_utilizado": "string"
  },
  "especificacoes_layout_arquivo": {
    "formato_arquivo": "string",
    "observacoes_formato": "string",
    "campos_do_layout": [
      {
        "nome_campo": "string",
        "formato": "string",
        "regra_especifica": "string"
      }
    ]
  },
  "conceitos_gerais_contabilizacao": {
    "integracao_empresa": {
      "codigos_empresa_iguais_integracao": "boolean",
      "regra_codigos_diferentes": "string",
      "lista_empresas": [
        {
          "codigo_contabil": "string",
          "razao_social": "string",
          "cnpj": "string"
        }
      ]
    },
    "agrupamento": {
      "tipo_agrupamento_utilizado": "string",
      "regra_agrupamento": "string",
      "codigo_agrupamento_igual_integracao": "boolean",
      "regra_codigo_diferente": "string"
    },
    "plano_de_contas": {
      "plano_unico_para_grupo": "boolean",
      "regra_excecoes_plano": "string"
    },
    "lancamento_contabil": {
      "tipo_partida": "string",
      "tipo_codificacao_conta": "string",
      "regra_codificacao": "string"
    },
    "outros_conceitos_regras": "string"
  },
  "configuracao_conta_contabil": {
    "estrutura_conta": {
      "tamanho_codigo": "integer",
      "mascara": "string",
      "tamanho_descricao_conta": "integer"
    },
    "parametros_lancamento": {
      "conceitos_base_lancamento": ["string"],
      "tipo_lancamento": "string",
      "regra_tipo_lancamento": "string",
      "tipo_conta_obrigatorio": "string"
    },
    "complementos_e_historicos": {
      "utiliza_complemento_contas": "boolean",
      "regra_complemento_contas": "string",
      "historico_contabil_unico_para_lancamento": "boolean",
      "utiliza_historico_por_conta": "boolean",
      "utiliza_chave_lancamento_sap": "boolean",
      "regra_chave_lancamento": "string"
    },
    "outras_regras_configuracao_conta": "string"
  },
  "configuracao_rateio_contabil": {
    "possui_rateio": "boolean",
    "criterios_apuracao_custo": ["string"],
    "lancamento_rateio": {
      "metodo_lancamento": "string",
      "regra_especifica_metodo": "string"
    },
    "calculo_automatico_rateio": {
      "habilitado": "boolean",
      "regra_calculo_automatico": "string"
    },
    "outras_regras_rateio": "string"
  }
}