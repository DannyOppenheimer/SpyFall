window.onload = () => {
    var socket = io.connect('http://108.28.114.48:80/');

    document.getElementById("text").addEventListener('click', () => {
        socket.emit('setup', {

        });
    });


}