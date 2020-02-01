var express = require('express');
var socket = require('socket.io');
var rooms_array = ["https://i.kym-cdn.com/photos/images/original/001/351/595/e80.jpg"];

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
io.on('connection', socket => {
    console.log('New connection from ' + socket.id);

    // When a user clicks the 'create' button on the website, this will run
    socket.on('create', data => {

        let key_to_send = keyCreator();

        console.log(data.source_socket);
        io.to(data.source_socket).emit('create', {
            back_data: data,
            key: key_to_send
        });
    });

});

// Function to create a unique five letter key. Will automatically push it to the rooms_array array
function keyCreator() {
    let alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
    "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

    let temp_key = alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)];

    for(i=0; i<rooms_array.length; i++) {
        if(temp_key == rooms_array[i]) {
            keyCreator(); 
        }
        else {
            rooms_array.push([temp_key]);
            return temp_key; 
        }
    }
}