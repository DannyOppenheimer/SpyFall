'use strict';

const express = require('express');
const app = express();
const https = require('https');

const helmet = require('helmet');
const serve_static = require('serve-static');
const compression = require('compression');
app.use(helmet());
app.use(compression());

const socket = require('socket.io');
const fs = require('fs');

var rooms = {};

const json1 = JSON.parse(fs.readFileSync('./Storage/spyfall_1.json', 'utf8'));
const json2 = JSON.parse(fs.readFileSync('./Storage/spyfall_2.json', 'utf8'));
const json3 = JSON.parse(fs.readFileSync('./Storage/custom_1.json', 'utf-8'));

const https_key_config = https.createServer(
	{
		key: fs.readFileSync('/etc/letsencrypt/live/spyfall.groups.id/privkey.pem'),
		cert: fs.readFileSync('/etc/letsencrypt/live/spyfall.groups.id/fullchain.pem')
	},
	app
);

const server = https_key_config.listen(443, () => {
	console.log('spyfall.groups.id is listening on port 443!');
});

// feeding our app the folder containing all of our frontend pages
app.use(
	serve_static('frontend', {
		extensions: ['html'],
		dotfiles: 'deny', // strictly deny all access to any directory containing a "." in case we want to hide files
		index: ['index.html']
	})
);

const io = socket(server);

io.on('connection', socket => {
	console.log('New connection from socket ' + socket.id);

	// When a user clicks the 'create' button on the website, this will run
	socket.on('create', data => {
		let key_to_send = keyCreator();

		// set up the preferences of the room based on the create room screen choices
		rooms[key_to_send]['prefs'] = {};
		rooms[key_to_send]['players'] = {};
		rooms[key_to_send]['prefs'].spy1on = data.spyfall1on;
		rooms[key_to_send]['prefs'].spy2on = data.spyfall2on;
		rooms[key_to_send]['prefs'].cus1on = data.custom1on;
		rooms[key_to_send]['prefs'].matchtime = data.time;
		rooms[key_to_send]['prefs'].owner = data.name;
		rooms[key_to_send]['prefs'].gamestate = 'down';

		// emit the created key back to the frontend
		io.to(data.source_socket).emit('create', {
			back_data: data,
			key: key_to_send
		});
	});

	// When a user clicks the 'join' button on the website, this will run
	socket.on('join', data => {
		// if the room doesn't exist...
		if (!rooms[data.join_key]) {
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
		if (!rooms[data.key]) {
			io.to(data.source_socket).emit('no_key_error', data.key);
			return;
		}

		// put the players socket and name into the room
		rooms[data.key]['players'][data.source_socket] = {};
		rooms[data.key]['players'][data.source_socket].name = data.name;

		// reload the players with the updated information
		for (i = 0; i < Object.keys(rooms[data.key]['players']).length; i++) {
			io.to(Object.keys(rooms[data.key]['players'])[i]).emit('load_players', {
				player_sockets: Object.keys(rooms[data.key]['players']),
				player_names: Object.values(rooms[data.key]['players']),
				gamestate: rooms[data.key]['prefs'].gamestate
			});
		}
	});

	// when a user clicks "start game" this will get run
	socket.on('start_game', data => {
		// array to store the locations and roles that are in play
		let temp_locations = getLocations(rooms[data.key]['prefs'].spy1on, rooms[data.key]['prefs'].spy2on, rooms[data.key]['prefs'].cus1on);

		let chosen_location = temp_locations[Math.floor(Math.random() * temp_locations.length)];

		let temp_roles = getRoles(chosen_location);

		rooms[data.key]['prefs'].gamestate = 'up';

		// choose a spy from the numer of sockets connected to the room
		let spy_num = Math.floor(Math.random() * Object.keys(rooms[data.key]['players']).length);
		for (i = 0; i < Object.keys(rooms[data.key]['players']).length; i++) {
			if (i == spy_num) {
				// if the current for loop is on the person chosen to be the spy
				io.to(Object.keys(rooms[data.key]['players'])[i]).emit('start_game', {
					location: chosen_location,
					role: 'spy',
					time: rooms[data.key]['prefs'].matchtime,
					locations: temp_locations
				});
			} else {
				// else, choose a random role from the chosen location
				io.to(Object.keys(rooms[data.key]['players'])[i]).emit('start_game', {
					location: chosen_location,
					role: temp_roles[Math.floor(Math.random() * temp_roles.length)],
					time: rooms[data.key]['prefs'].matchtime,
					locations: temp_locations
				});
			}
		}
	});

	socket.on('game_stop', data => {
		rooms[data]['prefs'].gamestate = 'down';

		for (i = 0; i < Object.keys(rooms[data]['players']).length; i++) {
			io.to(Object.keys(rooms[data]['players'])[i]).emit('game_stop', data);
		}
	});

	// ran whenever a socket disconnects
	socket.on('disconnect', () => {
		for (let key in rooms) {
			// if that player is connected to a valid room....
			if (rooms[key]['players'][socket.id]) {
				// then delete them from that room....
				delete rooms[key]['players'][socket.id];
				// and update the list of players for everyone else in the room.
				for (i = 0; i < Object.keys(rooms[key]['players']).length; i++) {
					io.to(Object.keys(rooms[key]['players'])[i]).emit('load_players', {
						player_sockets: Object.keys(rooms[key]['players']),
						player_names: Object.values(rooms[key]['players'])
					});
				}
			}
		}
		for (let key in rooms) {
			if (objectIsEmpty(rooms[key]['players'])) {
			}
		}
	});
});

// Function to create a unique five letter key.
function keyCreator() {
	let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

	let temp_key =
		alphabet[Math.floor(Math.random() * 25)] +
		alphabet[Math.floor(Math.random() * 25)] +
		alphabet[Math.floor(Math.random() * 25)] +
		alphabet[Math.floor(Math.random() * 25)] +
		alphabet[Math.floor(Math.random() * 25)];

	if (rooms[temp_key]) {
		// if the key already exists, we got some nice recursion
		keyCreator();
	} else {
		// otherwise, create this area in the rooms object
		rooms[temp_key] = {};
		return temp_key;
	}
}

function objectIsEmpty(obj) {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) return false;
	}
	return true;
}

