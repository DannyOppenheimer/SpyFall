(() => {
    var socket_link = io.connect('http://108.28.114.48:80/');

    var page_info = location.search.substring(1).split("&");

    var room_key = page_info[0];
    var name = page_info[1];

    document.getElementById("title").innerHTML = "Room Key: " + room_key;

    socket_link.on('connect', () => {

        socket_link.emit('load_players', {
            key: room_key,
            source_socket: socket_link.id,
            name: name
        });

        document.getElementById("game_start").addEventListener("click", () => {
            socket_link.emit('start_game', {
                key: room_key
            });
        });
    });

    socket_link.on('load_players', data => {

        document.getElementById("players").innerHTML = "";

        for (i = 0; i < (data.player_names).length; i += 1) {

            let table = document.getElementById("players");

            let current_row = table.insertRow(i);

            let player_cell = current_row.insertCell(0);

            player_cell.innerHTML = JSON.stringify((data.player_names)[i]).replace("\{\"name\":\"", "").replace("\"\}", "")
        }
    });

    socket_link.on('start_game', data => {
        if (data.role == "spy") {
            document.getElementById("spy_message").innerHTML = "You are the <strong>Spy</strong>!<br>";
            document.getElementById("location").innerHTML = "Try to guess the location from the other players' questions!";
        } else {
            document.getElementById("spy_message").innerHTML = "You are <strong>not</strong> the Spy!<br>";
            document.getElementById("location").innerHTML = "You are at the <strong>" + JSON.stringify(data.location).replace("\"", "").replace("\"", "") + "</strong><br>";
            document.getElementById("role").innerHTML = "Your role is a " + JSON.parse(data.role).replace("\"", "").replace("\"", "");
        }

        // code for a count down time with a total minutes that the user specified when creating the room
        let time = data.time;
        let time_cell = document.getElementById("time");

        let countDown = (time * 60);
        let clock = setInterval(() => {
            countDown--;
            let min = Math.floor(countDown % 3600 / 60);
            let sec = Math.floor(countDown % 3600 % 60);
          
            if(min + sec <= 0) {
                clearInterval(0);
                window.location = "/";
            }
            //Format : hh:mm:ss
            time_cell.innerHTML = (min=min < 10 ? "0" + min:min) + ":" + (sec = sec <10 ? "0" + sec:sec);
          
          }, 1000);
    
    });

    socket_link.on('no_key_error', () => {

        document.getElementById("title").innerHTML = "The key " + room_key + " does not exist!";
    });

    document.getElementById("game_stop").addEventListener('click', () => {
        window.location = "/";
    });

})();





