var Level = {
	boundarys : [],
	ladders : [],
	x : 0,
	y : 0,
	bgX : 0,
	bgY : 0,

	addBoundary : function() {
		for(var i = 0; i < arguments.length; i += 1) {
			arguments[i].slope = (arguments[i].y0 - arguments[i].y1) / (arguments[i].x1 - arguments[i].x0);
			if (typeof arguments[i].type === 'undefined') {
				arguments[i].type = 'solid';
			}
			Level.boundarys.push(arguments[i]);
		}
	},

	//Place objects in level
	load : {
		testLevel : function() {
			gameObjs = {};

			//Set level background and view
			Level.x = 0;
			Level.y = -1424;
			can.style.backgroundImage = 'url("backgrounds/roomDock2.png")';
			can.style.backgroundPosition = Level.x + 'px ' + Level.y;

			//Stores level boundarys
			Level.boundarys = [],
			Level.addBoundary(
				//Pier
				{ x0 : 1304, y0 : 1882, x1 : 2075, y1 : 1882},
				//Grass 1
				{ x0 : 1240, y0 : 1696, x1 : 1880, y1 : 1696, type : 'platform'},
				//Pier wall 1
				{ x0 : 1304, y0 : 1700, x1 : 1304, y1 : 1882},
				//Pier wall 2 
				{ x0 : 2075, y0 : 1696, x1 : 2075, y1 : 1882},
				//Grass wall 1 
				{ x0 : 1250, y0 : 1224, x1 : 1250, y1 : 1706},
				//Grass slope 1
				{ x0 : 1880, y0 : 1696, x1 : 2078, y1 : 1628},
				//Grass slope 2
				{ x0 : 2078, y0 : 1628, x1 : 2359, y1 : 1579},
				//Grass slope 3
				{ x0 : 2359, y0 : 1579, x1 : 2559, y1 : 1560},
				//Temp lighthouse wall
				{ x0 : 2559, y0 : 1000, x1 : 2559, y1 : 1560}
			);

			//Stores  placement of ladders
			Level.ladders = [
				{ top : 1662, bottom: 1882, left: 1560, right : 1565}
			];

			Tiler.reset();
			Tiler.add([
				{spr : Assets.tiles.sea, x : 0, y : 1877, width : 128, rate : 800, shadow : true, repX : 34, repY : 1, sync : false}
			]);

			//Add level objects
			gameObjs.boat = new Boat(-200, 1835);
			gameObjs.gate = new Gate(2214, 1499);
			gameObjs.VC = new ViewControl();

			//Add level lighting elements
			//light.addBlock(1298, 1882, "rect", 766, 17);
			//light.addBlock(1388, 1755, "mask", "backgrounds/maskDock1.png");

			light.addSource(1348, 1734, 200);
			light.addSource(1864, 1730, 200);
			light.addSource(2564, 1435, 200);
		}
	}
}