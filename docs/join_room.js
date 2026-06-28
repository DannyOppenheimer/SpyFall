(() => {
	var socket_link = io('https://spyfall-production-5f2b.up.railway.app');

	var name = location.search.substring(1);

	document.getElementById('back').addEventListener('click', () => {
		window.location = '/';
	});

	socket_link.on('connect', () => {
		document.getElementById('join_room_button').addEventListener('click', () => {
			socket_link.emit('join', {
				source_socket: socket_link.id,
				join_key: document.getElementById('key_enter').value.toLowerCase()
			});
		});
	});

	socket_link.on('join', data => {
		window.location = 'game_room?' + data.key + '&' + name;
	});

	socket_link.on('no_key_error', data => {
		document.getElementById('no_key_err').innerHTML = '<br>The room "' + data + '" does not exist!';
	});
})();
