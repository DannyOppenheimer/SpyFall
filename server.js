const express = require('express');
const http = require('http');
const app = express();

const helmet = require('helmet');
const serve_static = require('serve-static');
const compression = require('compression');
app.use(helmet());
app.use(compression());

const socket = require('socket.io');
const fs = require('fs');
const crypto = require('crypto');

var rooms = {};

const json1 = JSON.parse(fs.readFileSync('./Storage/spyfall_1.json', 'utf8'));
const json2 = JSON.parse(fs.readFileSync('./Storage/spyfall_2.json', 'utf8'));
const json3 = JSON.parse(fs.readFileSync('./Storage/custom_1.json', 'utf-8'));

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

// feeding our app the folder containing all of our frontend pages
app.use(
	serve_static('docs', {
		extensions: ['html'],
		dotfiles: 'deny',
		index: ['index.html']
	})
);

const io = socket(server, {
	cookie: false,
	cors: {
		origin: 'https://spyfall.dannyoppenheimer.com',
		methods: ['GET', 'POST']
	}
});

// ---- Limits / config ----
const MAX_ROOMS = 5000; // hard cap to prevent memory-exhaustion abuse
const CREATE_COOLDOWN_MS = 1000; // minimum time between 'create' events per socket
const ROOM_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // purge rooms inactive for > 2h
const ALLOWED_TIMES = [5, 6, 7, 8, 9, 10, 15, 20];

io.on('connection', socket => {
	console.log('New connection from socket ' + socket.id);
	socket.last_create = 0;

	// When a user clicks the 'create' button on the website, this will run
	socket.on('create', data => {
		try {
			data = data || {};

			// Rate-limit room creation per socket
			const now = Date.now();
			if (now - socket.last_create < CREATE_COOLDOWN_MS) return;
			socket.last_create = now;

			if (Object.keys(rooms).length >= MAX_ROOMS) {
				return io.to(socket.id).emit('server_busy');
			}

			let key_to_send = keyCreator();
			if (!key_to_send) return io.to(socket.id).emit('server_busy');

			// Secret token that proves room ownership across page loads / refreshes
			const owner_token = crypto.randomBytes(16).toString('hex');

			// set up the preferences of the room based on the create room screen choices
			rooms[key_to_send].prefs = {
				spy1on: !!data.spyfall1on,
				spy2on: !!data.spyfall2on,
				cus1on: !!data.custom1on,
				matchtime: sanitizeTime(data.time),
				owner: typeof data.name === 'string' ? data.name.slice(0, 25) : '',
				ownerToken: owner_token,
				ownerSocket: null,
				gamestate: 'down'
			};
			rooms[key_to_send].players = {};
			rooms[key_to_send].lastActivity = now;

			// emit the created key and owner token back to the creator
			io.to(socket.id).emit('create', {
				back_data: data,
				key: key_to_send,
				token: owner_token
			});
		} catch (err) {
			console.error('create handler error:', err);
		}
	});

	// When a user clicks the 'join' button on the website, this will run
	socket.on('join', data => {
		try {
			const key = data && typeof data.join_key === 'string' ? data.join_key.toLowerCase() : '';
			// if the room doesn't exist...
			if (!rooms[key]) {
				return io.to(socket.id).emit('no_key_error', key);
			}
			io.to(socket.id).emit('join', { back_data: data, key: key });
		} catch (err) {
			console.error('join handler error:', err);
		}
	});

	// when a player enters the game_room, this will run
	socket.on('load_players', data => {
		try {
			const key = data && typeof data.key === 'string' ? data.key : '';
			// If the room they are trying to load doesnt exist
			if (!rooms[key]) {
				return io.to(socket.id).emit('no_key_error', key);
			}

			const room = rooms[key];

			// Claim ownership only if the correct secret token is presented
			if (data.token && room.prefs.ownerToken && data.token === room.prefs.ownerToken) {
				room.prefs.ownerSocket = socket.id;
			}

			// put the players socket and name into the room
			const name = typeof data.name === 'string' && data.name.trim() ? data.name.slice(0, 25) : 'Anonymous';
			room.players[socket.id] = name;
			room.lastActivity = Date.now();

			// join the socket.io room so we can broadcast to everyone at once
			socket.join(key);
			socket.roomKey = key;

			// If a round is already in progress, this player has to wait for the next one
			if (room.prefs.gamestate === 'up') {
				io.to(socket.id).emit('round_in_progress');
			}

			broadcastPlayers(key);
		} catch (err) {
			console.error('load_players handler error:', err);
		}
	});

	// when a user clicks "start game" this will get run
	socket.on('start_game', data => {
		try {
			const key = data && typeof data.key === 'string' ? data.key : '';
			const room = rooms[key];
			if (!room) return;

			// Only the room owner may start the game
			if (socket.id !== room.prefs.ownerSocket) {
				return io.to(socket.id).emit('not_owner');
			}

			// array to store the locations and roles that are in play
			let temp_locations = getLocations(room.prefs.spy1on, room.prefs.spy2on, room.prefs.cus1on);
			if (temp_locations.length === 0) {
				return io.to(socket.id).emit('start_error', 'Select at least one location pack before starting.');
			}

			let chosen_location = temp_locations[Math.floor(Math.random() * temp_locations.length)];

			// shuffle the roles so each player gets a distinct one (dealt without replacement)
			let roles = shuffle(getRoles(chosen_location));

			room.prefs.gamestate = 'up';
			room.lastActivity = Date.now();

			const playerIds = Object.keys(room.players);

			// choose a spy from the players connected to the room
			let spy_num = Math.floor(Math.random() * playerIds.length);

			let roleIndex = 0;
			for (let i = 0; i < playerIds.length; i++) {
				let payload;
				if (i === spy_num) {
					payload = {
						location: chosen_location,
						role: 'spy',
						time: room.prefs.matchtime,
						locations: temp_locations
					};
				} else {
					// hand out the next unused role (wrap around if there are more players than roles)
					const role = roles.length ? roles[roleIndex % roles.length] : 'villager';
					roleIndex++;
					payload = {
						location: chosen_location,
						role: role,
						time: room.prefs.matchtime,
						locations: temp_locations
					};
				}
				io.to(playerIds[i]).emit('start_game', payload);
			}
		} catch (err) {
			console.error('start_game handler error:', err);
		}
	});

	socket.on('game_stop', data => {
		try {
			const key = typeof data === 'string' ? data : data && data.key;
			const room = rooms[key];
			if (!room) return;

			// Only the room owner may stop the game
			if (socket.id !== room.prefs.ownerSocket) {
				return io.to(socket.id).emit('not_owner');
			}

			room.prefs.gamestate = 'down';
			room.lastActivity = Date.now();
			io.to(key).emit('game_stop', key);
		} catch (err) {
			console.error('game_stop handler error:', err);
		}
	});

	// ran whenever a socket disconnects
	socket.on('disconnect', () => {
		try {
			const key = socket.roomKey;
			if (!key || !rooms[key]) return;

			// remove them from that room
			delete rooms[key].players[socket.id];

			// release ownership if the owner left
			if (rooms[key].prefs && rooms[key].prefs.ownerSocket === socket.id) {
				rooms[key].prefs.ownerSocket = null;
			}

			// purge empty rooms immediately, otherwise update everyone else
			if (objectIsEmpty(rooms[key].players)) {
				delete rooms[key];
			} else {
				broadcastPlayers(key);
			}
		} catch (err) {
			console.error('disconnect handler error:', err);
		}
	});
});

