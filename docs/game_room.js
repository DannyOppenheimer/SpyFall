(() => {
	var socket_link = io('https://spyfall-production-5f2b.up.railway.app');

	var params = new URLSearchParams(location.search);
	var room_key = params.get('key') || '';
	var name = params.get('name') || '';
	var token = params.get('token') || '';

	var countDown = 0;
	var timerInterval = null;
	var gameup = false;
	var isOwner = false;

	var time_cell = document.getElementById('time');
	var startBtn = document.getElementById('game_start');
	var stopBtn = document.getElementById('game_stop');

	document.getElementById('title').textContent = 'Room Key: ' + room_key;
	document.getElementById('location_reference').style.display = 'none';
	document.getElementById('hide_bar').style.display = 'none';
	document.getElementById('player_title').textContent = 'Joined Players:';

	// Owner-only controls stay hidden until the server confirms we own the room
	startBtn.style.display = 'none';
	stopBtn.style.display = 'none';

	socket_link.on('connect', () => {
		socket_link.emit('load_players', {
			key: room_key,
			name: name,
			token: token
		});
	});

	startBtn.addEventListener('click', () => {
		socket_link.emit('start_game', { key: room_key });
	});

	stopBtn.addEventListener('click', () => {
		socket_link.emit('game_stop', { key: room_key });
	});

	document.getElementById('home').addEventListener('click', () => {
		window.location = '/';
	});

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function renderTime() {
		if (countDown <= 0) {
			time_cell.textContent = "Time's up!";
			stopTimer();
			return;
		}
		let min = Math.floor((countDown % 3600) / 60);
		let sec = Math.floor((countDown % 3600) % 60);
		time_cell.textContent = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
		countDown--;
	}

	// Toggle a "crossed off" style on a clickable cell while a game is running
	function makeStrikeable(cell, requireGameUp) {
		cell.addEventListener('click', () => {
			if (requireGameUp && !gameup) return;
			if (cell.style.textDecoration == 'line-through') {
				cell.style.color = 'white';
				cell.style.borderColor = '#fffaea';
				cell.style.textDecoration = 'none';
			} else {
				cell.style.color = 'gray';
				cell.style.borderColor = 'gray';
				cell.style.textDecoration = 'line-through';
			}
		});
	}

	socket_link.on('load_players', data => {
		gameup = data.gamestate == 'up';
		isOwner = !!data.owner_socket && data.owner_socket === socket_link.id;
		startBtn.style.display = isOwner ? '' : 'none';
		stopBtn.style.display = isOwner ? '' : 'none';

		let container = document.getElementById('player_reference');
		container.textContent = '';
		let table = document.createElement('TABLE');

		let columns = 3;
		let count = 0;
		let row = table.insertRow();

		for (let i of data.player_names) {
			let new_cell = row.insertCell();
			new_cell.textContent = i; // textContent, not innerHTML, to prevent XSS via player names
			new_cell.className = 'player_cell';
			new_cell.style.borderColor = '#fffaea';
			makeStrikeable(new_cell, true);

			++count;
			if (count % columns == 0) {
				row = table.insertRow();
			}
		}

		container.appendChild(table);
	});

	socket_link.on('start_game', data => {
		gameup = true;
		document.getElementById('location_reference').style.display = 'block';
		document.getElementById('hide_bar').style.display = 'block';
		document.getElementById('player_title').textContent = 'Player Reference:';

		let spy_message = document.getElementById('spy_message');
		let location_el = document.getElementById('location');
		let role_el = document.getElementById('role');

		if (data.role == 'spy') {
			spy_message.innerHTML = 'You are the <strong>Spy</strong>!<br>';
			location_el.textContent = 'Guess the location based on the questions asked.';
			role_el.textContent = '';
		} else {
			spy_message.innerHTML = 'You are <strong>not</strong> the Spy!<br>';
			// build with textContent so the location string can never inject markup
			location_el.innerHTML = 'You are at the <strong></strong><br>';
			location_el.querySelector('strong').textContent = data.location;
			role_el.textContent = 'Your role is a ' + data.role;
		}

		//loop to add locations

		let columns = 3;
		let count = 0;
		let table = document.getElementById('location_table');
		table.innerHTML = '';
		let row = table.insertRow();

		for (let i of data.locations) {
			let new_cell = row.insertCell();
			new_cell.textContent = i;
			new_cell.className = 'location_cell';
			new_cell.style.borderColor = '#fffaea';
			makeStrikeable(new_cell, false);

			++count;
			if (count % columns == 0) {
				row = table.insertRow();
			}
		}

		// run a local countdown with the total minutes the room was created with
		stopTimer();
		countDown = (parseInt(data.time, 10) || 0) * 60;
		renderTime();
		timerInterval = setInterval(renderTime, 1000);
	});

	// Joined while a round was already running: wait for the next one
	socket_link.on('round_in_progress', () => {
		gameup = false;
		stopTimer();
		time_cell.textContent = 'Round in progress, please wait...';
		document.getElementById('location_reference').style.display = 'none';
		document.getElementById('hide_bar').style.display = 'none';
		document.getElementById('spy_message').textContent = '';
		document.getElementById('location').textContent = '';
		document.getElementById('role').textContent = '';
	});

	socket_link.on('game_stop', () => {
		gameup = false;
		stopTimer();
		time_cell.textContent = 'Waiting for game to start...';
		document.getElementById('location').textContent = '';
		document.getElementById('spy_message').textContent = '';
		document.getElementById('role').textContent = '';

		document.getElementById('location_reference').style.display = 'none';
		document.getElementById('hide_bar').style.display = 'none';
		document.getElementById('player_title').textContent = 'Joined Players:';
		document.getElementById('location_table').innerHTML = '';

		// clear any crossed-off players
		let cells = document.querySelectorAll('#player_reference .player_cell');
		for (let c of cells) {
			c.style.color = 'white';
			c.style.borderColor = '#fffaea';
			c.style.textDecoration = 'none';
		}
	});

	socket_link.on('no_key_error', () => {
		document.getElementById('title').textContent = 'The room "' + room_key + '" does not exist!';

		let game_div = document.getElementById('game_content');
		while (game_div.firstChild) {
			game_div.removeChild(game_div.firstChild);
		}
	});

	socket_link.on('start_error', msg => {
		time_cell.textContent = msg;
	});

	// owner-only actions are gated server-side too; ignore client-side if it ever fires
	socket_link.on('not_owner', () => {});
})();
