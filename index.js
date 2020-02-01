var express = require('express');
var socket = require('socket.io');
var rooms = {};

var app = express();

// This is the creation of our server
// We are telling our app to listen to port 80!
var server = app.listen(80, () => {
    console.log('Listening to port 80');
});
// Now we are feeding our app the folder containing all of our frontend pages
// It will default to using the 'Index.html' as a homepage
app.use(express.static('frontend'));



// Adding socket.io to our web server
var io = socket(server);
io.on('connection', socket => { console.log('New connection from ' + socket.id);
    

    // When a user clicks the 'create' button on the website, this will run
    socket.on('create', data => {

        let key_to_send = keyCreator();

        // rooms_array.indexOf(key_to_send)
        rooms[key_to_send]["prefs"] = {};
        rooms[key_to_send]["players"] = {};
        rooms[key_to_send]["prefs"].spy1on = data.spyfall1on;
        rooms[key_to_send]["prefs"].spy2on = data.spyfall2on;
        rooms[key_to_send]["prefs"].matchtime = data.time;

        io.to(data.source_socket).emit('create', {
            back_data: data,
            key: key_to_send
        });
    });

    socket.on('join', data => {

        if(!rooms[data.join_key]) {
            io.to(data.source_socket).emit('no_key_error', data.join_key)
            return;
        }

        io.to(data.source_socket).emit('join', {
            back_data: data,
            key: data.join_key
        });

    });

    socket.on('load_players', data => {
        rooms[data.key]["players"][data.source_socket] = {};
        console.log(JSON.stringify(rooms, null, 4));

        for(i=0; i < Object.keys(rooms[data.key]["players"]).length; i++) {
            io.to((Object.keys(rooms[data.key]["players"]))[i]).emit('load_players', {
                player_sockets: Object.keys(rooms[data.key]["players"])
            });
        }
        
    });
});



// Function to create a unique five letter key. Will automatically push it to the rooms_array array
function keyCreator() {
    let alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
    "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

    let temp_key = alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)];
     
    if(rooms[temp_key]) {
        keyCreator();
    } else {
        rooms[temp_key] = {};
        return temp_key;
    }
}