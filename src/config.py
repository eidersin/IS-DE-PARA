# Fica em: src/config.py
import os
import json
import logging
from dotenv import load_dotenv

# --- Configuração do Logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(module)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# --- Carregamento de Variáveis de Ambiente ---
# Procura pelo arquivo .env no diretório atual (src) e o carrega
env_path = os.path.join(os.path.dirname(__file__), '.env')
if not os.path.exists(env_path):
    logging.error(f"Arquivo de configuração '.env' não encontrado em '{env_path}'. Crie o arquivo com API_KEY e ENDPOINT_URI.")
    exit() # Encerra a execução se o .env não for encontrado

load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("API_KEY")
ENDPOINT_URI = os.getenv("ENDPOINT_URI")

# --- Validação das Variáveis Carregadas ---
if not API_KEY or not ENDPOINT_URI:
    logging.error("As variáveis de ambiente API_KEY e ENDPOINT_URI devem ser definidas no arquivo .env.")
    exit()

# --- Caminhos de Pastas ---
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
INPUT_DIR = os.path.join(BASE_DIR, 'input')
OUTPUT_DIR = os.path.join(BASE_DIR, 'output')
SCHEMA_DIR = os.path.join(os.path.dirname(__file__), 'schemas')

# --- Funções para Carregar Schemas ---
def load_schema(schema_name: str) -> dict:
    """
    Carrega um schema JSON do diretório de schemas.
    
    Args:
        schema_name (str): O nome do arquivo do schema (ex: 'folha_schema.json').

    Returns:
        dict: O conteúdo do schema como um dicionário.
    """
    schema_path = os.path.join(SCHEMA_DIR, schema_name)
    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error(f"Arquivo de schema não encontrado: {schema_path}")
        return None
    except json.JSONDecodeError:
        logging.error(f"Erro ao decodificar o JSON do schema: {schema_path}")
        return None