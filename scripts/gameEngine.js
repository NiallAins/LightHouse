/*****************\
  EVENT LISTENERS
\*****************/

//Stores state of keyboard
var kb = {
	space : false,
	left : false,
	right : false,
	up : false,
	down : false,
	w : false,
	a : false,
	s : false,
	d : false,
	z : false,
	shift : false,
	press : null
} 

window.onkeydown = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;

   	if (key === 39) {
       kb.right = true;
       kb.press = "right";
   	} else if (key === 37) {
       kb.left = true;
       kb.press = "left";
   	} else if (key === 38) {
       kb.up = true;
       kb.press = "up";
   	} else if (key === 40) {
       kb.down = true;
       kb.press = "down";
   	} else if (key === 32) {
       kb.space = true;
       kb.press = "space";
   	} else if (key === 87) {
       kb.w = true;
       kb.press = "w";
   	} else if (key === 65) {
       kb.a = true;
       kb.press = "a";
   	} else if (key === 83) {
       kb.s = true;
       kb.press = "s";
   	} else if (key === 68) {
       kb.d = true;
       kb.press = "d";
   	} else if (key === 90) {
       kb.z = true;
       kb.press = "z";
   	} else if (key === 16) {
       kb.shift = true;
       kb.press = "shift";
   	}
}

window.onkeyup = function(e) {
   	var key = e.keyCode ? e.keyCode : e.which;

   	if (key === 39) {
       kb.right = false;
       kb.release = "right";
   	} else if (key === 37) {
       kb.left = false;
       kb.release = "left";
   	} else if (key === 38) {
       kb.up = false;
       kb.release = "up";
   	} else if (key === 40) {
       kb.down = false;
       kb.release = "down";
   	} else if (key === 32) {
       kb.space = false;
       kb.release = "space";
   	} else if (key === 87) {
       kb.w = false;
       kb.release = "w";
   	} else if (key === 65) {
       kb.a = false;
       kb.release = "a";
   	} else if (key === 83) {
       kb.s = false;
       kb.release = "s";
   	} else if (key === 68) {
       kb.d = false;
       kb.release = "d";
   	} else if (key === 90) {
       kb.z = false;
       kb.release = "z";
   	} else if (key === 16) {
       kb.shift = false;
       kb.release = "shift";
   	}
}


/********************\
  GAMEPLAY FUNCTIONS
\********************/

//Controls object sprite animation (sprite image source, width of single frame, duration of animation [in milliseconds])
function Sprite(sprite, frWidth, duration, castShadow, reverse) {
	castShadow = false;
	this.reverse = reverse;
	this.frNum = 0;
	this.frDur = duration;
	this.shadow = castShadow;
	this.width = frWidth;
	this.height = sprite.height;
	this.length = 0;
	this.spr = sprite;
	this.length = sprite.width / this.width;
	this.frDur /= this.length;
	this.pause = false;
	if (castShadow) {
		this.shadow = light.addBlock(0, 0, "anim", sprite, frWidth, duration);
		this.shadow.active = false;
	}
}
	Sprite.prototype.draw = function(xIn, yIn) {
		xIn += Level.x;
		yIn += Level.y;
		ctx.drawImage(this.spr, Math.floor(this.frNum) * this.width, 0, this.width, this.spr.height, xIn, yIn, this.width, this.spr.height);
		if (this.shadow) {
			this.shadow.x = xIn;
			this.shadow.y = yIn;
		}
		if (!this.pause) {
			if (!this.reverse) {
				this.frNum += dt / this.frDur;
				if (this.frNum >= this.length) {
					this.frNum = 0;
				}
			} else {
				this.frNum -= dt / this.frDur;
				if (this.frNum < 0) {
					this.frNum = this.length - 1;
				}
			}
		}
	}

var setSprite = function(sprIn) {
	if (typeof this.spr !== 'undefined') {
		this.spr.shadow.active = false;
	}
	this.spr = sprIn;
	this.spr.shadow.active = true;

	//Sync animations of sprite and shadows
	this.spr.shadow.frNum = this.spr.frNum;
}

