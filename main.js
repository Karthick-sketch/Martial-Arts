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
						// if imagesToLoad become zero callback function will be called
						callback(playerImages, opponentImages);
					}
				});
			});
		}
	);
};

let audio = {
	ready_fight: null, hit: null, punch: null, kick: null,
	winner: null, game_over: null, background_music: null
};

for (let index in audio) {
	audio[index] = loadAudio(audioPath(index));
}

// standing positiona
let playerXaxis = -50;
let opponentXaxis = 800;

// health bars value
let playerBar = 500;
let opponentBar = 0;

let playerBlocked = false;
let opponentBlocked = false;

let animate = (context, playerImages, opponentImages, playerAnimation, oppenentAnimation, callback) => {
	let playerImage = playerImages[playerAnimation];
	let opponentImage = opponentImages[oppenentAnimation];

	let playerAction = (image, str) => {
		return (image !== undefined ? image.src.includes(str) : false);
	};

	let opponentAction = (image, str) => {
		return (image !== undefined ? image.src.includes(str) : false);
	};

	playerImage.forEach((image, index) => {
		setTimeout(() => {
			playerBlocked = playerAction(image, "block");

			if (playerAction(image, "forward") && playerXaxis <= opponentXaxis - 130) {
				playerXaxis += 10; // forward movement
			} else if (playerAction(image, "backward") && playerXaxis > -50) {
				playerXaxis -= 10; // backward movement
			}

			// player attack
			if (playerAction(image, "punch") && opponentBar < 500) {
				if (playerXaxis >= opponentXaxis - 170) {
					audio.hit.play();
					if (!opponentBlocked) {
						opponentBar += 2; // reduce 2 points from opponent health
						playerAttackCount++;
					}
				} else {
					audio.punch.play();
					setTimeout(() => audio.hit.pause(), 200);
				}
			} else if (playerAction(image, "kick") && opponentBar < 500) {
				audio.kick.play();
				if (playerXaxis >= opponentXaxis - 140) {
					audio.hit.play();
					if (!opponentBlocked) {
						opponentBar += 5; // reduce 5 points from opponent health
						playerAttackCount++;
					}
				}
			} else playerAttackCount = 0;

			// clear canvas before image would be loaded
			context.clearRect(0, 0, 1255, 500);
			// draw image in canvas
			context.drawImage(image, playerXaxis, 0, 500, 500);
		}, index * 100); // it could be animation speed
	});

	opponentImage.forEach((image, index) => {
		setTimeout(() => {
			if (opponentAction(image, "forward") && opponentXaxis >= playerXaxis + 130) {
				opponentXaxis -= 10; // forward movement
			} else if (opponentAction(image, "backward") && opponentXaxis < 800) {
				opponentXaxis += 10; // backward movement
			}

			// opponent attack
			if (opponentAction(image, "punch") && playerBar > 0) {
				if (opponentXaxis <= playerXaxis + 170) {
					audio.hit.play();
					if (!playerBlocked)	playerBar -= 2; // reduce 2 points from player health
				} else audio.punch.play();
			} else if (opponentAction(image, "kick") && playerBar > 0) {
				audio.kick.play();
				if (opponentXaxis <= playerXaxis + 140) {
					audio.hit.play();
					if (!playerBlocked)	playerBar -= 5; // reduce 5 points from player health
				}
			}

			// draw player's image in canvas
			context.drawImage(image, opponentXaxis, 0, 500, 500);
		}, index * 100); // it could be animation speed
	});
	let len = (playerImage.length <= opponentImage.length ? playerImage.length : opponentImage.length);
	setTimeout(callback, len * 100);
};

let seconds = 4;
let visibleTimer = document.getElementById("timer");
let timer = null;
let playerName = null;
let opponentName = null;
let playerMovements = null;
let opponentMovements = null;

function ready() {
	ctx.font = "30px Arial black";
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

	// print instructions to the screen
	ctx.fillText("Hold D to move forward", 50, 150);
	ctx.fillText("Hold A to move backward", 50, 250);
	ctx.fillText("Hold Space to block", 50, 350);

	ctx.fillText("Press P to punch", 900, 150);
	ctx.fillText("Press L to kick", 900, 250);

	// below code start count down from 3 to 1 for players to be ready
	// set 90 seconds for game time after the time out
	timer = setInterval(() => {
		if (seconds == -1) {
			seconds = 90;
			visibleTimer.innerHTML = seconds--;
			clearInterval(timer);
			start();
		} else visibleTimer.innerHTML = seconds--;

		// below if block play an audio and print ready fight! on the screen
		if (seconds == -1) {
			audio.ready_fight.play();
			ctx.fillText("Ready Fight!", 530, 50);
		}
	}, 1000);

	loadImages((playerImages, opponentImages) => {
		playerMovements = playerImages;
		opponentMovements = opponentImages;
	});
}

let opponentMovementCount = 0;
let playerAttackCount = 0;
let blockCount = 0;

