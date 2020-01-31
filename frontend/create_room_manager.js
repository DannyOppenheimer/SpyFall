window.onload = () => {
    var socket = io.connect('http://108.28.114.48:80/');
    
    document.getElementById("create_room_button").addEventListener("click", function(){
        socket.emit('create', {
            message: "hey"
        });
        
    });

    socket.on('create', data => {
        document.getElementById("demo").innerHTML = "JAY IS BUFF";
    });

    
    document.getElementById("label1").addEventListener("click", function(){
        if(document.getElementById("label1").innerHTML == "Spyfall 1 Locations") {
            document.getElementById("label1").innerHTML =  "<del>Spyfall 1 Locations</del>";
        } else {
            document.getElementById("label1").innerHTML =  "Spyfall 1 Locations";
        }
        
        
    });
    
    document.getElementById("label2").addEventListener("click", function(){

        if(document.getElementById("label2").innerHTML == "Spyfall 2 Locations") {
            document.getElementById("label2").innerHTML =  "<del>Spyfall 2 Locations</del>";
        } else {
            document.getElementById("label2").innerHTML =  "Spyfall 2 Locations";
        }
        
    });

    document.getElementById("back").addEventListener("click", function(){

        window.location = "index.html"
    });
    
}


