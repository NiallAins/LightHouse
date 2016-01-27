var Level = {

	//Place objects in level
	load : {
		testLevel : function() {
			gameObjs = [];

			//Set level background
			can.style.backgroundImage = 'url("backgrounds/roomDock.png")';

			//Add controllable character
			gameObjs.push(new Guy(822, 230));

			//Stores Y, start X and end X of each piece of ground
			boundarys = [
				{ x0 : 0, y0 : 464, x1 : 1324, y1 : 464},
				{ x0 : 600, y0 : 464, x1 : 600, y1 : 0},
				{ x0 : 1024, y0 : 464, x1 : 1024, y1 : 0},
				{ x0 : 588, y0 : 275, x1 : 1324, y1 : 275, type : 'platform'}
			];
			ladders = [
				{ top : 250, bottom: 464, left: 895, right : 900}
			];

			Tiler.reset();
			Tiler.add([
				{spr : Assets.tiles.sea, x : 0, y : 453, width : 128, rate : 800, shadow : true, repX : 10, repY : 1, sync : false}
			]);

			//Add level lighting elements
			light.addBlock(631, 464, "rect", 393, 16);
			light.addBlock(720, 337, "mask", "backgrounds/maskDock1.png");

			light.addSource(682, 316, 200);
		}
	}
}