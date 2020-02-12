(() => {
	var socket_link = io.connect('https://spyfall.groups.id:443/');

	var room_key = location.search.substring(1).split('&')[0];
	var name = location.search.substring(1).split('&')[1];

	var time = 0;
	var time_cell = document.getElementById('time');
	var countDown = 0;

	document.getElementById('title').innerHTML = 'Room Key: ' + room_key;
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
		let table = document.createElement('TABLE');

		let columns = 3;
		let count = 0;
		let row = table.insertRow();

		for (let i of data.player_names) {
			let new_cell = row.insertCell();
			new_cell.innerHTML = i;
			new_cell.className = 'player_cell';
			new_cell.style.borderColor = '#fffaea';
			new_cell.addEventListener('click', () => {
				if (new_cell.style.textDecoration == 'line-through') {
					new_cell.style.color = 'white';
					new_cell.style.borderColor = '#fffaea';
					new_cell.style.textDecoration = 'none';
				} else {
					new_cell.style.color = 'gray';
					new_cell.style.borderColor = 'gray';
					new_cell.style.textDecoration = 'line-through';
				}
			});

			++count;
			if (count % columns == 0) {
				row = table.insertRow();
			}
		}

		document.getElementById('player_reference').appendChild(table);
	});

	socket_link.on('start_game', data => {
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

		//loop to add locations

		let columns = 3;
		let count = 0;
		let table = document.getElementById('location_table');
		let row = table.insertRow();

		for (let i of data.locations) {
			let new_cell = row.insertCell();
			new_cell.innerHTML = i;
			new_cell.className = 'location_cell';
			new_cell.style.borderColor = '#fffaea';
			new_cell.addEventListener('click', () => {
				if (new_cell.style.textDecoration == 'line-through') {
					new_cell.style.color = 'white';
					new_cell.style.borderColor = '#fffaea';
					new_cell.style.textDecoration = 'none';
				} else {
					new_cell.style.color = 'gray';
					new_cell.style.borderColor = 'gray';
					new_cell.style.textDecoration = 'line-through';
				}
			});

			++count;
			if (count % columns == 0) {
				row = table.insertRow();
			}
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

		document.getElementById('location_reference').style.display = 'none';
		document.getElementById('hide_bar').style.display = 'none';
		document.getElementById('player_title').innerHTML = 'Joined Players:';
		document.getElementById('location_table').innerHTML = '';

		let players = document.getElementById('player_reference').childNodes;
		for (i of players) {
			i.style.color = 'white';
			i.style.borderColor = '#fffaea';
			i.style.textDecoration = 'none';
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
			//socket_link.emit('game_stop', room_key);
			time_cell.innerHTML = 'Times up!';
			clock.clearInterval(0);
		}

		time_cell.innerHTML = (min = min < 10 ? '0' + min : min) + ':' + (sec = sec < 10 ? '0' + sec : sec);
		countDown--;
	});
})();
