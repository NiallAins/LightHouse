/************************\
  CONTROLLABLE CHARACTER
\************************/

function Guy(xIn, yIn) {
	this.x = xIn;
	this.y = yIn;
	this.setSprite = setSprite;
	this.sprites = {
		standL : new Sprite(Assets.sprites.guyStandL, 96, 1, true),
		standR : new Sprite(Assets.sprites.guyStandR, 96, 1, true),
		runL : new Sprite(Assets.sprites.guyRunL, 96, 500, true),
		runR : new Sprite(Assets.sprites.guyRunR, 96, 500, true),
		fallR : new Sprite(Assets.sprites.guyFallR, 96, 250, true),
		fallL : new Sprite(Assets.sprites.guyFallL, 96, 250, true),
		jumpR : new Sprite(Assets.sprites.guyJumpR, 96, 1, true),
		jumpL : new Sprite(Assets.sprites.guyJumpL, 96, 1, true),
		climb : new Sprite(Assets.sprites.guyClimb, 96, 600, true),
	}
	this.setSprite(this.sprites.standR);

	//Bounding box co-ordinates
	this.edge = {
		left : 30,
		right: 65,
		bottom : 90,
		mid : 48
	};

	//Movement parameters
	this.hspeed = 0; 
	this.vspeed = 0;
	this.runSp = 15;
	this.climbSp = 4
	this.runAc = 6;
	this.jumpAc = 2;
	this.fric = 6;
	this.jumpHeight = 22;
	this.slopeSnap = 10;
	this.grav = 2;

	//States
	this.rightFacing = true;
	this.onGround = true;
	this.climb = false;
}
	Guy.prototype.draw = function() {
		this.spr.draw(this.x, this.y);
	}
	Guy.prototype.step = function() {
		//Check if on ground
		this.onGround = false;
		for (var i = 0; i < Level.boundarys.length; i += 1) {
			var bo = Level.boundarys[i];
			var groundSlope = Math.abs((bo.y0 - bo.y1) / (bo.x1 - bo.x0));
			if (groundSlope <= 2) {
				var adj = groundSlope * (this.edge.right - this.edge.left);
				var xOff = (this.hspeed === 0) ? this.edge.mid : ((this.hspeed > 0) ? this.edge.right : this.edge.left);
				if (getCollPoint( 	this.x + xOff, this.y + this.edge.bottom, this.x + xOff, this.y + this.edge.bottom + 1 + adj,
								 	bo.x0, 					bo.y0, 					   bo.x1, 		  bo.y1).x !== -1) {
					this.onGround = true;
				}
			}
		}

		//Check if climbing
		if (this.climb || kb.press === 'up' || kb.press === 'down') {
			this.climb = false;
			for (var i = 0; i < Level.ladders.length; i += 1) {
				if (this.x + this.edge.right > Level.ladders[i].left && this.x + this.edge.left < Level.ladders[i].right &&
					this.y < Level.ladders[i].bottom && this.y + this.edge.bottom > Level.ladders[i].top) {
					this.climb = true;
					break;
				}
			}
		}

		//Face correct direction
		if (kb.press === "right") {
			this.rightFacing = true;
		} else if (kb.press === "left") {
			this.rightFacing = false;
		}

		//Move horizontally
		if (kb.left) {
			if (this.climb) {
				this.hspeed = -this.climbSp;
			} else if (this.onGround) {
				(this.hspeed > -this.runSp) ? this.hspeed -= this.runAc : this.hspeed = -this.runSp;
			} else {
				(this.hspeed > -this.runSp) ? this.hspeed -= this.jumpAc : this.hspeed = -this.runSp;
			}
		} else if (kb.right) {
			if (this.climb) {
				this.hspeed = this.climbSp;
			} else if (this.onGround) {
				(this.hspeed < this.runSp) ? this.hspeed += this.runAc : this.hspeed = this.runSp;
			} else {
				(this.hspeed < this.runSp) ? this.hspeed += this.jumpAc : this.hspeed = this.runSp;
			}
		} else if (this.climb) {
			this.hspeed = 0;
		} else if (this.onGround) {
			if (this.hspeed > 0) {
				(this.hspeed - this.fric <= 0) ? this.hspeed = 0 : this.hspeed -= this.fric;
			} else if (this.hspeed < 0) {
				(this.hspeed + this.fric >= 0) ? this.hspeed = 0 : this.hspeed += this.fric;
			}
		}

		//Jumping and Climbing
		this.spr.pause = false;
		if (kb.up) {
			if (this.climb) {
				this.vspeed = -this.climbSp;
			} else if (this.onGround) {
				this.vspeed -= this.jumpHeight;
			}
		} else if (kb.down && this.climb) {
			this.vspeed = this.climbSp;
			if (this.onGround) {
				this.spr.pause = true;
			}
		} else if (this.climb) {
			this.vspeed = 0;
			this.spr.pause = true;
		}

		//Gravity
		if (!this.onGround && !this.climb) {
			this.vspeed += this.grav;
		}

		//Collision detection
		for (var i = 0; i < Level.boundarys.length; i += 1) {
			var bo = Level.boundarys[i];

			//Ground
			if (bo.slope === 0) {
				if ((bo.type !== 'platform' || (!this.climb && this.y + this.edge.bottom + this.vspeed >= bo.y0)) &&
				    (this.y + this.edge.bottom + this.vspeed >= bo.y0 && this.y + this.vspeed <= bo.y0 &&
				     this.x + this.edge.left + this.hspeed >= bo.x0 && this.x + this.edge.right + this.hspeed <= bo.x1)) {
					this.y = bo.y0 + ((this.vspeed > 0) ? -this.edge.bottom - 1 : 1);
					this.vspeed = 0;
					this.onGround = true;
				}
			}
			//Wall
			else if (bo.slope === -Infinity || bo.slope === Infinity) {
				if (this.y + this.edge.bottom + this.vspeed >= bo.y0 && this.y + this.vspeed <= bo.y1 &&
					this.x + this.edge.left + this.hspeed <= bo.x0 && this.x + this.edge.right + this.hspeed >= bo.x0) {
					this.x = bo.x0 - ((this.hspeed > 0) ? this.edge.right + 1 : this.edge.left - 1);
					this.hspeed = 0;
				}
			}
			//Slope
			else {
				if (bo.slope < 0) {
					colPt = getCollPoint(bo.x0, bo.y0, bo.x1, bo.y1, this.x + this.edge.left + this.hspeed, this.y + this.vspeed,
										 this.x + this.edge.left + this.hspeed, this.y + this.edge.bottom + this.vspeed + this.slopeSnap);
				} else {
					colPt = getCollPoint(bo.x0, bo.y0, bo.x1, bo.y1, this.x + this.edge.right + this.hspeed, this.y + this.vspeed,
										 this.x + this.edge.right + this.hspeed, this.y + this.edge.bottom + this.vspeed + this.slopeSnap);
				}
				if (colPt.x !== -1) {
					this.y = (this.vspeed >= 0) ? colPt.y - this.edge.bottom : colPt.y + 1;
					this.vspeed = 0;
					this.onGround = true;
				}
			}
		}


		//Implement Movement
		this.x += this.hspeed;
		this.y += this.vspeed;	

		//Set sprites
		if (this.climb) {
			this.setSprite(this.sprites.climb);
		} else if (this.onGround) {
			this.setSprite((this.hspeed === 0) ?	((this.rightFacing) ? this.sprites.standR : this.sprites.standL) :
												 	((this.rightFacing) ? this.sprites.runR : this.sprites.runL));
		} else {
			this.setSprite((this.vspeed < 0) ?	((this.rightFacing) ? this.sprites.jumpR : this.sprites.jumpL) :
												((this.rightFacing) ? this.sprites.fallR : this.sprites.fallL));
		}
	}