function start() {
	audio.background_music.play();
	audio.background_music.volume = 0.4;

	let result = true;

	let playerSelectedAnimation = "idle";
	let opponentSelectedAnimation = "idle";

	let playerForward = false;
	let playerBackward = false;
	let playerBlock = false;

	let selectAnimation = () => {
		if (playerForward) {
			playerSelectedAnimation = "forward";
		} else if (playerBackward) {
			playerSelectedAnimation = "backward";
		} else if (playerBlock) {
			playerSelectedAnimation = "block";
		} else playerSelectedAnimation = "idle";
	}

	timer = setInterval(() => {
		if (seconds == 0) {
			clearInterval(timer);
		} else if (seconds <= 10) {
			visibleTimer.style.color = "#d00";
		}
		visibleTimer.innerHTML = seconds--;
	}, 1000);

	let playerAnimationQueue = [];
	let opponentAnimationQueue = ["idle", "idle"];
	let message = " won the match";

	document.getElementsByClassName("bar-layer")[0].style.backgroundColor = "green";
	let resultBoard = document.getElementById("article");
	let matchResult = document.getElementById("result");
	let matchResultText = document.getElementById("resultText");

	let playerHealthBar = document.getElementsByClassName("bar-layer")[0];
	let opponentHealthBar = document.getElementById("opponent-health-bar");

	let opponentHealthBarBg = document.getElementsByClassName("bar-layer")[1];

	// return calculation of pixel to percentage
	let getValue = (pixel) => (pixel * 100) / 500;
	let stopCanvas = () => {
		if (result) {
			// pause all audio files
			for (let key in audio) {	audio[key].pause();	}
			// disable canvas and header
			document.getElementById("header").style.display = "none";
			document.getElementById("canvas-frame").style.display = "none";
			resultBoard.style.display = "block"; // enable result board
			result = false;
		}
		setTimeout(() => location.reload(), 2000);
	};

	let aux = () => { // execute actions

	// set health bars value to progress bars
	playerHealthBar.style.width = String(playerBar) + "px";
	opponentHealthBarBg.style.width = String(opponentBar) + "px";

	selectAnimation();	autoplay();
	if (playerAnimationQueue.length != 0)
		playerSelectedAnimation =  playerAnimationQueue.shift();		

	if (opponentAnimationQueue.length != 0)
		opponentSelectedAnimation =  opponentAnimationQueue.shift();		

	animate(ctx, playerMovements, opponentMovements, playerSelectedAnimation, opponentSelectedAnimation, aux);

	// Time out
	// below the if block find out which player has maximum health and show that player as winner
	if (seconds == -1) {
		stopCanvas();
		if (getValue(playerBar) <= 100 - getValue(opponentBar)) {
			audio.game_over.play();
			matchResult.innerHTML = "Game Over!";
			matchResult.style.color = "red";
			matchResultText.innerHTML = opponentName + message;
		} else {
			audio.winner.play();
			matchResult.innerHTML = "Winner!";
			matchResult.style.color = "green";
			matchResultText.innerHTML = playerName + message;
		}
	}

	// show result board when the player bar value is less than or equal to 0
	if (getValue(playerBar) <= 0) {
		stopCanvas();
		audio.game_over.play();
		matchResult.innerHTML = "Game Over!";
		matchResult.style.color = "red";
		matchResultText.innerHTML = opponentName + message;
	} else if (getValue(playerBar) <= 15) {
		// set red color to the player health bar if its value is less than or equal to 15
		playerHealthBar.style.backgroundColor = "#c00";
	}

	// show result board when the opponent bar value is greater than or equal to 100
	if (getValue(opponentBar) >= 100) {
		stopCanvas();
		audio.winner.play();
		matchResult.innerHTML = "Winner!";
		matchResult.style.color = "green";
		matchResultText.innerHTML = playerName + message;
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
		switch(event.key) {
			case "d": playerForward = true;		break;
			case "a": playerBackward = true;	break;
			case " ": playerBlock = true;
		}

		selectAnimation();
	});

	// track keyboard inputs whether it is released or not
	document.addEventListener("keyup", (event) => {
		switch (event.key) {
			case "d": playerForward = false;	break;
			case "a": playerBackward = false;	break;
			case " ": playerBlock = false;
		}

		selectAnimation();
	});

	// track keyboard inputs whether it is just pressed or not
	document.addEventListener("keypress", (event) => {
		if (event.key == "p")	playerAnimationQueue.push("punch");
		else if (event.key == "l")	playerAnimationQueue.push("kick");
	});

	// opponent movements
	function autoplay() {
		if (opponentXaxis >= playerXaxis + 130 && opponentMovementCount == 0) {
			opponentAnimationQueue.push("forward");
		} else if (playerAttackCount >= 20) {
			opponentAnimationQueue.push("block");
			opponentBlocked = true;
		} else if(opponentMovementCount >= 0 && opponentMovementCount <= 5) {
			opponentAnimationQueue.push((Math.random() <= 0.5 ? "punch" : "kick"));
			opponentMovementCount++;
		} else if (opponentMovementCount <= 10) {
			opponentAnimationQueue.push("backward");
			playerAttackCount = 0;
			opponentMovementCount++;
		} else if (opponentMovementCount <= 15) {
			opponentAnimationQueue.push("idle");
			opponentMovementCount++;
		} else	{
			opponentMovementCount = 0;
			opponentBlocked = false;
		}
	}
}