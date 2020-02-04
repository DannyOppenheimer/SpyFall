(() => {
    var socket_link = io.connect('http://108.28.114.48:80/');

    var name = location.search.substring(1);
    socket_link.on('connect', () => {
        document.getElementById("join_room_button").addEventListener('click', () => {
            console.log('bruh');
            socket_link.emit('join', {
                source_socket: socket_link.id,
                join_key: document.getElementById("key_enter").value
            });
        });

        document.getElementById("back").addEventListener('click', () => {
            window.location = "index.html";
        });        
    });

    socket_link.on('join', data => {

        window.location = "game_room.html?" + data.key + "&" + name;
    });
})();

