#include <cmath>
#include <queue>
#include <string>
#include <vector>
#include <cstdint>
#include "graph.h"
#include "api.h"

#define M_Width 16
#define M_Size (M_Width*M_Width)

static int PPos = 0;
static uint8_t facing = 0; // 0 -> Up
					   	   // 1 -> Right
					       // 2 -> Down
					   	   // 3 -> Left

static Graph G = Graph(M_Width);
int dist [3][M_Size]; // 0 -> G
					  // 1 -> H
					  // 2 -> Father

inline int getX (int u) {
	return (u % M_Width);
}

inline int getY (int u) {
	return ((int)((double)u/(double)M_Width));
}

inline int toLinear(int x, int y) {
	return (x + (M_Width*y));
}

inline int randomH (void) {
	return rand() % M_Width;
}

inline int euclidean (int u, int v) {
	int ux = getX(u);
	int uy = getY(u);

	int vx = getX(v);
	int vy = getY(v);

	return ( sqrt( abs((vx*vx) - (ux*ux)) + abs((vy*vy) - (uy*uy)) ) );
}

inline int manhattan (int u, int v) {
	int ux = getX(u);
	int uy = getY(u);

	int vx = getX(v);
	int vy = getY(v);

	return ((abs(ux-vx) + abs(uy-vy)));
}

inline int chebyshev (int u, int v) {
	int ux = getX(u);
	int uy = getY(u);

	int vx = getX(v);
	int vy = getY(v);

	return std::max(abs(ux-vx), abs(uy-vy));
}

inline int heuristic (int u, int d1, int d2) {
	return std::min(manhattan(u, d1), manhattan(u, d2));
//		return std::min(euclidean(u, d1), euclidean(u, d2));
//		return std::min(chebyshev(u, d1), chebyshev(u, d2));
//		return randomH();
//		return 0;	// Essencialy the same as running a BFS or Dijkstra's algorithm
}

inline int F(int u) {
	return (dist[0][u] + dist[1][u]);
}

inline bool isValid(int u) {
	return (u > 0 && u < M_Size);
}

bool inRange(int u, int d1, int d2) {
	bool res = false;

	if (isValid(u) && isValid(d1) && isValid(d2)) {
		if (d1 > d2) {
			std::swap(d1, d2);
		}

		int ux = getX(u);
		int uy = getY(u);

		int d1x = getX(d1);
		int d1y = getY(d1);

		int d2x = getX(d2);
		int d2y = getY(d2);

		res = ((ux >= d1x && ux <= d2x) && (uy >= d1y && uy <= d2y));
	}

	return (res);
}

// Priority queue order condition
struct minHeap {
	bool operator() (const int u, const int v) {
		bool res = false;
		if (F(u) == F(v)) {
			res = (dist[1][u] > dist[1][v]);
		} else {
			res = F(u) > F(v);
		}
		return (res);
	}
};

std::vector<int> astar(const int d1, const int d2)
{
	clearAllText();

    bool visited[M_Size];
    for (int i = 0; i < M_Size; i++) {
        dist[0][i] = 0x7fffffff;           // G
        dist[2][i] = 0x7fffffff;           // Parent
        visited[i] = false;
    }

	dist[0][PPos] = 0;
	std::priority_queue<int, std::vector<int>, minHeap> pq;

	pq.push(PPos);

	int stop = -1;
	while (!pq.empty() && stop == -1){
		int u = pq.top();
		pq.pop();

		if (inRange(u, d1, d2)) {
			stop = u; 	// Save the goal node reached
		} else {
			if (!visited[u]) {
				visited[u] = true;

				for (int v : G.vert_neighbors(u)) {

					if (!visited[v]) {

						// If the G factor of u+1 is smaller than v's
						if (dist[0][v] > (dist[0][u] + 1)) {
							dist[0][v] = dist[0][u] + 1;
						}

						// Check to avoid overwriting with the same value
						if (dist[1][v] == 0x7fffffff) {
							dist[1][v] = heuristic(v, d1, d2);
						}

						// Set u as v's father
						dist[2][v] = u;

						int vx = getX(v);
						int vy = getY(v);
						setText(vx, vy, std::to_string(dist[0][v]) + ", " + std::to_string(dist[1][v]));

						pq.push(v);
					}
				}
			}
		}
	}

	std::vector<int> path;

	int i = stop;
	while (i >= 0 && i != PPos) {
		path.push_back(i);
		i = dist[2][i];
	}
	path.push_back(i);

	return (path);
}