//Get Collision point between any two lines
function getCollPoint(x00, y00, x01, y01, x10, y10, x11, y11) {
    var sx1 = x01 - x00,
        sy1 = y01 - y00,
    	sx2 = x11 - x10,
    	sy2 = y11 - y10;

    var s = (-sy1 * (x00 - x10) + sx1 * (y00 - y10)) / (-sx2 * sy1 + sx1 * sy2);
    var t = ( sx2 * (y00 - y10) - sy2 * (x00 - x10)) / (-sx2 * sy1 + sx1 * sy2);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        // Collision detected
        var ix = x00 + (t * sx1);
        var iy = y00 + (t * sy1);

        return {x : ix, y : iy};
    } else {
    	//No Collision detected
    	return {x : -1};
    }
}

//Translate Level View (x translation, y translation, absolute position or relatve movement)
function moveLvl(dx, dy, abs) {
	light.moveLvl(dx, dy);
	Level.x += dx;
	Level.y += dy;
	can.style.backgroundPosition = Level.x + 'px ' + Level.y + 'px';
}

/**********************************\
  ENGINE FUNCTIONS & INITALISATION
\**********************************/

//Debug facilities
debug = document.getElementById("debug");
debugCan = document.getElementById('debugCanvas');
debugCtx = debugCan.getContext('2d');

//Canvas Initalization
var can = document.getElementById('mainCanvas');
var ctx = can.getContext('2d');

//Initalise Lighting engine
var light = new lightEngine(can, ctx, 'rgba(0, 0, 0, 0.7)');

//Stores all game objects
var gameObjs = [];

//Aplies tiles to background
var Tiler = {
	tileArr : [],

	add : function(assets) {
		for (var i = 0; i < assets.length; i++) {
			for (var j = 0; j < assets[i].repX; j += 1) {
				var tile = new Sprite(assets[i].spr, assets[i].width, assets[i].rate, assets[i].shadow);
				if (!assets[i].sync) {
					tile.frNum = Math.random() * tile.length
				}
				Tiler.tileArr.push({spr : tile, x : assets[i].x + (assets[i].width * j), y : assets[i].y });
			}
			for (var j = 1; j < assets[i].repY; j += 1) {
				var tile = new Sprite(assets[i].spr, assets[i].width, assets[i].rate, assets[i].shadow);
				if (!assets[i].sync) {
					tile.frNum = Math.random() * tile.length;
				}
				Tiler.tileArr.push({spr : tile, x : assets[i].x, y : assets[i].y + (assets[i].spr.height * j)});
			}
		}
	},

	reset : function() {
		Tiler.tiles = [];
	},

	draw : function() {
		for (var i = 0; i < Tiler.tileArr.length; i++) {
			Tiler.tileArr[i].spr.draw(Tiler.tileArr[i].x, Tiler.tileArr[i].y);
		}
	}
}

function drawDebug() {
	ctx.save();
		ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
		ctx.lineWidth = 5;
		for (var i = 0; i < Level.boundarys.length; i += 1) {
			var bo = Level.boundarys[i];
			ctx.beginPath()
				ctx.moveTo(bo.x0 + Level.x, bo.y0 + Level.y);
				ctx.lineTo(bo.x1 + Level.x, bo.y1 + Level.y); 
			ctx.stroke();
			if (bo.type === 'platform') {
				ctx.save();
				ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
				ctx.lineWidth = 2;
				ctx.beginPath()
					ctx.moveTo(bo.x0 + Level.x, bo.y0 + Level.y + 2);
					ctx.lineTo(bo.x1 + Level.x, bo.y1 + Level.y + 2); 
				ctx.stroke();
				ctx.restore();
			}
		}
		ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
		for (var i = 0; i < Level.ladders.length; i += 1) {
			var la = Level.ladders[i];
			ctx.fillRect(la.left  + Level.x, la.top + Level.y, la.right - la.left, la.bottom - la.top);
		}
		if (typeof gameObjs.guy !== 'undefined') {
			var g = gameObjs.guy;
			ctx.fillStyle = 'rgba(0, 0, 255, 0.3)'
			ctx.fillRect(g.x + g.edge.left + Level.x, g.y + Level.y,
							 g.edge.right - g.edge.left, g.edge.bottom);

			if (g.hspeed > 0) {
				var hPt = g.x + g.edge.right;
			} else if (g.hspeed < 0) {
				var hPt = g.x + g.edge.left;
			} else {
				var hPt = g.x + ((g.edge.left + g.edge.right) / 2);
			}
		}
	ctx.restore();
}


