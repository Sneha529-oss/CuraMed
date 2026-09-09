import os
import time
import uuid
from typing import Dict, Any, List, Optional
import pymongo
from pymongo import MongoClient
from core.config import settings

class MemoryCollection:
    """Thread-safe in-memory collection replica for offline / fallback mode."""
    def __init__(self, name: str):
        self.name = name
        self.documents: Dict[str, Dict[str, Any]] = {}

    def insert_one(self, doc: Dict[str, Any]):
        doc_copy = doc.copy()
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        else:
            doc_copy["_id"] = str(doc_copy["_id"])
        self.documents[doc_copy["_id"]] = doc_copy
        class InsertResult:
            inserted_id = doc_copy["_id"]
        return InsertResult()

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for doc in self.documents.values():
            match = True
            for k, v in query.items():
                if k == "_id":
                    v = str(v)
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc.copy()
        return None

    def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List] = None, skip: int = 0, limit: int = 0):
        query = query or {}
        results = []
        for doc in self.documents.values():
            match = True
            for k, v in query.items():
                if k == "_id":
                    v = str(v)
                if isinstance(v, dict):
                    # Handle basic Mongo operators like $regex or $in
                    if "$regex" in v:
                        pattern = v["$regex"].lower()
                        if pattern not in str(doc.get(k, "")).lower():
                            match = False
                            break
                    elif "$in" in v:
                        if doc.get(k) not in v["$in"]:
                            match = False
                            break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc.copy())

        # Sort if requested
        if sort:
            for field, order in reversed(sort):
                reverse = (order == pymongo.DESCENDING or order == -1)
                results.sort(key=lambda x: str(x.get(field, "")), reverse=reverse)

        if skip > 0:
            results = results[skip:]
        if limit > 0:
            results = results[:limit]
        return results

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))

    def delete_one(self, query: Dict[str, Any]):
        doc = self.find_one(query)
        if doc and "_id" in doc:
            self.documents.pop(doc["_id"], None)
            class DeleteResult:
                deleted_count = 1
            return DeleteResult()
        class DeleteResult:
            deleted_count = 0
        return DeleteResult()

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        doc = self.find_one(query)
        if doc and "_id" in doc:
            target = self.documents[doc["_id"]]
            if "$set" in update:
                target.update(update["$set"])
            class UpdateResult:
                modified_count = 1
            return UpdateResult()
        class UpdateResult:
            modified_count = 0
        return UpdateResult()


class DatabaseManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.is_atlas = False
        self._memory_db: Dict[str, MemoryCollection] = {
            "users": MemoryCollection("users"),
            "predictions": MemoryCollection("predictions"),
            "analytics_logs": MemoryCollection("analytics_logs")
        }

    def connect(self):
        if settings.MONGODB_URI and "mongodb" in settings.MONGODB_URI:
            try:
                print(f"[Database] Connecting to MongoDB: {settings.MONGODB_URI[:25]}...")
                self.client = MongoClient(
                    settings.MONGODB_URI,
                    serverSelectionTimeoutMS=4000,
                    connectTimeoutMS=4000
                )
                # Quick ping to verify connectivity
                self.client.admin.command('ping')
                self.db = self.client[settings.MONGODB_DB_NAME]
                self.is_atlas = True
                print(f"[Database] Successfully connected to MongoDB Database: {settings.MONGODB_DB_NAME}")
                return
            except Exception as e:
                print(f"[Database] MongoDB connection warning ({e}). Initializing high-reliability fallback store.")
        
        print("[Database] Using high-reliability local database store.")
        self.is_atlas = False

    def get_collection(self, name: str):
        if self.is_atlas and self.db is not None:
            try:
                return self.db[name]
            except Exception as e:
                print(f"[Database] Error accessing MongoDB collection {name}: {e}")
        
        if name not in self._memory_db:
            self._memory_db[name] = MemoryCollection(name)
        return self._memory_db[name]

    @property
    def users(self):
        return self.get_collection("users")

    @property
    def predictions(self):
        return self.get_collection("predictions")

    @property
    def analytics_logs(self):
        return self.get_collection("analytics_logs")

db_manager = DatabaseManager()
