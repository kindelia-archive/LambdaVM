clang -O3 -c -o bin/optimal_calculus.o optimal_calculus.c
clang -O3 -shared -Wl -o bin/optimal_calculus.dylib bin/optimal_calculus.o
