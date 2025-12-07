addToLibrary({
	wallFront: function () {
		return robot.canWalk(robot.facing)
	},
	wallRight: function () {
		return robot.canWalk(globalThis.rightOf(robot.facing))
	},
	wallLeft: function () {
		return robot.canWalk(globalThis.leftOf(robot.facing))
	},

	moveForward: function (distance) {
		console.log("movee: ", distance);
		robot.move()
	},

	turnRight: function () {
		robot.turnRight()
	},
	turnLeft: function () {
		robot.turnLeft()
	},

	console: function(ptr) {
		var text = UTF8ToString(ptr);
		console.log(text);
	},

	setWall: function (x, y, direction) { },
	clearWall: function (x, y, direction) { },

	setColor: function (x, y, color) { },
	clearColor: function (x, y) { },
	clearAllColor: function () { },

	setText: function (x, y, text) { },
	clearText: function (x, y) { },
	clearAllText: function () { },

	ackReset: function () { },
})
