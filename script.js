// ======================= variable declaration =======================

let canvas = document.getElementById("canvas-frame");
let ctx = canvas.getContext("2d");

// standing position
let playerXaxis = -50;
let opponentXaxis = 800;

// health bars pixel value
let playerBar = 500;
let opponentBar = 0; // opponent health bar reduce from left to right so, it has to increase

let isPlayerBlocked = false;
let isOpponentBlocked = false;

// timer
let seconds = 4;
let visibleTimer = document.getElementById("timer");
let timer = null;

// players name
let playerName = null;
let opponentName = null;

// stores all players image elements
let playerMovements = null;
let opponentMovements = null;

// movement count for control opponent player
let opponentMovementCount = 0;
// player attack count for prevent opponent from player attacks by using block animation
let playerAttackCount = 0;

// create Image elements
let loadImage = (src, callback) => {
	let img = document.createElement("img");
	img.onload = () => callback(img);
	img.src = src;
};

// ======================= functions =======================

// return a string of image file path
let imagePath = (character, animation, frameNumber) => {
	return ("./assets/images/" + character + "/" + animation + "/" + String(frameNumber) + ".png");
};

// create audio element and return it
let loadAudio = (src) => {
	let sound = document.createElement("audio");
	sound.src = src;
	sound.setAttribute("controls", "none");
	return sound;
};

// return a string of audio file path
let audioPath = (audioName) => {
	return ("./assets/audio/" + audioName + ".mp3");
};

// store all audio files in this object
let audio = {
	ready_fight: null, hit: null, punch: null, kick: null,
	winner: null, game_over: null, background_music: null
};

for (let index in audio) {
	// store audio files in the audio object
	audio[index] = loadAudio(audioPath(index));
}

// store folders and photo's names
let frames = {
	idle: [1, 2, 3, 4, 5, 6, 7, 8],
	punch: [1, 2, 3, 4, 5, 6, 7],
	kick: [1, 2, 3, 4, 5, 6, 7],
	forward: [1, 2, 3, 4, 5, 6],
	backward: [1, 2, 3, 4, 5, 6],
	block: [1, 2, 3, 4, 5, 6, 7, 8, 9]
};

// load images for both player and opponent
let loadImages = (callback) => {
	let playerImages = { idle: [], punch: [], kick: [], forward: [], backward: [], block: [] };
	let opponentImages = { idle: [], punch: [], kick: [], forward: [], backward: [], block: [] };

	// number of images to load
	let imagesToLoad = 0;

	["idle", "punch", "kick", "forward", "backward", "block"].forEach(
		(animation) => {
			let animationFrames = frames[animation];
			imagesToLoad += animationFrames.length; // store length of the array of animationFrames

			animationFrames.forEach((frameNumber) => {
				let playerImagePath = imagePath("player", animation, frameNumber);
				let opponentImagePath = imagePath("opponent", animation, frameNumber);

				// store all player's images in playerImages object
				loadImage(playerImagePath, (image) => {
					playerImages[animation][frameNumber - 1] = image;
				});

				// store all opponent's images in opponentImages object
				loadImage(opponentImagePath, (image) => {
					opponentImages[animation][frameNumber - 1] = image;

					if (--imagesToLoad == 0) {
						// if imagesToLoad become zero callback function will be called with parameters of both players images
						callback(playerImages, opponentImages);
					}
				});
			});
		}
	);
};

