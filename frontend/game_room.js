var socket = io.connect('http://108.28.114.48:80/');

document.getElementById("title").innerHTML = "Room Key: " + location.search.substring(1);

socket.on('load_players', back_data => {

});
