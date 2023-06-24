const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from the URL using qs (querystring parser) library
const {username, room} = Qs.parse(location.search, { 
    ignoreQueryPrefix: true //to ignore ? or & in the URL and grab only username and room
});

const socket = io();

// Join chat room - emit username and room as an event to the server when a user joins a room
socket.emit('joinRoom', {username, room});

// Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

// Listen for 'message' event from the server
socket.on('message', (message) => { //'message' received here will be an object
    console.log(message);
    outputMessage(message);

    // Scroll down whenever new message arrives
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // grab the message written in chat box
    const msg = e.target.elements.msg.value;

    //emit the message to the server
    socket.emit('chatMessage', msg);

    // after message is emitted to the server, input field should be cleared
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');

    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}

// Add room Name to DOM
function outputRoomName(room) {
    roomName.innerText = room;

}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}