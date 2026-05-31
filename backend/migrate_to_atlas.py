from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

# Connect to local MongoDB
local_client = MongoClient("mongodb://localhost:27017")
local_db = local_client["saps"]

# Connect to Atlas
atlas_uri = os.environ.get('MONGO_URI')
atlas_client = MongoClient(atlas_uri)
atlas_db = atlas_client["saps"]

print('=' * 60)
print('MONGODB DATA MIGRATION: LOCAL → ATLAS')
print('=' * 60)
print()

collections = ['users', 'student_profiles', 'teacher_profiles', 'academic_records', 'predictions']

total_migrated = 0

for collection_name in collections:
    print(f'Migrating: {collection_name}...')
    
    # Get documents from local
    local_collection = local_db[collection_name]
    documents = list(local_collection.find({}))
    
    if len(documents) == 0:
        print(f'  ✓ {collection_name}: No documents to migrate')
        continue
    
    # Insert into Atlas
    atlas_collection = atlas_db[collection_name]
    
    try:
        # Clear existing data in Atlas (optional - remove if you want to keep existing)
        # atlas_collection.delete_many({})
        
        # Insert documents
        if documents:
            result = atlas_collection.insert_many(documents)
            print(f'  ✓ {collection_name}: Migrated {len(result.inserted_ids)} documents')
            total_migrated += len(result.inserted_ids)
    except Exception as e:
        print(f'  ✗ {collection_name}: Error - {e}')

print()
print('=' * 60)
print(f'MIGRATION COMPLETE: {total_migrated} documents migrated')
print('=' * 60)
print()

# Verify migration
print('Verification:')
print('-' * 60)
for collection_name in collections:
    local_count = local_db[collection_name].count_documents({})
    atlas_count = atlas_db[collection_name].count_documents({})
    status = '✓' if local_count == atlas_count else '✗'
    print(f'{status} {collection_name:20s} | Local: {local_count:3d} | Atlas: {atlas_count:3d}')

print()
print('Sample data in Atlas:')
print('-' * 60)
for u in atlas_db['users'].find({}, {'name': 1, 'email': 1, 'role': 1, '_id': 0}):
    print(f"  {u['role']:8s} | {u['name']:20s} | {u['email']}")
