const users = [];

// Join user to chat
function userJoin(id, username, room) {
    const user = {id, username, room};

    users.push(user);
    return user;
}

// Get the current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// User leaves room
function userLeave(id) {
    const index = users.findIndex(user => user.id === id); //finding index of the user who has left

    if(index != -1){ //i.e. the user is present in the users array
        return users.splice(index, 1)[0]; //return the removed user
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room); 
}

export {userJoin, getCurrentUser, userLeave, getRoomUsers};