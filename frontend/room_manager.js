window.onload = () => {
    var socket = io.connect('http://localhost:4000');

    document.getElementById("create_room_button").addEventListener("click", function(){
        socket.emit('create', {
            message: "hey"
        });
        
    });

    socket.on('create', data => {
        document.getElementById("demo").innerHTML = "hey";
    });
}


