(() => {
	var socket_link = io('https://spyfall-production-5f2b.up.railway.app');

	var params = new URLSearchParams(location.search);
	var name = params.get('name') || '';

	document.getElementById('back').addEventListener('click', () => {
		window.location = '/';
	});

	socket_link.on('connect', () => {
		document.getElementById('join_room_button').addEventListener('click', () => {
			socket_link.emit('join', {
				join_key: document.getElementById('key_enter').value.toLowerCase().trim()
			});
		});
	});

	socket_link.on('join', data => {
		let query = new URLSearchParams({ key: data.key, name: name });
		window.location = 'game_room?' + query.toString();
	});

	socket_link.on('no_key_error', data => {
		document.getElementById('no_key_err').textContent = 'The room "' + data + '" does not exist!';
	});
})();
