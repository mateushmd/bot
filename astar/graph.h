#ifndef GRAPH_H
#define GRAPH_H

#include <cstdio>
#include <iostream>
#include <vector>
#include <algorithm>
#include <unordered_set>

class Graph{

private:

    int n; // maximum capacity
	int width;
    int last_vert; //current size
    std::vector<std::unordered_set<int>> arr; //adjacency list

public:

    //Constructor
    Graph(int x) {
		width = x;
		n = x*x;
		last_vert = n;
		arr = std::vector<std::unordered_set<int>>(n);
		initMap();
	}

    //Destructor
    ~Graph() = default;

	int vert_count() {
		return last_vert;
	}

	int edge_number (int vert) {
		return (arr[vert].size());
	}

	void initMap (void) {
		for (int i = 0; i < n; i++) {

			int iw = i % width;
			int id = (int)((double)i/(double)width);

			if (iw == 0) {
				add_edge(i, i+1);
			} else if (iw == width-1) {
				add_edge(i, i-1);
			} else {
				add_edge(i, i+1);
				add_edge(i, i-1);
			}

			if (id == 0) {
				add_edge(i, i+width);
			} else if (id == width-1) {
				add_edge(i, i-width);
			} else {
				add_edge(i, i+width);
				add_edge(i, i-width);
			}
		}
	}

	Graph* clone(void) {
		Graph* sub = new Graph(this->n);
		sub->last_vert = this->last_vert;
		sub->arr = this->arr;
		return (sub);
	}

    bool add_edge(int vert1, int vert2){
		bool res = false;
        if(vert1 <= last_vert && vert2 <= last_vert){
            if (arr[vert2].count(vert2) == 0) { 
                arr[vert1].insert(vert2);
				arr[vert2].insert(vert1);
				res = true;
            }
		}
		return (res);
    }

    bool check_edge(int vert1, int vert2){
		bool res = false;
        if(vert1 <= last_vert && vert2 <= last_vert){
			res = (arr[vert1].count(vert2) > 0) && (arr[vert2].count(vert1) > 0);
        }
		return (res);
    }

    bool remove_edge(int vert1, int vert2)
    {
		bool res = false;
        if (check_edge(vert1, vert2)) {
            arr[vert1].erase(vert2);
			arr[vert2].erase(vert1);
			res = true;
        }
		return (res);
    }

    std::unordered_set<int> vert_neighbors(int vert) {
        if(vert <= last_vert){
            return arr[vert];
        } else {
            throw std::invalid_argument("Vertex does not exist");
        }
    }

    void print() const {
        for (int i = 0; i < last_vert; i++) {
			for (int neighbor : arr[i]){
				std::cerr << neighbor << " | ";
			}
			std::cerr << "\n";
        }
    }
};
#endif
