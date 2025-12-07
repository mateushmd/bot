#include <iostream>

extern "C" {

	extern void console(const std::string& text);

	extern bool wallFront();
	extern bool wallRight();
	extern bool wallLeft();

	extern void moveForward(int distance);

	extern void turnRight();
	extern void turnLeft();

	extern void setWall(int x, int y, char direction);
	extern void clearWall(int x, int y, char direction);

	extern void setColor(int x, int y, char color);
	extern void clearColor(int x, int y);
	extern void clearAllColor();

	extern void setText(int x, int y, const std::string& text);
	extern void clearText(int x, int y);
	extern void clearAllText();

	extern void ackReset();
}
