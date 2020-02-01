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

function game_start() {
    //put shit here to start the game
}

function game_stop() {
    //put shit here to stop the game 
}