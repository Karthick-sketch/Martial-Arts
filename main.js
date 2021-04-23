let canvas = document.getElementById("canvas-frame");
let ctx = canvas.getContext("2d");

// create all frame Image elements
let loadImage = (src, callback) => {
	let img = document.createElement("img");
	img.onload = () => callback(img);
	img.src = src;
};

// make a string of image file path
let imagePath = (character, animation, frameNumber) => {
	return ("./assets/images/" + character + "/" + animation + "/" + String(frameNumber) + ".png");
};

// create audio element
let loadAudio = (src) => {
	let sound = document.createElement("audio");
	sound.src = src;
	sound.setAttribute("controls", "none");
	return sound;
};

// make a string of audio file path
let audioPath = (audioName) => {
	return ("./assets/audio/" + audioName + ".mp3");
};

// folders and photos names
let frames = {
	idle: [1, 2, 3, 4, 5, 6, 7, 8],
	punch: [1, 2, 3, 4, 5, 6, 7],
	kick: [1, 2, 3, 4, 5, 6, 7],
	forward: [1, 2, 3, 4, 5, 6],
	backward: [1, 2, 3, 4, 5, 6],
	block: [1, 2, 3, 4, 5, 6, 7, 8, 9]
};

let loadImages = (callback) => {
	let playerImages = { idle: [], punch: [], kick: [], forward: [], backward: [], block: [] };
	let opponentImages = { idle: [], punch: [], kick: [], forward: [], backward: [], block: [] };

	let imagesToLoad = 0;

	["idle", "punch", "kick", "forward", "backward", "block"].forEach(
		(animation) => {
			let animationFrames = frames[animation];
			imagesToLoad += animationFrames.length; // number of images to load

			animationFrames.forEach((frameNumber) => {
				let path1 = imagePath("player", animation, frameNumber);
				let path2 = imagePath("opponent", animation, frameNumber);

				loadImage(path1, (image) => {
					playerImages[animation][frameNumber - 1] = image;
				});

				loadImage(path2, (image) => {
					opponentImages[animation][frameNumber - 1] = image;

					if (--imagesToLoad == 0) {
						callback(playerImages, opponentImages); // if imagesToLoad become zero callback will be called
					}
				});
			});
		}
	);
};

let audio = { ready_fight: null, hit: null, punch: null, kick: null };

for (let index in audio) {
	audio[index] = loadAudio(audioPath(index));
}

// standing positiona
let playerXaxis = -50;
let opponentXaxis = 200;

// health bars value
let playerBar = 500;
let opponentBar = 490;

let animate = (context, playerImages, opponentImages, playerAnimation, oppenentAnimation, callback) => {
	let playerImage = playerImages[playerAnimation];
	let opponentImage = opponentImages[oppenentAnimation];

	let playerBlocked = false;
	let opponentBlocked = false;

	let playerAction = (image, str) => {
		return (image !== undefined ? image.src.includes(str) : false);
	};

	let opponentAction = (image, str) => {
		return (image !== undefined ? image.src.includes(str) : false);
	};

	playerImage.forEach((image, index) => {
		setTimeout(() => {
			playerBlocked = (playerAction(image, "block") ? true : false);

			if (playerAction(image, "forward") && playerXaxis <= opponentXaxis - 130) {
				playerXaxis += 10; // forward movement
			} else if (playerAction(image, "backward") && playerXaxis > -50) {
				playerXaxis -= 10; // backward movement
			}

			// player attack
			if (playerAction(image, "punch")) {
				if (playerXaxis >= opponentXaxis - 130 && opponentBar < 500 && !opponentBlocked) {
					opponentBar += 2; // reduce 2 points from opponent health
					audio.hit.play();
				} else audio.punch.play();
			} else if (playerAction(image, "kick")) {
				if (playerXaxis >= opponentXaxis - 130 && opponentBar < 500 && !opponentBlocked) {
					opponentBar += 5; // reduce 5 points from opponent health
					audio.kick.play();	audio.hit.play();
				} else audio.kick.play();
			}

			// clear canvas before image would be loaded
			context.clearRect(0, 0, 1255, 500);
			// draw image in canvas
			context.drawImage(image, playerXaxis, 0, 500, 500);
		}, index * 100); // it could be animation speed
	});

	opponentImage.forEach((image, index) => {
		setTimeout(() => {
			opponentBlocked = (opponentAction(image, "block") ? true : false);

			if (opponentAction(image, "forward") && opponentXaxis >= playerXaxis + 130) {
				opponentXaxis -= 10; // forward movement
			} else if (opponentAction(image, "backward") && opponentXaxis < 800) {
				opponentXaxis += 10; // backward movement
			}

			// opponent attack
			if (opponentAction(image, "punch")) {
				if (opponentXaxis <= playerXaxis + 130 && playerBar > -50 && !playerBlocked) {
					playerBar -= 2; // reduce 2 points from player health
					audio.hit.play();
				} else audio.punch.play();
			} else if (opponentAction(image, "kick")) {
				if (opponentXaxis <= playerXaxis + 130 && playerBar > -50 && !playerBlocked) {
					playerBar -= 5; // reduce 5 points from player health
					audio.kick.play();	audio.hit.play();
				} else audio.kick.play();
			}

			// draw player's image in canvas
			context.drawImage(image, opponentXaxis, 0, 500, 500);
		}, index * 100); // it could be animation speed
	});
	let len = (playerImage.length <= opponentImage.length ? playerImage.length : opponentImage.length);
	setTimeout(callback, len * 100);
};

