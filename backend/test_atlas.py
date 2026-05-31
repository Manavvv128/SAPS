import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

uri = os.environ.get('MONGO_URI', 'NOT SET')
print('=' * 60)
print('MONGO_URI from .env:')
print('=' * 60)
print(uri)
print()

print('=' * 60)
print('Attempting MongoDB Atlas connection...')
print('=' * 60)
try:
    client = MongoClient(uri, serverSelectionTimeoutMS=10000)
    info = client.server_info()
    print(f'✓ Atlas connection successful!')
    print(f'Connected to: {client.address}')
    print(f'MongoDB version: {info["version"]}')
    
    # List databases
    db_names = client.list_database_names()
    print(f'\nDatabases: {db_names}')
    
    # Check the saps database
    db = client['saps']
    collections = db.list_collection_names()
    print(f'\nCollections in "saps": {collections}')
    
    # Count documents
    if 'users' in collections:
        print(f'Users in Atlas: {db["users"].count_documents({})}')
    
except Exception as e:
    print(f'✗ Atlas connection failed!')
    print(f'Error: {type(e).__name__}: {e}')
