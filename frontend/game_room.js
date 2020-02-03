(() => {
    var socket_link = io.connect('http://108.28.114.48:80/');

    var page_info = location.search.substring(1).split("&");

    var room_key = page_info[0];
    var name = page_info[1]

    document.getElementById("title").innerHTML = "Room Key: " + room_key;

    socket_link.on('connect', () => {
        
        socket_link.emit('load_players', {
            key: room_key,
            source_socket: socket_link.id,
            name: name,
        });

        document.getElementById("game_start").addEventListener("click", () => {
            socket_link.emit('start_game', {
                key: room_key
            });
        });
    });

    socket_link.on('load_players', back_data => {

        document.getElementById("players").innerHTML = "";

        for (i = 0; i < (back_data.player_names).length; i += 1) {

            let table = document.getElementById("players");

            let current_row = table.insertRow(i);

            let player_cell = current_row.insertCell(0);

            player_cell.innerHTML = JSON.stringify((back_data.player_names)[i]).replace("\{\"name\":\"", "").replace("\"\}", "")
        }

    });

    socket_link.on('start_game', back_data => {
        document.getElementById("role_location").innerHTML = "";
       
        if(back_data.role == "spy") {
            document.getElementById("role_location").innerHTML = "You are the <strong>Spy</strong>!<br>";
             document.getElementById("role_location").innerHTML += "Try to guess the location from the other players' questions!";
        } else {
            document.getElementById("role_location").innerHTML = "You are <strong>not</strong> the Spy!<br>";
            document.getElementById("role_location").innerHTML += "You are at the <strong>" + JSON.stringify(back_data.location).replace("\"", "").replace("\"", "") + "</strong><br>";
            document.getElementById("role_location").innerHTML += "Your role is a " + JSON.stringify(back_data.role).replace("\"", "").replace("\"", "") ;
        }
        
       
    });

    socket_link.on('no_key_error', data => {

        document.getElementById("title").innerHTML = "The key " + room_key + " does not exist!";
    });

    document.getElementById("game_stop").addEventListener("click", () => {
        window.location = "index.html";
    });
})();





