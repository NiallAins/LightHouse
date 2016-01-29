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
		bottom : 90
	};

	this.hspeed = 0; 
	this.vspeed = 0;

	//Traits and states
	this.runSpeed = 12;
	this.jumpHeight = 16;
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
		for (var i = 0; i < Level.boundarys.length; i ++) {
			if (getCollPoint(	this.x + ((this.edge.left + this.edge.right) / 2), this.y + this.edge.bottom, 
								this.x + ((this.edge.left + this.edge.right) / 2), this.y + this.edge.bottom + 1,
								Level.boundarys[i].x0,                             Level.boundarys[i].y0,
								Level.boundarys[i].x1,							   Level.boundarys[i].y1		 ).x !== -1) {
				this.onGround = true;
				break;
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
				this.hspeed = -3;
			} else if (this.onGround) {
				(this.hspeed > -this.runSpeed) ? this.hspeed -= 4 : this.hspeed = -this.runSpeed ;
			} else {
				(this.hspeed > -this.runSpeed) ? this.hspeed -= 1 : this.hspeed = -this.runSpeed;
			}
		} else if (kb.right) {
			if (this.climb) {
				this.hspeed = 3;
			} else if (this.onGround) {
				(this.hspeed < this.runSpeed) ? this.hspeed += 4 : this.hspeed = this.runSpeed;
			} else {
				(this.hspeed < this.runSpeed) ? this.hspeed += 1 : this.hspeed = this.runSpeed;
			}
		} else if (this.climb) {
			this.hspeed = 0;
		} else if (this.onGround) {
			if (this.hspeed > 0) {
				(this.hspeed - 2 <= 0) ? this.hspeed = 0 : this.hspeed -= 4;
			} else if (this.hspeed < 0) {
				(this.hspeed + 2 >= 0) ? this.hspeed = 0 : this.hspeed += 4;
			}
		}

		//Jumping and Climbing
		this.spr.pause = false;
		if (kb.up) {
			if (this.climb) {
				this.vspeed = -3;
			} else if (this.onGround) {
				this.vspeed -= this.jumpHeight;
			}
		} else if (kb.down && this.climb) {
			this.vspeed = 3;
			if (this.onGround) {
				this.spr.pause = true;
			}
		} else if (this.climb) {
			this.vspeed = 0;
			this.spr.pause = true;
		}

		//Gravity
		if (!this.onGround && !this.climb) {
			this.vspeed += 1;
		}

		//Collision detection
		if (this.hspeed > 0) {
			var hPt = this.x + this.edge.right;
		} else if (this.hspeed < 0) {
			var hPt = this.x + this.edge.left;
		} else {
			var hPt = this.x + ((this.edge.left + this.edge.right) / 2);
		}
		for (var i = 0; i < Level.boundarys.length; i += 1) {
			var bo = Level.boundarys[i];
			var vPt = this.y;
			var collPt = getCollPoint(hPt, vPt, hPt + (this.hspeed * dt), vPt + (this.vspeed * dt), bo.x0, bo.y0, bo.x1, bo.y1);

			if (collPt.x !== -1 && Level.boundarys[i].type !== 'platform') {
				var slope = Math.abs((bo.x1 - bo.x0) / (bo.y1 - bo.y0));
				if (slope < 2) {
					this.x = collPt.x - ((this.hspeed > 0) ? this.edge.right : this.edge.left);
					this.hspeed = 0;
				}
				if (slope > 0.5) {
					this.y = collPt.y - ((this.vspeed > 0) ? this.edge.bottom : 0);
					this.vspeed = 0;
				}
				break;
			}

			vPt = this.y + this.edge.bottom - 1;
			collPt = getCollPoint(hPt, vPt, hPt + (this.hspeed * dt), vPt + (this.vspeed * dt), bo.x0, bo.y0, bo.x1, bo.y1);

			if (collPt.x !== -1 && (bo.type !== 'platform' || (!this.climb && vPt + (this.vspeed * dt) > collPt.y))) {
				var slope = Math.abs((bo.x1 - bo.x0) / (bo.y1 - bo.y0));
				if (slope < 2) {
					this.x = collPt.x - ((this.hspeed > 0) ? this.edge.right : this.edge.left);
					this.hspeed = 0;
				}
				if (slope > 0.5) {
					this.y = collPt.y - ((this.vspeed > 0) ? this.edge.bottom : 0);
					this.vspeed = 0;
				}
				break;
			}
		}

		//Implement Movement
		this.x += this.hspeed * dt;
		this.y += this.vspeed * dt;

		//Draw Collision rays
		/*debugCtx.lineWidth = 1;
		debugCtx.strokeStyle = 'red';
		debugCtx.beginPath()
			debugCtx.moveTo(hPt + Level.x, this.y + Level.y);
			debugCtx.lineTo(hPt + Level.x + (this.hspeed * dt), this.y + Level.y + (this.vspeed * dt));
		debugCtx.stroke();
		debugCtx.beginPath()
			debugCtx.moveTo(hPt + Level.x, this.y + this.edge.bottom + Level.y);
			debugCtx.lineTo(hPt + Level.x + (this.hspeed * dt), this.y + this.edge.bottom + Level.y + (this.vspeed * dt));
		debugCtx.stroke();*/

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
}
	Boat.prototype.draw = function() {
		this.spr.draw(this.x, this.y);
	}

	Boat.prototype.step = function() {
		if (this.stage === 0) {
			this.x += 1.5 * dt;
			this.lamp.x += 1.5 * dt;
			if (this.x > 1460 && Math.round(this.spr.frNum) === 5) {
				this.stage = 1;
				this.y -= 64;
				this.setSprite(this.sprites.guyMount);
			}
		}
		else if (this.stage === 1 && Math.round(this.spr.frNum) === 7) {
			this.stage = 2;
			gameObjs.pop();
			gameObjs.push(new Guy(this.x + 42, this.y + 20));
			gameObjs.push(this);
			this.y += 64;
			this.setSprite(this.sprites.guyOut);
		}
		else if (this.stage === 2) {
			this.x -= 1.5 * dt;
			this.lamp.x -= 1.5 * dt;
			if (this.x < 400) {
				gameObjs.pop();
			}
		}
	}