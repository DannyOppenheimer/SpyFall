var socket_link = io.connect('http://108.28.114.48:80/');

function backToMain() {
    window.location = "index.html";
}



document.getElementById("join_room_button").addEventListener('click', () => {
    socket_link.emit('join', {
        source_socket: socket_link.id,
        join_key: document.getElementById("key_enter").value
    });
});

socket_link.on('join', data => {

    window.location = "game_room.html?" + data.key;
});