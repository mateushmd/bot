#!/bin/sh
em++ astar/main.cc -O3 \
	 -o astar.js \
	 --js-library wasm-lib.js \
	 -sNO_EXIT_RUNTIME=1 \
	 -sASSERTIONS=0 \
	 -sEXIT_RUNTIME=0 \
	 -sINVOKE_RUN=0 \
	 -sEXPORTED_FUNCTIONS=_main \
	 -sEXPORTED_RUNTIME_METHODS=ccall
