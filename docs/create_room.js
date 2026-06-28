(() => {
	// Connect to the backend server
	var socket_link = io('https://spyfall-production-5f2b.up.railway.app');

	var params = new URLSearchParams(location.search);
	var name = params.get('name') || '';

	socket_link.on('connect', () => {
		document.getElementById('create_room_button').addEventListener('click', () => {
			// When the user clicks the Create button, emit their preferences to the backend server
			socket_link.emit('create', {
				spyfall1on: isPackOn('spyfall1label'),
				spyfall2on: isPackOn('spyfall2label'),
				custom1on: isPackOn('custom1label'),
				time: getMatchMinutes(),
				name: name
			});
		});
	});

	// When the server sends back its response, go to the game room (carrying the owner token)
	socket_link.on('create', back_data => {
		let query = new URLSearchParams({
			key: back_data.key,
			name: name,
			token: back_data.token
		});
		window.location = 'game_room?' + query.toString();
	});

	socket_link.on('server_busy', () => {
		alert('The server is busy right now. Please try again in a moment.');
	});

	// Set up the three location-pack toggles. State is tracked on a data attribute,
	// not by string-matching innerHTML, so display markup can change freely.
	setupToggle('spyfall1label', 'Spyfall 1 Locations', true);
	setupToggle('spyfall2label', 'Spyfall 2 Locations', true);
	setupToggle('custom1label', 'Extra Spyfall Pack', false);

	document.getElementById('back').addEventListener('click', () => {
		window.location = '/';
	});

	function setupToggle(id, labelText, defaultOn) {
		let el = document.getElementById(id);
		el.dataset.on = defaultOn ? 'true' : 'false';
		renderToggle(el, labelText);
		el.addEventListener('click', () => {
			el.dataset.on = el.dataset.on === 'true' ? 'false' : 'true';
			renderToggle(el, labelText);
		});
	}

	function renderToggle(el, labelText) {
		if (el.dataset.on === 'true') {
			el.textContent = labelText;
		} else {
			el.innerHTML = '<del></del>';
			el.querySelector('del').textContent = labelText;
		}
	}

	function isPackOn(id) {
		return document.getElementById(id).dataset.on === 'true';
	}

	function getMatchMinutes() {
		let list = document.getElementById('list');
		return parseInt(list.options[list.selectedIndex].value, 10);
	}
})();
