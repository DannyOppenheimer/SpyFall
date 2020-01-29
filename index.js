var express = require('express');
var socket = require('socket.io');
var fs = require('fs');
const rooms = JSON.parse(fs.readFileSync('Storage/rooms.json', 'utf8'));

var app = express();

var server = app.listen(4000, function(){
    console.log('Listening to port 4000');
});
app.use(express.static('Public'));

var io = socket(server);

io.on('connection', socket => {
    var address = socket.handshake.address;
    console.log('New connection from ' + socket.id);
    //console.log(Object.keys(io.sockets.sockets));

/*    
    if(!rooms["hey"]) {
        rooms["hey"] = {}
    }
    if(!rooms["hey"]["yo"]) {
        rooms["hey"]["yo"] = {}
    }

    fs.writeFile('Storage/rooms.json', JSON.stringify(rooms, null, 4), (err) => {
        if(err) console.error(err);
    });*/
});

