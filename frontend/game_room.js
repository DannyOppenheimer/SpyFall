(() => {
	var socket_link = io.connect('https://spyfall.groups.id:443/');

	var page_info = location.search.substring(1).split('&');

	var room_key = page_info[0];
	var name = page_info[1];

	var time = 0;
	var time_cell = document.getElementById('time');
	var countDown = 0;

	var gamestate;

	document.getElementById('title').innerHTML = 'Room Key: ' + room_key;
	document.getElementById('locations').style.display = 'none';
	document.getElementById('location_reference').style.display = 'none';
	document.getElementById('hide_bar').style.display = 'none';
	document.getElementById('player_title').innerHTML = 'Joined Players:';

	socket_link.on('connect', () => {
		socket_link.emit('load_players', {
			key: room_key,
			source_socket: socket_link.id,
			name: name
		});

		document.getElementById('game_start').addEventListener('click', () => {
			socket_link.emit('start_game', {
				key: room_key
			});
		});

		document.getElementById('game_stop').addEventListener('click', () => {
			socket_link.emit('game_stop', room_key);
		});

		document.getElementById('home').addEventListener('click', () => {
			window.location = '/';
		});
	});

	socket_link.on('load_players', data => {
		document.getElementById('player_reference').innerHTML = '';

		for (i = 0; i < data.player_names.length; i++) {
			let new_div = document.createElement('DIV');
			new_div.innerHTML = data.player_names[i].name.split('%20').join(' ');
			new_div.className = 'location_cell';
			new_div.style.borderColor = '#fffaea';
			new_div.addEventListener('click', () => {
				if (gamestate == 'up') {
					if (new_div.style.textDecoration == 'line-through') {
						new_div.style.color = 'white';
						new_div.style.borderColor = '#fffaea';
						new_div.style.textDecoration = 'none';
					} else {
						new_div.style.color = 'gray';
						new_div.style.borderColor = 'gray';
						new_div.style.textDecoration = 'line-through';
					}
				}
			});
			document.getElementById('player_reference').appendChild(new_div);
		}
	});

	socket_link.on('start_game', data => {
		document.getElementById('locations').style.display = 'block';
		document.getElementById('locations').innerHTML = '';
		document.getElementById('location_reference').style.display = 'block';
		document.getElementById('hide_bar').style.display = 'block';
		document.getElementById('player_title').innerHTML = 'Player Reference:';

		if (data.role == 'spy') {
			document.getElementById('spy_message').innerHTML = 'You are the <strong>Spy</strong>!<br>';
			document.getElementById('location').innerHTML = 'Guess the location based on the questions asked.';
		} else {
			document.getElementById('spy_message').innerHTML = 'You are <strong>not</strong> the Spy!<br>';
			document.getElementById('location').innerHTML = 'You are at the <strong>' + data.location + '</strong><br>';
			document.getElementById('role').innerHTML = 'Your role is a ' + data.role;
		}

		for (i = 0; i < data.locations.length; i++) {
			let new_div = document.createElement('DIV');
			new_div.innerHTML = data.locations[i];
			new_div.className = 'location_cell';
			new_div.style.borderColor = '#fffaea';
			new_div.addEventListener('click', () => {
				if (new_div.style.textDecoration == 'line-through') {
					new_div.style.color = 'white';
					new_div.style.borderColor = '#fffaea';
					new_div.style.textDecoration = 'none';
				} else {
					new_div.style.color = 'gray';
					new_div.style.borderColor = 'gray';
					new_div.style.textDecoration = 'line-through';
				}
			});
			document.getElementById('locations').appendChild(new_div);
		}

		// set a count down time with a total minutes that the user specified when creating the room
		time = data.time;
		countDown = time * 60;
	});

	socket_link.on('game_stop', data => {
		document.getElementById('time').innerHTML = 'Waiting for game to start...';
		document.getElementById('location').innerHTML = '';
		document.getElementById('spy_message').innerHTML = '';
		document.getElementById('location').innerHTML = '';
		document.getElementById('role').innerHTML = '';

		document.getElementById('locations').style.display = 'none';
		document.getElementById('location_reference').style.display = 'none';
		document.getElementById('hide_bar').style.display = 'none';
		document.getElementById('player_title').innerHTML = 'Joined Players:';

		let players = document.getElementById('player_reference').childNodes;
		for (i = 0; i < players.length; i++) {
			players[i].style.color = 'white';
			players[i].style.borderColor = '#fffaea';
			players[i].style.textDecoration = 'none';
		}
	});

	socket_link.on('no_key_error', () => {
		document.getElementById('title').innerHTML = 'The room <strong>' + room_key + '</strong> does not exist!';

		let game_div = document.getElementById('game_content');
		while (game_div.firstChild) {
			game_div.removeChild(game_div.firstChild);
		}
	});

	socket_link.on('event_tick', data => {
		gamestate = data.room_up;
		if (data.room_up == 'down') return;

		let min = Math.floor((countDown % 3600) / 60);
		let sec = Math.floor((countDown % 3600) % 60);

		if (min + sec <= 0) {
			socket_link.emit('game_stop', room_key);
			clock.clearInterval(0);
		}

		time_cell.innerHTML = (min = min < 10 ? '0' + min : min) + ':' + (sec = sec < 10 ? '0' + sec : sec);
		countDown--;
	});
})();
