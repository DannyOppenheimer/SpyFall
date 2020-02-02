// Connect to the backend server
var socket_link = io.connect('http://108.28.114.48:80/');

var name = location.search.substring(1);

// When the user clicks the Create buttons, emit their preferences to the backend server
document.getElementById("create_room_button").addEventListener("click", ()=> {
    let match_minutes = getMatchMinutes();
    
    socket_link.emit('create', {
        source_socket: socket_link.id,
        spyfall1on: playSpyfall1(),
        spyfall2on: playSpyfall2(),
        time: match_minutes,
        name: name
    });
});

// When the server sends back its response, go to the next page
socket_link.on('create', back_data => {
    window.location = "game_room.html?" + back_data.key + "&" + name;
});

// Add a listener to allow crossing off of both thSTOPe SpyFall 1 and 2 Locations
document.getElementById("spyfall1label").addEventListener("click", () => {
    if (document.getElementById("spyfall1label").innerHTML == "Spyfall 1 Locations") {
        document.getElementById("spyfall1label").innerHTML = "<del>Spyfall 1 Locations</del>";
    } else {
        document.getElementById("spyfall1label").innerHTML = "Spyfall 1 Locations";
    }
});

document.getElementById("spyfall2label").addEventListener("click", () => {

    if (document.getElementById("spyfall2label").innerHTML == "Spyfall 2 Locations") {
        document.getElementById("spyfall2label").innerHTML = "<del>Spyfall 2 Locations</del>";
    } else {
        document.getElementById("spyfall2label").innerHTML = "Spyfall 2 Locations";
    }

});

document.getElementById("back").addEventListener("click", () => {

    window.location = "index.html"
});



function playSpyfall1() {
    if (document.getElementById("spyfall1label").innerHTML == "Spyfall 1 Locations") {
        return true;
    } else {
        return false;
    }
}

function playSpyfall2() {
    if (document.getElementById("spyfall2label").innerHTML == "Spyfall 2 Locations") {
        return true;
    } else {
        return false;
    }
}

function getMatchMinutes() {
    return (document.getElementById("matchclock").value);
}