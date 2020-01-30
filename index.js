var express = require('express');
var socket = require('socket.io');
var fs = require('fs');
const rooms = JSON.parse(fs.readFileSync('Storage/rooms.json', 'utf8'));

if(!rooms["rooms"]) {
    rooms["rooms"] = {};
}

if(!rooms["rooms"]["asjen"]) {
    rooms["rooms"]["asjen"] = {};
}

fs.writeFile('Storage/rooms.json', JSON.stringify(rooms, null, 4), (err) => {
    if(err) console.error(err);
});

var app = express();

var server = app.listen(4000, function(){
    console.log('Listening to port 4000');
});
app.use(express.static('frontend'));

var io = socket(server);

io.on('connection', socket => {
    console.log('New connection from ' + socket.id);

    socket.on('create', data => {
        io.sockets.emit('create', data);
    });

});

function keyCreator() {
    
    let alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
    "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    
    return alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)];
}

