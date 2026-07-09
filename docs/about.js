document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('back')?.addEventListener('click', backToMain);
	document.getElementById('faq')?.addEventListener('click', function () { window.location = 'faq.html'; });
	document.getElementById('faq-link')?.addEventListener('click', function () { window.location = 'about.html'; });
});

function backToMain() {
	window.location = '/';
}
