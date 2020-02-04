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

        //---TIMER ON PAGE---// - MOVE SOMEWHERE
        let time = data.time;
        let total_minutes = time-1;
        let total_seconds = (time * 60);
        let counter = 0;
        let time_cell = document.getElementById("time");

        clock = setInterval(function(){ 
            counter++;
            if(counter%61 == 0)
            {
                total_minutes--;
                counter=0;
            }
            total_seconds--;
            if(60 - counter <= 9) {
                time_cell.innerHTML = total_minutes + ":0" + (60 - counter);
            }
            else{
                time_cell.innerHTML = total_minutes + ":" + (60 - counter);
            }
           
            if (total_seconds == 0) {
                clearInterval(clock);
                window.location = "game_end.html";
                //place holder code - put code to reset room in here
            }
        }, 250);    
    
    });

    socket_link.on('no_key_error', () => {

        document.getElementById("title").innerHTML = "The key " + room_key + " does not exist!";
    });

    document.getElementById("game_stop").addEventListener('click', () => {
        window.location = "index.html";
    });

})();