// animate both player and opponent movements
let animate = (context, playerImages, opponentImages, playerAnimation, oppenentAnimation, callback) => {
	try {
		let playerImage = playerImages[playerAnimation];
		let opponentImage = opponentImages[oppenentAnimation];

		// return true or false, if the movement value is exists in image element source
		let playerAction = (image, movement) => image.src.includes(movement);
		let opponentAction = (image, movement) => image.src.includes(movement);

		// animate player's images
		playerImage.forEach((image, index) => {
			setTimeout(() => {
				isPlayerBlocked = playerAction(image, "block");

				/* opponent's body position is opponent x-axis - 130
				 * opponent's upper body position is opponent x-axis - 170
				 * opponent's head position is opponent x-axis - 140
				 */
				if (playerAction(image, "forward") && playerXaxis <= opponentXaxis - 130) {
					playerXaxis += 10; // forward movement
				} else if (playerAction(image, "backward") && playerXaxis > -50) {
					playerXaxis -= 10; // backward movement
				}

				// player attack
				if (playerAction(image, "punch") && opponentBar < 500) {
					if (playerXaxis >= opponentXaxis - 170) {
						audio.hit.play(); // play hit audio file
						if (!isOpponentBlocked) { // check if opponent is not blocking
							opponentBar += 2; // reduce 2 points from opponent health
							playerAttackCount++; // increase player attack count for prevent opponent
						}
					} else {
						audio.punch.play(); // play punch audio file
						setTimeout(() => audio.hit.pause(), 200); // after 200ms punch audio file would be passed
					}
				} else if (playerAction(image, "kick") && opponentBar < 500) {
					audio.kick.play(); // play kick audio file
					if (playerXaxis >= opponentXaxis - 140) {
						audio.hit.play();
						if (!isOpponentBlocked) {
							opponentBar += 5; // reduce 5 points from opponent health
							playerAttackCount++;
						}
					}
				} else playerAttackCount = 0; // player action is not attack action playerAttackCount would be reset

				// clear canvas before image would be loaded
				context.clearRect(0, 0, 1255, 500);
				// draw image in canvas
				context.drawImage(image, playerXaxis, 0, 500, 500);
			}, index * 100); // it could be animation speed
		});

		// animate opponent's movement
		opponentImage.forEach((image, index) => {
			setTimeout(() => {
				/* player's body position is opponent x-axis + 130
				 * player's upper body position is opponent x-axis + 170
				 * player's head position is opponent x-axis + 140
				 */

				if (opponentAction(image, "forward") && opponentXaxis >= playerXaxis + 130) {
					opponentXaxis -= 10; // forward movement
				} else if (opponentAction(image, "backward") && opponentXaxis < 800) {
					opponentXaxis += 10; // backward movement
				}

				// opponent attack
				if (opponentAction(image, "punch") && playerBar > 0) {
					if (opponentXaxis <= playerXaxis + 170) {
						audio.hit.play();
						if (!isPlayerBlocked)	playerBar -= 2; // reduce 2 points from player health
					} else audio.punch.play();
				} else if (opponentAction(image, "kick") && playerBar > 0) {
					audio.kick.play();
					if (opponentXaxis <= playerXaxis + 140) {
						audio.hit.play();
						if (!isPlayerBlocked)	playerBar -= 5; // reduce 5 points from player health
					}
				}

				// draw opponent's image in canvas
				context.drawImage(image, opponentXaxis, 0, 500, 500);
			}, index * 100); // it could be animation speed
		});

		// check which player has max length
		setTimeout(callback, (playerImage.length <= opponentImage.length ? playerImage.length : opponentImage.length) * 100);
		// callback function would be called after time out
	} catch (error) { console.log("assets failed to load"); }
};


// ============================ load and store both player and opponent images ============================
loadImages((playerImages, opponentImages) => {
	playerMovements = playerImages;
	opponentMovements = opponentImages;
});


// game is start from here
function ready() {
	// alert user to wait for a while
	alert("Please wait until the web page gets loaded\nIf there is an issue, please refresh the web page");

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

	// enable canvas and header tags
	document.getElementById("header").style.display = "block";
	document.getElementById("canvas-frame").style.display = "block";

	// print instructions on the screen
	ctx.fillText("Hold D to move forward", 50, 150);
	ctx.fillText("Hold A to move backward", 50, 250);
	ctx.fillText("Hold Space to block", 50, 350);

	ctx.fillText("Press P to punch", 900, 150);
	ctx.fillText("Press L to kick", 900, 250);

	// below code start count down from 5 to 1 for players to be ready
	// set 90 seconds for game time after the time out
	timer = setInterval(() => {
		if (seconds == -1) { // time out
			seconds = 90;
			visibleTimer.innerHTML = seconds--;
			clearInterval(timer); // stop timer
			startGame(); // after time out startGame function would be called
		} else visibleTimer.innerHTML = seconds--;

		// below if-block play an audio and print ready fight! on the screen
		if (seconds == -1) {
			audio.ready_fight.play();
			ctx.fillText("Ready Fight!", 530, 50);
		}
	}, 1000);
}

