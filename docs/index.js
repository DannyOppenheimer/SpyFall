function createRoom() {
	if (nameIntegrity()) {
		window.location = 'create_room?' + document.getElementById('name_field').value;
	}
}

function joinRoom() {
	if (nameIntegrity()) {
		window.location = 'join_room?' + document.getElementById('name_field').value;
	}
}

function enterPress(e) {
	if (e.keyCode === 13) {
		e.preventDefault();

		window.location = 'join_room?' + document.getElementById('name_field').value;
	}
}

function rules() {
	window.location = 'rules';
}

function ageVerification() {
	if (window.localStorage) {
		let storage = window.localStorage;

		localStorage.setItem('years13', true);
	}

	document.getElementById('overlay').style.display = 'none';
}

function isAllWhiteSpace(string) {
	if (string.length == string.replace(' ', '').length) {
		return false;
	}
	return true;
}

function nameIntegrity() {
	let name_field = document.getElementById('name_field');
	if (name_field.value == '' || name_field.value.replace(/\s/g, '').length == '') {
		document.getElementById('error_message').innerHTML = 'Your name cannot be all spaces!';
		return false;
	} else if (name_field.value.includes('%20')) {
		document.getElementById('error_message').innerHTML = 'Your name cannot contain the character "%20"! (we use this as a space in data transport)';
		return false;
	} else if (
		name_field.value.match(
			/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu
		)
	) {
		document.getElementById('error_message').innerHTML = 'Your name cannot contain emojis, or other odd characters';
		return false;
	} else {
		return true;
	}
}
