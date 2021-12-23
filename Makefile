emscripten:
	mkdir -p ./web/src/generated
	mkdir -p ./web/serve/
	emcc --no-entry \
		-s MODULARIZE=1 -s EXPORT_ES6 \
		-s TOTAL_MEMORY=67108864 \
		-s EXPORTED_FUNCTIONS=_malloc,_ffi_dynbook_add_page,_ffi_get_cost,_ffi_get_size,_ffi_normal \
		-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
		./src/Runtime/Runtime.c \
		-o ./web/src/generated/runtime.js
	mv ./web/src/generated/runtime.wasm ./web/serve/js/generated/

wasm-pure:
	clang \
		-DWASM=1 \
		--target=wasm64 \
		--no-standard-libraries \
		-fno-builtin \
		-Wl,--export-all -Wl,--no-entry \
		-o ./build/runtime.wasm \
		./src/Runtime/Runtime.c

native:
	@#clang -c -o ./build/runtime.o ./src/Runtime/Runtime.c
	clang -shared -o ./build/runtime.dylib ./src/Runtime/Runtime.c
