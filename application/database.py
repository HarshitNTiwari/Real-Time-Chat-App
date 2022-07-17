# contains all the logic to connct to the database.
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from user import User

client = MongoClient("mongodb+srv://harshit:1234@chatapp.6eoul.mongodb.net/?retryWrites=true&w=majority")


chat_db = client.get_database("ChatDB") # ChatDB is the name of the database created in mongoDB
users_collection = chat_db.get_collection("users") # users is the name of the collection created in ChatDB database

# for saving user info
def save_user_info(username, email, password):
	password_hash = generate_password_hash(password)
	users_collection.insert_one({'_id': username, 'email': email, 'password': password_hash})  #username is to be used as the primary key-its going to be unique
 
# to fetch data from the database
def get_user(username):
	user_data = users_collection.find_one({'_id': username})
	return User(user_data['_id'], user_data['email'], user_data['password']) if user_data else None