
# MongoDB setup using pymongo
import os
from pymongo import MongoClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://Amartya:Amartya@main-cluster.qybneng.mongodb.net/")
client = MongoClient(MONGODB_URI)
db = client["careerpathak"]

# Collections
users_collection = db["users"]
marksheets_collection = db["marksheets"]
answers_collection = db["psychometric_answers"]
