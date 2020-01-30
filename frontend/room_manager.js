document.getElementById("myBtn").addEventListener("click", function(){
    document.getElementById("demo").innerHTML = "Hello World";
});

var socket = io.connect('http://localhost:4000');



