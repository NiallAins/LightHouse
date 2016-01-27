/***********************\
  CONTROLLABLE CHARACTER
\***********************/

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
		left : 20,
		right: 76,
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
		for (var i = 0; i < boundarys.length; i ++) {
			if (getCollPoint(	this.x + ((this.edge.left + this.edge.right) / 2), this.y + this.edge.bottom, 
								this.x + ((this.edge.left + this.edge.right) / 2), this.y + this.edge.bottom + 1,
								boundarys[i].x0,                                   boundarys[i].y0,
								boundarys[i].x1,								   boundarys[i].y1				 ).x !== -1) {
				this.onGround = true;
				break;
			} 
		}

		//Check if climbing
		if (this.climb || kb.press === 'up' || kb.press === 'down') {
			this.climb = false;
			for (var i = 0; i < ladders.length; i += 1) {
				if (this.x + this.edge.right > ladders[i].left && this.x + this.edge.left < ladders[i].right &&
					this.y < ladders[i].bottom && this.y + this.edge.bottom > ladders[i].top) {
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
				this.vspeed = -this.jumpHeight;
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
		var hPt = (this.hspeed > 0) ? this.x + this.edge.right : this.x + this.edge.left;
		var vPt = (this.vspeed > 0) ? this.y + this.edge.bottom : this.y;
		for (var i = 0; i < boundarys.length; i += 1) {
			if (boundarys[i].type !== 'platform' || (this.vspeed > 0 && !this.climb)) {
				var collPt = getCollPoint(hPt,             vPt,             hPt + (this.hspeed * dt), vPt + (this.vspeed * dt),
								 		  boundarys[i].x0, boundarys[i].y0, boundarys[i].x1,          boundarys[i].y1		   );
				if (collPt.x !== -1) {
					var slope = Math.abs((boundarys[i].x1 - boundarys[i].x0) / (boundarys[i].y1 - boundarys[i].y0));
					if (slope < 2) {
						this.x = collPt.x - ((this.hspeed > 0) ? this.edge.right : this.edge.left);
						this.hspeed = 0;
					}
					if (slope > 0.5) {
						this.y = collPt.y - ((this.vspeed > 0) ? this.edge.bottom : 0);
						this.vspeed = 0;
					}
				}
		}
		}

		//Implement Movement
		this.x += this.hspeed * dt;
		this.y += this.vspeed * dt;

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