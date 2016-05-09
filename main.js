document.addEventListener('DOMContentLoaded', function() {

	var toServer = {},
		user = {},
		file,
		server = 'localhost:5000';

	authForm.addEventListener('keypress', function (e) {
		if (e.target === document.querySelector('#login')) {
			if (!validate(e.keyCode)) {
				e.preventDefault();
				error('Login может состять только из букв и цифр');
			};
		};
	});

	authForm.addEventListener('submit', function(e) {
		e.preventDefault();
		var name = document.querySelector('#name').value,
			login = document.querySelector('#login').value;
		if (!name) {
			error('введите имя');
		} else if (!login) {
			error('введите login');
		} else {
			toServer.op = 'reg';
			toServer.data = {};
			toServer.data.name = name;
			toServer.data.login = login;
			user.name = name;
			user.login = login;
			socketConnect();
		};
	});

	function socketConnect() {
		var socket = new WebSocket('ws://'+ server);

		socket.onmessage = function(e) {
			var data = JSON.parse(e.data);
			console.log(data);
			if (data.op === 'token') {
				error('Вы вошли как ' + toServer.data.login, true);
				data.users.forEach(function(user) {
					if (user.login == toServer.data.login) {
						userList.insertAdjacentElement('afterbegin',userInit(user, true));
					} else {
						userList.insertAdjacentElement('beforeend', userInit(user));
					};	
				});
				data.messages.forEach(function(message) {
					messageList.appendChild(createMessage(message));
					messageList.scrollTop = messageList.scrollHeight;
				});
				user.token = data.token;
				authForm.classList.add('hidden');

				avatar.addEventListener('click', function() {
					popup.classList.add('show');

					var fileReader = new FileReader();
					
					fileReader.addEventListener('load', function(e) {
						output.src = this.result;
					});
					photoInput.addEventListener('change', function(e) {
				        file = e.target.files[0];
				        fileReader.readAsDataURL(file);
				    });
				});

				popup.addEventListener('click', function(e) {
					(e.target === this) ? this.classList.remove('show') : null;
				}, true);
			};
			if (data.op === 'error') {
				error(data.error.message);
			};
			if (data.op === 'user-enter') {
				userList.appendChild(userInit(data.user));
			};
			if (data.op == 'message') {
				messageList.appendChild(createMessage(data));
				messageList.scrollTop = messageList.scrollHeight;
			};
			if (data.op == 'user-out') {
				deleteUser(data.user);
			};
			document.forms.message.onsubmit = function(e) {
				toServer.op = 'message';
				toServer.token = user.token;
				toServer.data = {};
				toServer.data.body = messageInput.value;
				socket.send(JSON.stringify(toServer));
				messageInput.value = '';
				return false;
			};
		};

		socket.onopen = function(e) {
			var user = JSON.stringify(toServer);
			socket.send(user);
		};

		socket.onerror = function(e) {
			if (e.target.readyState === 3 ) {
				error('Сервер не отвечает');
			};
		};
	};
	function createMessage(obj) {
		var li = document.createElement('LI'),
			msgWrap = document.createElement('DIV'),
			photo = '<div class="img-wrapper"><img src="http://'+ server + '/photos/' + obj.user.login +'"></div>',
			login = '<span class="message__user-login">' + obj.user.login + '</span>',
			message = '<div class="message__text">' + obj.body + '</div>',
			time = new Date(obj.time),
			date = '<span class="message__date">' + time.getDate() + '</span>',
			timeEl = '<span class="message__time">' + time.getHours() + ':' + time.getMinutes() + '</span>';
		msgWrap.classList.add('message-wrapper');
		msgWrap.insertAdjacentHTML('afterbegin', photo + login + timeEl + message);
		li.appendChild(msgWrap);
		if (obj.user.login === user.login) {
			li.classList.add('mine');
		}
		return li;
	}

	function deleteUser(data) {
		var users = document.querySelectorAll('.user_other');
		for (var i = 0; i < users.length; i++) {
			if (users[i].dataset.login === data.login) {
				var li = users[i];
				li.style = 'left: -100%';
				setTimeout(function() {
					userList.removeChild(li);
				}, 300);
			};
		};	
	};

	function validate(code) {
		if ((code > 47 && code < 58) || (code > 64 && code < 91) || (code > 96 && code < 123)) {
			return true;
		} else 
			return false;
	};

	function error(message, isGood) {
		errorMessage.innerHTML = message;
		errorMessage.classList.add('shown');
		if (isGood) {
			errorMessage.classList.add('green');
			setTimeout(function() {
				errorMessage.classList.remove('shown');
				errorMessage.classList.remove('green');
			}, 1000)
		};
		document.addEventListener('click', function() {
			errorMessage.classList.remove('shown');
		});
	};

	function userInit(obj, isMe) {
		var li = document.createElement('LI'),
			photo = '<div class="img-wrapper"><img ' + (isMe ? 'id="avatar"' : '') + ' src="http://' + server + '/photos/' + obj.login +'"></div>',
			name = '<div class="user__name">' + obj.name + '</div>',
			login = '<div class="user__login">' + obj.login + '</div>';
		li.dataset.login = obj.login;
		if (isMe) {
			li.classList.add('user_me');
		} else {
			li.classList.add('user_other');
		}
		li.insertAdjacentHTML('afterbegin', photo + login + name);
		return li;
	};
});