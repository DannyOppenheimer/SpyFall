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

    /*
    document.getElementById("label1").addEventListener("click", function(){

        document.getElementById("label1").innerHTML =  "<del>Spyfall 1 Locations</del";
        
    });
    
    document.getElementById("label2").addEventListener("click", function(){

        document.getElementById("label2").innerHTML =  "<del>Spyfall 1 Locations</del";
        
    });*/
    
}