void face (int dir) {
	if (abs(facing-dir) == 2) {
		turnLeft();
		turnLeft();
	} else {
		if (facing == 0) {
			if (dir == 1) {
				turnRight();
			} else if (dir == 3) {
				turnLeft();
			}
		} else if (facing == 1) {
			if (dir == 0) {
				turnLeft();
			} else if (dir == 2) {
				turnRight();
			}
		} else if (facing == 2) {
			if (dir == 1) {
				turnLeft();
			} else if (dir == 3) {
				turnRight();
			}
		} else if (facing == 3) {
			if (dir == 0) {
				turnRight();
			} else if (dir == 2) {
				turnLeft();
			}
		}
	}
	facing = dir;
}

void turn (int u, int v) {
	int ux = getX(u);
	int uy = getY(u);

	int vx = getX(v);
	int vy = getY(v);

	int dir = facing;

	if (ux > vx) {
		dir = 3;
	} else if (ux < vx) {
		dir = 1;
	} else if (uy > vy) {
		dir = 2;
	} else if (uy < vy) {
		dir = 0;
	}

	if (facing != dir) {
		face(dir);
	}
}

bool checkWalls(void) {
    bool res = false;
    
    int L = -1;
	int R = -1;
	int F = -1;
    
    char wL = 0;
	char wR = 0;
	char wF = 0;

    int px = getX(PPos);
    int py = getY(PPos);

    if (facing == 0) {
        if (px > 0)           { L = PPos - 1;       wL = 'w'; } 
        if (px < M_Width - 1)   { R = PPos + 1;       wR = 'e'; } 
        if (py < M_Width - 1)  { F = PPos + M_Width;   wF = 'n'; } 
    } 
    else if (facing == 1) { 
        if (py < M_Width - 1)  { L = PPos + M_Width;   wL = 'n'; } 
        if (py > 0)           { R = PPos - M_Width;   wR = 's'; } 
        if (px < M_Width - 1)   { F = PPos + 1;       wF = 'e'; } 
    } 
    else if (facing == 2) {
        if (px < M_Width - 1)   { L = PPos + 1;       wL = 'e'; } 
        if (px > 0)           { R = PPos - 1;       wR = 'w'; } 
        if (py > 0)           { F = PPos - M_Width;   wF = 's'; } 
    } 
    else if (facing == 3) {
        if (py > 0)           { L = PPos - M_Width;   wL = 's'; } 
        if (py < M_Width - 1)  { R = PPos + M_Width;   wR = 'n'; } 
        if (px > 0)           { F = PPos - 1;       wF = 'w'; } 
    }

    if (L != -1 && wallLeft() && G.check_edge(PPos, L)) {
		G.remove_edge(PPos, L);
		setWall(px, py, wL);
		res = true;
    }

    if (R != -1 && wallRight() && G.check_edge(PPos, R)) {
		G.remove_edge(PPos, R);
		setWall(px, py, wR);
		res = true;
    }

    if (F != -1 && wallFront() && G.check_edge(PPos, F)) {
		G.remove_edge(PPos, F);
		setWall(px, py, wF);
		res = true;
    }

    return res;
}

void move (std::vector<int> path) {

	clearAllColor();

	setColor(getX(PPos), getY(PPos), 'g');

	for (int i = (int)path.size()-2; i > 0; i--) {
		int u = path[i];
		int ux = getX(u);
		int uy = getY(u);
		setColor(ux, uy, 'b');
	}

	int dest = path.front();
	int dx = getX(dest);
	int dy = getY(dest);
	setColor(dx, dy, 'r');

	for (int i = (int)path.size()-2; i > -1; i--) {
//			fprintf(stderr, "[%d]\n", path[i]);
		if (!checkWalls()) {
			turn(PPos, path[i]);
			moveForward(1);
			PPos = path[i];
		} else {
//				fprintf(stderr, "New wall detected - Running A*\n");
			i = -1;
		}
	}
//		fprintf(stderr, "\n---\n\n");
}

int main (void) {

	srand(time(NULL));
    for (int i = 0; i < M_Size; i++) {
        dist[1][i] = 0x7fffffff; // H
    }

	while (true) {

		int dx1 = 7;
		int dy1 = 7;

		int dx2 = 8;
		int dy2 = 8;

		int d1 = toLinear(dx1, dy1);
		int d2 = toLinear(dx2, dy2);

		PPos = 0;
		facing = 0;

		while (!inRange(PPos, d1, d2)) {
			move(astar(d1, d2));
		}
		ackReset();
	}
	return(0);
}
