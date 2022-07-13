from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO, join_room
from flask_login import LoginManager

login_manager = LoginManager()
app = Flask(__name__)
# Creating a socketio app object
# it is encapsulating the flask app object
socketio = SocketIO(app)

@app.route('/')
def home():
	return render_template('home.html')


@app.route('/chat', methods = ['POST','GET'])
def chat():
	username = request.form['username']
	room = request.form['room']
	if username and room:
		print("username got successfully")
		return render_template('chat.html', username=username, room=room)
	else:
		return redirect(url_for('home'))


@socketio.on('send_message')
def handle_send_message_event(data):
	app.logger.info("{} has sent the message to the room{}: {}".format(data['username'], data['room'], data['message']))
	socketio.emit('receive_message', data, room = data['room'])

# On the triggering of join room event
@socketio.on('join_room')
def handle_join_room_event(data):
	app.logger.info("{} has joined the room {}".format(data['username'], data['room']))
	join_room(data['room'])  # this will make that particular client join the room
	socketio.emit('join_room_announcement', data)  #emitting event for announcement

# Running in debug mode
if __name__=='__main__':
    socketio.run(app, debug=True)  