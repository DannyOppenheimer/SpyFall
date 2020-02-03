(() => {
    var socket_link = io.connect('http://108.28.114.48:80/');

    document.getElementById("return").addEventListener("click", () => {
        window.location = "index.html";  
    });
    document.getElementById("return").addEventListener("click", () => {
        window.location = "game_room.html?";
    });
})();





