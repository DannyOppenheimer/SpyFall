
var socket = io.connect('http://localhost:4000');
var fs = require('fs');

const goButton = document.querySelector(".goB");

function test() {
    alert("bruh");
}

goButton.addEventListener('click', test(), true);

function go() {
    
    let keyChecker = keyCreator();

}


function keyCreator() {
    let alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
    "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    return alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)] + alphabet[Math.floor(Math.random() * 25)];
}