/******\
  BOAT
\******/

function Boat(xIn, yIn) {
	this.x = xIn;
	this.y = yIn;
	this.sprites = {
		guyIn : new Sprite(Assets.sprites.boatIn, 276, 2000, true),
		guyMount : new Sprite(Assets.sprites.boatMount, 264, 1500, true),
		guyOut : new Sprite(Assets.sprites.boatOut, 276, 2000, true, true)
	};
	this.setSprite = setSprite;
	this.setSprite(this.sprites.guyIn);
	this.lamp = light.addSource(this.x + 215, this.y + 16, 100);
	this.stage = 0;
	this.speed = 3;
}
	Boat.prototype.draw = function() {
		this.spr.draw(this.x, this.y);
	}

	Boat.prototype.step = function() {
		if (this.stage === 0) {
			this.x += this.speed;
			this.lamp.x += this.speed;
			if (this.x > 1460 && Math.round(this.spr.frNum) === 5) {
				this.stage = 1;
				this.y -= 64;
				this.setSprite(this.sprites.guyMount);
			}
		}
		else if (this.stage === 1 && Math.round(this.spr.frNum) === 7) {
			this.stage = 2;
			gameObjs.guy = new Guy(this.x + 42, this.y + 20);
			this.y += 64;
			this.setSprite(this.sprites.guyOut);
		}
		else if (this.stage === 2) {
			this.x -= this.speed;
			this.lamp.x -= this.speed;
			if (this.x < 400) {
				delete gameObjs.boat;
			}
		}
	}

/******\
  Gate
\******/
function Gate(xIn, yIn) {
	this.x = xIn;
	this.y = yIn;
	this.spr = new Sprite(Assets.sprites.gate, 36, 800, true);
	this.spr.pause = true;
	Level.addBoundary({ x0 : this.x - 3, y0 : this.y - 200, x1 : this.x - 3, y1 : this.y + 200},
					  { x0 : this.x + 45, y0 : this.y - 200, x1 : this.x + 45, y1 : this.y + 200});
	this.open = false;
}
	Gate.prototype.draw = function() {
		this.spr.draw(this.x, this.y);
	}

	Gate.prototype.step = function() {
		if (!this.spr.pause) {
			if (!this.open && Math.floor(this.spr.frNum) === 5) {
				this.spr.pause = true;
				this.open = true;
				this.spr.reverse = true;
				Level.boundarys.pop();
				Level.boundarys.pop();
			} else if (this.open && Math.floor(this.spr.frNum) === 0) {
				this.spr.pause = true;
				this.open = false;
				this.spr.reverse = false;
				Level.addBoundary({ x0 : this.x - 3, y0 : this.y - 200, x1 : this.x - 3, y1 : this.y + 200},
								  { x0 : this.x + 45, y0 : this.y - 200, x1 : this.x + 45, y1 : this.y + 200});
			}
		}

		if (kb.press === "z" && typeof gameObjs.guy !== undefined && this.x - gameObjs.guy.x > -100 && this.x - gameObjs.guy.x < 100) {
			this.spr.pause = false;
		}
	}

/*****************\
  VIEW CONTROLLER
\*****************/
function ViewControl() {
}
	ViewControl.prototype.step = function() {
		var g = gameObjs.guy;
		if (typeof g === 'undefined') {
			if (gameObjs.boat.stage === 0 && gameObjs.boat.x > 500) {
				moveLvl(-gameObjs.boat.speed, 0);
			}
		} else {
			if (g.x < -Level.x + 300 || g.x > -Level.x + 724) {
				moveLvl(-g.hspeed, 0);
			}
		}
	}
	ViewControl.prototype.draw = function() {

	}