function getLocations(spy1, spy2, cus1) {
	let temp_array = [];
	if (spy1) {
		temp_array.push(Object.keys(json1));
	}
	if (spy2) {
		temp_array.push(Object.keys(json2));
	}
	if (cus1) {
		temp_array.push(Object.keys(json3));
	}
	return [].concat.apply([], temp_array);
}

function getRoles(location) {
	let temp_array = [];

	for (let key in json1) {
		if (key == location) {
			temp_array.push(json1[key].role1);
			temp_array.push(json1[key].role2);
			temp_array.push(json1[key].role3);
			temp_array.push(json1[key].role4);
			temp_array.push(json1[key].role5);
			temp_array.push(json1[key].role6);
			temp_array.push(json1[key].role7);
		}
	}
	for (let key in json2) {
		if (key == location) {
			temp_array.push(json2[key].role1);
			temp_array.push(json2[key].role2);
			temp_array.push(json2[key].role3);
			temp_array.push(json2[key].role4);
			temp_array.push(json2[key].role5);
			temp_array.push(json2[key].role6);
			temp_array.push(json2[key].role7);
			temp_array.push(json2[key].role8);
			temp_array.push(json2[key].role9);
		}
	}

	for (let key in json3) {
		if (key == location) {
			temp_array.push(json3[key].role1);
			temp_array.push(json3[key].role2);
			temp_array.push(json3[key].role3);
			temp_array.push(json3[key].role4);
			temp_array.push(json3[key].role5);
			temp_array.push(json3[key].role6);
			temp_array.push(json3[key].role7);
		}
	}

	return [].concat.apply([], temp_array);
}

let uptime = 0;
let last_sec = 0;

// Get second precision down to a tenth of a second
setInterval(() => {
	var today = new Date();

	let second = today.getSeconds();

	if (last_sec != second) {
		last_sec = second;
		++uptime;
		for (let key in rooms) {
			for (i = 0; i < Object.keys(rooms[key]['players']).length; i++) {
				io.to(Object.keys(rooms[key]['players'])[i]).emit('event_tick', {
					uptime: uptime,
					to_socket: Object.keys(rooms[key]['players'])[i],
					room_up: rooms[key]['prefs'].gamestate
				});
			}
		}
	}
}, 100);