let seconds = 2;
let visibleTimer = document.getElementById("timer");
let timer = null;
let playerName = null;
let opponentName = null;

function ready() {
	// accept player and opponent name
	playerName = document.getElementById("playerInput").value;
	opponentName = document.getElementById("opponentInput").value;

	// check inputs wether it is not an empty string
	if (playerName !== "")
		document.getElementById("playerName").innerHTML = playerName;
	else playerName = "Player";

	if (opponentName != "")
		document.getElementById("opponentName").innerHTML = opponentName;
	else opponentName = "Opponent";

	// disable main menu
	document.getElementById("menu").style.display = "none";
	document.getElementById("menu-image").style.display = "none";

	// enable canvas and header
	document.getElementById("header").style.display = "block";
	document.getElementById("canvas-frame").style.display = "block";

	timer = setInterval(() => {
		if (seconds == -1) {
			seconds = 90;
			visibleTimer.innerHTML = seconds--;
			clearInterval(timer);
			start();
		} else visibleTimer.innerHTML = seconds--;

		if (seconds == -1) {
			audio.ready_fight.play();
			ctx.font = "30px Arial black";
			ctx.fillText("Ready Fight!", 530, 50);
		}
	}, 1000);
}

function start() {
	let playerSelectedAnimation = "idle";
	let opponentSelectedAnimation = "idle";

	let playerForward = false;
	let opponentForward = false;
	let playerBackward = false;
	let opponentBackward = false;
	let playerBlock = false;
	let opponentBlock = false;

	let selectAnimation = () => {
		if (playerForward) {
			playerSelectedAnimation = "forward";
		} else if (playerBackward) {
			playerSelectedAnimation = "backward";
		} else if (playerBlock) {
			playerSelectedAnimation = "block";
		} else playerSelectedAnimation = "idle";

		if (opponentForward) {
			opponentSelectedAnimation = "forward";
		} else if (opponentBackward) {
			opponentSelectedAnimation = "backward";
		} else if (opponentBlock) {
			opponentSelectedAnimation = "block";
		} else opponentSelectedAnimation = "idle";
	}

	timer = setInterval(() => {
		if (seconds == 0) {
			clearInterval(timer);
		} else if (seconds <= 10) {
			visibleTimer.style.color = "#d00";
		}
		visibleTimer.innerHTML = seconds--;
	}, 1000);

	loadImages((playerImages, opponentImages) => {
		let playerAnimationQueue = [];
		let opponentAnimationQueue = [];
		let message = " won the match";

		// return calculation of pixel to percentage
		let getValue = (pixel) => (pixel * 100) / 500;
		let stopCanvas = () => {
			audio.forEach((i) => i.pause()); // pause all audio files
			// disable canvas and header
			document.getElementById("header").style.display = "none";
			document.getElementById("canvas-frame").style.display = "none";
		};

		document.getElementsByClassName("bar-layer")[0].style.backgroundColor = "green";
		let resultBoard = document.getElementById("article");
		let matchResult = document.getElementById("result");
		let matchResultText = document.getElementById("resultText");

		let playerHealthBar = document.getElementsByClassName("bar-layer")[0];
		let opponentHealthBar = document.getElementById("opponent-health-bar");

		let opponentHealthBarBg = document.getElementsByClassName("bar-layer")[1];

		let aux = () => { // execute actions

		// set health bars value to header
		playerHealthBar.style.width = String(playerBar) + "px";
		opponentHealthBarBg.style.width = String(opponentBar) + "px";

		selectAnimation();
		if (playerAnimationQueue.length != 0)
			playerSelectedAnimation =  playerAnimationQueue.shift();			

		if (opponentAnimationQueue.length != 0)
			opponentSelectedAnimation =  opponentAnimationQueue.shift();

		animate(ctx, playerImages, opponentImages, playerSelectedAnimation, opponentSelectedAnimation, aux);

		// Time out
		if (seconds == -1) {
			stopCanvas();
			resultBoard.style.display = "block"; // enable result board
			if (getValue(playerBar) <= 100 - getValue(opponentBar)) {
				matchResult.innerHTML = "Game Over!";
				matchResult.style.color = "red";
				matchResultText.innerHTML = opponentName + message;
			} else {
				matchResult.innerHTML = "Winner!";
				matchResult.style.color = "green";
				matchResultText.innerHTML = playerName + message;
			}
		}

		if (getValue(playerBar) <= 0) {
			stopCanvas();
			matchResult.innerHTML = "Game Over!";
			matchResult.style.color = "red";
			matchResultText.innerHTML = opponentName + message;
			resultBoard.style.display = "block"; // enable result board
		} else if (getValue(playerBar) <= 15) {
			// set red color to the player health bar if its value is less than or equal to 15
			playerHealthBar.style.backgroundColor = "#c00";
		}

		if (getValue(opponentBar) >= 100) {
			stopCanvas();
			matchResult.innerHTML = "Winner!";
			matchResult.style.color = "green";
			matchResultText.innerHTML = playerName + message;
			resultBoard.style.display = "block"; // enable result board
		} else if (getValue(opponentBar) >= 85) {
			// set red color to the opponent health bar if its value is less than or equal to 15
			opponentHealthBar.style.backgroundColor = "#c00";
		} else {
			// set green color to the oppenent health bar if its value is greater than 15
			opponentHealthBar.style.backgroundColor = "green";
		}
		// set grey color to the opponent health bar background
		opponentHealthBarBg.style.backgroundColor = "grey";
		};

		aux();

		// track keyboard inputs whether it is hold or not
		document.addEventListener("keydown", (event) => {
			if (event.key == "d") playerForward = true;
			else if (event.key == "a") playerBackward = true;
			else if (event.key == "ArrowLeft") opponentForward = true;
			else if (event.key == "ArrowRight") opponentBackward = true;
			else if (event.key == "v") playerBlock = true;
			else if (event.key == "b") opponentBlock = true;
			else if (event.key == " ") playerBlock = true;

			selectAnimation();
		});

		// track keyboard inputs whether it is released or not
		document.addEventListener("keyup", (event) => {
			if (event.key == "d") playerForward = false;
			else if (event.key == "a") playerBackward = false;
			else if (event.key == "ArrowLeft") opponentForward = false;
			else if (event.key == "ArrowRight") opponentBackward = false;
			else if (event.key == "v") playerBlock = false;
			else if (event.key == "b") opponentBlock = false;
			else if (event.key == " ") playerBlock = false;

			selectAnimation();
		});

		// track keyboard inputs whether it is just pressed or not
		document.addEventListener("keypress", (event) => {
			switch (event.key) {
				// player keys
				case "r": playerAnimationQueue.push("punch");	break;
				case "f": playerAnimationQueue.push("kick");	break;

				// opponent keys
				case "p": opponentAnimationQueue.push("punch");	break;
				case "l": opponentAnimationQueue.push("kick");	break;
			}
		});

		// bot
		function bot() {
			opponentAnimationQueue.push();
			return
		}
	});
}