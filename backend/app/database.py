from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

_client: AsyncIOMotorClient = None
_database: AsyncIOMotorDatabase = None


async def connect_to_mongo() -> None:
    global _client, _database
    try:
        _client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=50,
            minPoolSize=10,
        )
        await _client.admin.command("ping")
        _database = _client[settings.MONGODB_DB_NAME]
        await _database.users.create_index("email", unique=True)
        await _database.resumes.create_index("user_id")
        await _database.job_descriptions.create_index("user_id")
        await _database.analyses.create_index("user_id")
        await _database.analyses.create_index("resume_id")
        print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        raise


async def close_mongo_connection() -> None:
    global _client, _database
    if _client:
        _client.close()
        _client = None
        _database = None
        print("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    if _database is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo first.")
    return _database


def get_collection(name: str):
    db = get_database()
    return db[name]
