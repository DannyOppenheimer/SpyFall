var socket_link = io.connect('http://108.28.114.48:80/');

document.getElementById("title").innerHTML = "Room Key: " + location.search.substring(1);

socket_link.on('connect', () => {
    socket_link.emit('load_players', {
        key: location.search.substring(1),
        source_socket: socket_link.id
    })
});

socket_link.on('load_players', back_data => {

    document.getElementById("players").innerHTML = "";

    for (i = 0; i < (back_data.player_sockets).length; i++) {

        let table = document.getElementById("players");

        let current_row = table.insertRow(i);

        let player_cell = current_row.insertCell(0);
        player_cell.innerHTML = (back_data.player_sockets)[i];

    }

});

document.getElementById("game_start").addEventListener("click", () => {
    //start the game
});

document.getElementById("game_stop").addEventListener("click", () => {
    function getConnectedSockets() {
        return Object.values(io.of("/room_" + back_data.key).connected);
    }
    getConnectedSockets().forEach(function(s) {
        s.disconnect(true);
    });
    window.location = "index.html";
});