//Stores all game assest; first as roots, then as loaded objects 
var Assets = {
	sprites : {
		guyStandL : "sprites/suitStandL.png",
		guyStandR : "sprites/suitStandR.png",
		guyRunL : "sprites/suitRunL.png",
		guyRunR : "sprites/suitRunR.png",
		guyFallR : "sprites/suitFallR.png",
		guyFallL : "sprites/suitFallL.png",
		guyJumpR : "sprites/suitJumpR.png",
		guyJumpL : "sprites/suitJumpL.png",
		guyClimb : "sprites/suitClimb.png",
		boatIn : "sprites/boat.png",
		boatMount : "sprites/dock_mount.png",
		boatOut : "sprites/boat_noguy.png",
		gate : "sprites/gate.png"
	},
	tiles : {
		sea : "backgrounds/seaTile2.png"
	},
	sounds : {}
};

//Ensures all game assets are loaded before starting game
var loadAssets = function() {
	var loading = 0;

	//Start game after all assets are loaded
	var finishLoading = function() {
		loading -=1;
		if (loading === 0) {
			Level.load.testLevel();
			mainLoop();
		}
	}

	//Load sprites; converting root address to actual object in Assets
	for (var element in Assets.sprites) {
		loading += 1;
		var spr = new Image();
		spr.src = Assets.sprites[element];
		Assets.sprites[element] = spr;

		spr.onload = finishLoading;
	}

	//Load tiles; converting root address to actual object in Assets
	for (var element in Assets.tiles) {
		loading += 1;
		var tile = new Image();
		tile.src = Assets.tiles[element];
		Assets.tiles[element] = tile;

		tile.onload = finishLoading;
	}

	//Load sounds; converting root address to actual object in Assets
	for (var element in Assets.sounds) {
		loading += 1;
		var sound = new Image();
		sound.src = Assets.sounds[element];
		Assets.sounds[element] = sound;

		sound.onload = finishLoading;
	}
}

//Frame timing variables
var time = 0, oldTime = new Date().getTime(), dt = 1;

//For debuging
var debugMode = false, stopLoop = false;

//Animation and Gameplay loop
function mainLoop() {
	//Toggle debug mode
	if (kb.press === "shift") {
		debugMode = !debugMode;
		if (debugMode) {
			can.style.border = '2px solid red';
			debug.innerHTML = 'DEBUG MODE : WASD - Move View, SPACE - frame increment mode, Down - increment frame';
		} else {
			debug.innerHTML = 'D-Keys - Move, Z - Open Gate, Shift - Debug Mode<br /> <a href = "https://github.com/NiallAins/LightHouse"> View on GitHub... </a>';
			can.style.border = 'none';
		}
	}

	//Frame Timing (dt clamped at ~30 FPS)
	time = new Date().getTime();
	dt = (time - oldTime);
	while (dt < 25) {
		time = new Date().getTime();
		dt = (time - oldTime);
	}
	oldTime = time;

	//DEBUG - Move game level
	if (debugMode) {
		debugCtx.clearRect(0, 0, can.width, can.height);
		if (kb.a) {
			moveLvl(20, 0);
		} else if (kb.d) {
			moveLvl(-20, 0);
		}
		if (kb.w) {
			moveLvl(0, 20);
		} else if (kb.s) {
			moveLvl(0, -20);
		}
		if (kb.press === "space") {
			stopLoop = !stopLoop;
		}
	}

	//Refresh and draw frame
	ctx.clearRect(0, 0, can.width, can.height);
	if (!stopLoop || kb.press === "down") {
		for (obj in gameObjs) {
			gameObjs[obj].step();
		}
	}
	for (obj in gameObjs) {
		gameObjs[obj].draw();
	}
	Tiler.draw();

	if (debugMode) {
		drawDebug();
	}

	//Reset Keyboard listener
	kb.press = null;
	kb.release = null;

	//Draw lighting
	light.draw();

	//Get next frame
	window.requestAnimationFrame(mainLoop);
}

//Load game assets before starting main game loop
window.onload = loadAssets();