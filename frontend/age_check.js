if (window.localStorage) {
	let storage = window.localStorage;

	if (storage.getItem('years13')) {
		document.getElementById('overlay').style.display = 'none';
	} else {
		document.getElementById('overlay').style.display = 'block';
	}
}