// Broadcast the current player list (and ownership / game state) to a whole room at once
function broadcastPlayers(key) {
	const room = rooms[key];
	if (!room) return;
	io.to(key).emit('load_players', {
		player_sockets: Object.keys(room.players),
		player_names: Object.values(room.players),
		gamestate: room.prefs.gamestate,
		owner_socket: room.prefs.ownerSocket
	});
}

// Function to create a unique five letter key.
function keyCreator() {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz';

	for (let attempt = 0; attempt < 100; attempt++) {
		let temp_key = '';
		for (let i = 0; i < 5; i++) {
			temp_key += alphabet[Math.floor(Math.random() * alphabet.length)];
		}
		if (!rooms[temp_key]) {
			// reserve this area in the rooms object
			rooms[temp_key] = {};
			return temp_key;
		}
	}
	// could not find a free key (extremely unlikely unless near MAX_ROOMS)
	return null;
}

function objectIsEmpty(obj) {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) return false;
	}
	return true;
}

// Restrict the match time to one of the allowed values
function sanitizeTime(t) {
	const n = parseInt(t, 10);
	return ALLOWED_TIMES.includes(n) ? n : 8;
}

// Fisher-Yates shuffle (returns a new array)
function shuffle(arr) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function getLocations(spy1, spy2, cus1) {
	let locations = [];
	if (spy1) locations = locations.concat(Object.keys(json1));
	if (spy2) locations = locations.concat(Object.keys(json2));
	if (cus1) locations = locations.concat(Object.keys(json3));
	return locations;
}

function getRoles(location) {
	for (const dataset of [json1, json2, json3]) {
		if (dataset[location]) {
			return Object.values(dataset[location]);
		}
	}
	return [];
}

// Periodically purge stale rooms so the in-memory store can't grow forever.
// Empty rooms are already removed on disconnect; this catches rooms that were
// created but abandoned, or left running and idle for a long time.
setInterval(() => {
	const now = Date.now();
	for (const key in rooms) {
		const room = rooms[key];
		const idle = room.lastActivity ? now - room.lastActivity : 0;
		const empty = !room.players || objectIsEmpty(room.players);
		// long-idle rooms, or empty rooms left untouched for over a minute
		// (the 1-minute grace avoids deleting a room between create and the owner's page load)
		if (idle > ROOM_IDLE_TIMEOUT_MS || (empty && idle > 60 * 1000)) {
			delete rooms[key];
		}
	}
}, 5 * 60 * 1000);
