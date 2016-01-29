var Level = {
	boundarys : [],
	ladders : [],
	x : 0,
	y : 0,
	bgX : 0,
	bgY : 0,

	//Place objects in level
	load : {
		testLevel : function() {
			gameObjs = [];

			//Set level background and view
			Level.x = 0;
			Level.y = -1424;
			can.style.backgroundImage = 'url("backgrounds/roomDock2.png")';
			can.style.backgroundPosition = Level.x + 'px ' + Level.y;

			//Add controllable character
			//gameObjs.push(new Guy(1300, 1230));
			//Add boat
			gameObjs.push(new Boat(200, 1835));

			//Stores Y, start X and end X of each piece of ground
			Level.boundarys = [
				//Pier
				{ x0 : 1240, y0 : 1882, x1 : 2075, y1 : 1882},
				//Grass 1
				{ x0 : 1240, y0 : 1696, x1 : 1837, y1 : 1696, type : 'platform'},
				//Pier wall 1
				{ x0 : 1295, y0 : 1700, x1 : 1295, y1 : 1887},
				//Pier wall 2 
				{ x0 : 2063, y0 : 1696, x1 : 2063, y1 : 1887},
				//Temp grass wall
				{ x0 : 1820, y0 : 1424, x1 : 1820, y1 : 1706},
				//Grass wall1 
				{ x0 : 1250, y0 : 1424, x1 : 1250, y1 : 1706}
			];
			Level.ladders = [
				{ top : 1662, bottom: 1882, left: 1560, right : 1565}
			];

			Tiler.reset();
			Tiler.add([
				{spr : Assets.tiles.sea, x : 0, y : 1877, width : 128, rate : 800, shadow : true, repX : 34, repY : 1, sync : false}
			]);

			//Add level lighting elements
			//light.addBlock(1298, 1882, "rect", 766, 17);
			//light.addBlock(1388, 1755, "mask", "backgrounds/maskDock1.png");

			light.addSource(1348, 1734, 200);
			light.addSource(1864, 1730, 200);
			light.addSource(2564, 1435, 200);
		}
	}
}