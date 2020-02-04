const express = require('express');
const socket = require('socket.io');
const neatCsv = require('neat-csv');
const fs = require('fs');
var rooms = {};
var spyfall1data = [];
var spyfall2data = [];
var custom1data = [];

// creaet the express app
var app = express();

// using neat csv, load in our csv data into arrays with objects in them
fs.readFile('Storage/spyfall_1.csv', async (err, data) => {
    if (err) return console.error(err);
    
    let temp_data = await neatCsv(data);

    for(i = 0; i < temp_data.length; i++) {
        spyfall1data.push(temp_data[i]);
    }
});
fs.readFile('Storage/spyfall_2.csv', async (err, data) => {
    if (err) return console.error(err);
    
    let temp_data = await neatCsv(data);

    for(i = 0; i < temp_data.length; i++) {
        spyfall2data.push(temp_data[i]);
    }
});
fs.readFile('Storage/custom_1.csv', async (err, data) => {
    if (err) return console.error(err);
    
    let temp_data = await neatCsv(data);

    for(i = 0; i < temp_data.length; i++) {
        custom1data.push(temp_data[i]);
    }
});

// This is the creation of our server
// We are telling our app to listen to port 80!
var server = app.listen(80, () => {
    console.log("Listening to port 80");
});

// Now we are feeding our app the folder containing all of our frontend pages
// It will default to using the 'Index.html' as a homepage
app.use(express.static('frontend'));

// Adding socket.io to our web server
var io = socket(server);
io.on('connection', socket => { 
    console.log("New connection from " + socket.id);
    
    // When a user clicks the 'create' button on the website, this will run
    socket.on('create', data => {

        let key_to_send = keyCreator();

        // set up the preferences of the room based on the create room screen choices
        rooms[key_to_send]["prefs"] = {};
        rooms[key_to_send]["players"] = {};
        rooms[key_to_send]["prefs"].spy1on = data.spyfall1on;
        rooms[key_to_send]["prefs"].spy2on = data.spyfall2on;
        rooms[key_to_send]["prefs"].matchtime = data.time;
        rooms[key_to_send]["prefs"].owner = data.name;

        console.log(JSON.stringify(rooms[key_to_send]["prefs"].matchtime));
        // emit the created key back to the frontend
        io.to(data.source_socket).emit('create', {
            back_data: data,
            key: key_to_send
        });
    });

    // When a user clicks the 'join' button on the website, this will run
    socket.on('join', data => {

        // if the room doesn't exist...
        if(!rooms[data.join_key]) {
            return io.to(data.source_socket).emit('no_key_error', data.join_key);
            
        } else {
            io.to(data.source_socket).emit('join', {
                back_data: data,
                key: data.join_key
            });
        }
    });

    // when a player enters the game_room, this will run
    socket.on('load_players', data => {
        // If the room they are trying to load doesnt exist
        if(!rooms[data.key]) {
            io.to(data.source_socket).emit('no_key_error', data.key);
            return;
        }

        // put the players socket and name into the room
        rooms[data.key]["players"][data.source_socket] = {};
        rooms[data.key]["players"][data.source_socket].name = data.name;

        // reload the players with the updated information
        for(i=0; i < Object.keys(rooms[data.key]["players"]).length; i++) {
            io.to((Object.keys(rooms[data.key]["players"]))[i]).emit('load_players', {
                player_sockets: Object.keys(rooms[data.key]["players"]),
                player_names: Object.values(rooms[data.key]["players"])
            });
        }
        
    });

    // when a user clicks "start game" this will get run
    socket.on('start_game', data => {

        // array to store the locations and roles that are in play
        let temp_locations = [];
        let temp_roles = [];

        // pushing to the array above
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

        // choose a location from the list at random
        let chosen_location = temp_locations[Math.floor(Math.random() * temp_locations.length)];
        /*
        // add the corresponding roles for the locations that are in play.
        for(i=0; i < temp_locations.length; i++) {
            if(spyfall1data[i].location == chosen_location) {
                temp_roles.push((spyfall1data[i].role1));
                temp_roles.push((spyfall1data[i].role2));
                temp_roles.push((spyfall1data[i].role3));
                temp_roles.push((spyfall1data[i].role4));
                temp_roles.push((spyfall1data[i].role5));
                temp_roles.push((spyfall1data[i].role6));
                temp_roles.push((spyfall1data[i].role7));
                break;
            }
            if(spyfall2data[i].location == chosen_location) {
                temp_roles.push((spyfall2data[i].role1));
                temp_roles.push((spyfall2data[i].role2));
                temp_roles.push((spyfall2data[i].role3));
                temp_roles.push((spyfall2data[i].role4));
                temp_roles.push((spyfall2data[i].role5));
                temp_roles.push((spyfall2data[i].role6));
                temp_roles.push((spyfall2data[i].role7));
                temp_roles.push((spyfall2data[i].role8));
                temp_roles.push((spyfall2data[i].role9));
                
                break;
            }
        }*/

        // choose a spy from the numer of sockets connected to the room
        let spy_num = Math.floor(Math.random() *  Object.keys(rooms[data.key]["players"]).length);

        console.log(chosen_location);
        // here we will emit back to the sockets the information
        for(i=0; i < Object.keys(rooms[data.key]["players"]).length; i++) {

            if(i == spy_num) { // if the current for loop is on the person chosen to be the spy
                io.to((Object.keys(rooms[data.key]["players"]))[i]).emit('start_game', {
                    location: chosen_location,
                    role: "spy"
                });
            } else { // else, choose a random role from the chosen location
                io.to((Object.keys(rooms[data.key]["players"]))[i]).emit('start_game', {
                    location: chosen_location,
                    role: "placeholder"
                });
            }
            
        }
    });

    // ran whenever a socket disconnects
    socket.on('disconnect', () => {
        for(let key in rooms) {
            // if that player is connected to a valid room....
            if(rooms[key]["players"][socket.id]) {
                // then delete them from that room....
                delete rooms[key]["players"][socket.id];

                // and update the list of players for everyone else in the room.
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



// Function to create a unique five letter key.
function keyCreator() {
    let alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
    "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

    let temp_key = alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)];
     
    if(rooms[temp_key]) {
        // if the key already exists, we got some nice recursion
        keyCreator();
    } else {
        // otherwise, create this area in the rooms object
        rooms[temp_key] = {};
        return temp_key;
    }
}