// all game controls and movements exexute here
function startGame() {
	// play background music
	audio.background_music.play();
	audio.background_music.volume = 0.4;

	// for check game is ended or not
	let gameEnded = false;

	// selected animation to animate players
	let playerSelectedAnimation = "idle";
	let opponentSelectedAnimation = "idle";

	// players movement
	let playerForward = false;
	let playerBackward = false;
	let playerBlock = false;

	// select player's animation based on user input
	let selectAnimation = () => {
		if (playerForward) {
			playerSelectedAnimation = "forward";
		} else if (playerBackward) {
			playerSelectedAnimation = "backward";
		} else if (playerBlock) {
			playerSelectedAnimation = "block";
		} else playerSelectedAnimation = "idle";
	}

	// set game timer
	timer = setInterval(() => {
		if (seconds == 0) { // time out
			clearInterval(timer);
		} else if (seconds <= 10) { // low time
			visibleTimer.style.color = "#d00"; // set red colour if time is low
		}
		visibleTimer.innerHTML = seconds--;
	}, 1000);

	// Queue for both player and opponent
	let playerAnimationQueue = [];
	let opponentAnimationQueue = ["idle", "idle"];
	let message = " won the match";

	// set green colour to player health bar
	document.getElementsByClassName("bar-layer")[0].style.backgroundColor = "green";

	// game result
	let resultBoard = document.getElementById("article");
	let matchResult = document.getElementById("result");
	let matchResultText = document.getElementById("resultText");

	// health bar
	let playerHealthBar = document.getElementsByClassName("bar-layer")[0];
	let opponentHealthBar = document.getElementById("opponent-health-bar");

	// opponent health bar background
	let opponentHealthBarBg = document.getElementsByClassName("bar-layer")[1];

	// return calculation of pixel to percentage
	let getValue = (pixel) => (pixel * 100) / 500;

	// stop game and display result on the screen
	let stopCanvas = () => {
		if (!gameEnded) { // check game is not ended
			// pause all audio files
			for (let key in audio) {	audio[key].pause();	}

			// disable canvas and header
			document.getElementById("header").style.display = "none";
			document.getElementById("canvas-frame").style.display = "none";
			resultBoard.style.display = "block"; // enable result board
			gameEnded = true;
		}

		// refresh the page after 2 seconds
		setTimeout(() => location.reload(), 2000);
	};

	// execute both player and opponent actions
	let executeAction = () => { 

		// set health bars value to progress bars
		playerHealthBar.style.width = String(playerBar) + "px";
		opponentHealthBarBg.style.width = String(opponentBar) + "px";

		selectAnimation(); // call selectAnimation function to select which action would be animate for player
		controlOpponent(); // call controlOpponent function to select which action would be animate for opponent
		if (playerAnimationQueue.length != 0) {
			// Dequeue from the playerAnimationQueue
			playerSelectedAnimation =  playerAnimationQueue.shift();
		}

		if (opponentAnimationQueue.length != 0) {
			// Dequeue from the opponentAnimationQueue
			opponentSelectedAnimation =  opponentAnimationQueue.shift();
		}

		// call animate function to animate movements
		animate(ctx, playerMovements, opponentMovements, playerSelectedAnimation, opponentSelectedAnimation, executeAction);

		// Time out
		// below the if-block find out which player has maximum health and show that player as winner
		if (seconds == -1) {
			stopCanvas();
			if (getValue(playerBar) <= 100 - getValue(opponentBar)) {
				audio.game_over.play(); // play game over audio file
				matchResult.innerHTML = "Game Over!"; // set `Game Over!` text in the result board
				matchResult.style.color = "red"; // set red colour to the text
				matchResultText.innerHTML = opponentName + message; // display winner message
			} else {
				audio.winner.play(); // play winner audio file
				matchResult.innerHTML = "Winner!"; // set `Winner!` text in the result board
				matchResult.style.color = "green"; // set green colour to the text
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

	executeAction();

	// track keyboard inputs whether user is holding or not
	document.addEventListener("keydown", (event) => {
		switch(event.key) {
			case "d": playerForward = true;		break;
			case "a": playerBackward = true;	break;
			case " ": playerBlock = true;
		}

		selectAnimation();
	});

	// track keyboard inputs whether user released or not
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
	function controlOpponent() {
		if (opponentXaxis >= playerXaxis + 130 && opponentMovementCount == 0) {
			// opponent move forward if player is far from opponent and movement count is 0
			opponentAnimationQueue.push("forward");
		} else if (playerAttackCount >= 20) {
			// if player attacked more than 4 attacks, opponent start blocking itself
			opponentAnimationQueue.push("block");
			isOpponentBlocked = true;
		} else if(opponentMovementCount >= 0 && opponentMovementCount <= 5) {
			// if opponent reached player, it start attack 5 times
			opponentAnimationQueue.push((Math.random() <= 0.5 ? "punch" : "kick"));
			opponentMovementCount++; // opponentMovementCount is increasing
		} else if (opponentMovementCount <= 10) {
			// after 5 attacks opponent move forward
			opponentAnimationQueue.push("backward");
			playerAttackCount = 0; // playerAttackCount would be resetted
			opponentMovementCount++;
		} else if (opponentMovementCount <= 15) {
			// after backward movement, it just animate idle action for 5 times
			opponentAnimationQueue.push("idle");
			opponentMovementCount++;
		} else opponentMovementCount = 0;

		if (playerAttackCount < 20) isOpponentBlocked = false;
	}
}
