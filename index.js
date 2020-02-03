const express = require('express');
const socket = require('socket.io');
const neatCsv = require('neat-csv');
const fs = require('fs');
var rooms = {};
var spyfall1data = [];
var spyfall2data = [];
var custom1data = [];

var app = express();

fs.readFile('Storage/spyfall_1.csv', async (err, data) => {
    if (err) return console.error(err);
    
    let temp_data = await neatCsv(data);

    for(i = 0; i < temp_data.length; i++) {
        spyfall1data.push(temp_data[i]);
    }
    // console.log(spyfall1data);
});

fs.readFile('Storage/spyfall_2.csv', async (err, data) => {
    if (err) return console.error(err);
    
    let temp_data = await neatCsv(data);

    for(i = 0; i < temp_data.length; i++) {
        spyfall2data.push(temp_data[i]);
    }
    console.log(spyfall2data);
});

fs.readFile('Storage/custom_1.csv', async (err, data) => {
    if (err) return console.error(err);
    
    let temp_data = await neatCsv(data);

    for(i = 0; i < temp_data.length; i++) {
        custom1data.push(temp_data[i]);
    }
    // console.log(custom1data);
});

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

        let nsp = io.of("/room_" + key_to_send);

        rooms[key_to_send]["prefs"] = {};
        rooms[key_to_send]["players"] = {};
        rooms[key_to_send]["prefs"].spy1on = data.spyfall1on;
        rooms[key_to_send]["prefs"].spy2on = data.spyfall2on;
        rooms[key_to_send]["prefs"].matchtime = data.time;
        rooms[key_to_send]["prefs"].owner = data.name;

        io.to(data.source_socket).emit('create', {
            back_data: data,
            key: key_to_send
        });
    });

    // When a user clicks the 'join' button on the website, this will run
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

    // when a player enters the game_room, this will run
    socket.on('load_players', data => {
        // If the room they are trying to load doesnt exit
        if(!rooms[data.key]) {
            io.to(data.source_socket).emit('no_key_error', data.key);
            return;
        }

        rooms[data.key]["players"][data.source_socket] = {};
        rooms[data.key]["players"][data.source_socket].name = data.name;

        for(i=0; i < Object.keys(rooms[data.key]["players"]).length; i++) {
            io.to((Object.keys(rooms[data.key]["players"]))[i]).emit('load_players', {
                player_sockets: Object.keys(rooms[data.key]["players"]),
                player_names: Object.values(rooms[data.key]["players"])
            });
        }
        
    });

    socket.on('start_game', data => {

        let temp_locations = [];

        if(rooms[data.key]["prefs"].spy1on) {
            for(i = 0; i < spyfall1data.length; i++) {
                temp_locations.push(spyfall1data[i].location);
            }
        }

        if(rooms[data.key]["prefs"].spy2on) {
            for(i = 0; i < spyfall2data.length; i++) {
                temp_locations.push(spyfall2data[i].location);
            }
        }

        console.log(temp_locations);
        let chosen_location = temp_locations[Math.floor(Math.random() * temp_locations.length)];

    
        let spy_num = Math.floor(Math.random() *  Object.keys(rooms[data.key]["players"]).length);


        for(i=0; i < Object.keys(rooms[data.key]["players"]).length; i++) {

            if(i == spy_num) {
                io.to((Object.keys(rooms[data.key]["players"]))[i]).emit('start_game', {
                    location: chosen_location,
                    role: "spy"
                });
            } else {
                io.to((Object.keys(rooms[data.key]["players"]))[i]).emit('start_game', {
                    location: chosen_location,
                    role: "not spy"
                });
            }
            
        }
    });

    socket.on('disconnect', () => {
        for(let key in rooms) {
            if(rooms[key]["players"][socket.id]) {
                delete rooms[key]["players"][socket.id];

                for(i=0; i < Object.keys(rooms[key]["players"]).length; i++) {
                    io.to((Object.keys(rooms[key]["players"]))[i]).emit('load_players', {
                        player_sockets: Object.keys(rooms[key]["players"]),
                        player_names: Object.values(rooms[key]["players"])
                    });
                }
            }
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