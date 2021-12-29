import Module from "./generated/runtime.js";
import { Dynbook, Runtime, Lambolt } from "./generated/base.js"

import type { Page, Book } from "./types"

async function load_lib(): Promise<[any, Lib]> {
  const module = await Module(null);
  const lib: Lib = {
    ffi_dynbook_add_page: module.cwrap("ffi_dynbook_add_page", null, ["bigint", "array"]),
    ffi_dynbook_add_page__pt: module.cwrap("ffi_dynbook_add_page", null, ["bigint", "bigint"]),
    ffi_get_cost: module.cwrap("ffi_get_cost", "number", []),
    ffi_get_size: module.cwrap("ffi_get_size", "bigint", []),
    ffi_normal: module.cwrap("ffi_normal", null, ["number", "number", "number"]),
  }
  return [module, lib];
}

type Pt = bigint;
interface Lib {
  ffi_dynbook_add_page: (page_index: number, page_data: Uint8Array) => void;
  ffi_dynbook_add_page__pt: (page_index: bigint, page_data: Pt) => void;
  ffi_get_cost: () => number;
  ffi_get_size: () => bigint;
  ffi_normal: (mem_data: Pt, mem_size: number, host: number) => void;
}

type Sized<T> = {
  size: number;
  data: T;
}

// function array_alloc(capacity: number): Sized<SharedArrayBuffer> {
//   return {
//     size: 0,
//     data: new SharedArrayBuffer(capacity),
//   }
// }

// function array_to_u64_array(arr: Sized<ArrayBufferLike>): Sized<BigUint64Array> {
//   return {
//     size: arr.size,
//     data: new BigUint64Array(arr.data),
//   }
// }

// function page_serialize(page: Page) {
//   const arr = Dynbook.page_to_u64_array(page);
//   new Uint8Array(arr.buffer);
// }

function add_dynbook(lib: Lib, book: Book) {
  for (var key in book) {
    lib.ffi_dynbook_add_page(Number(key), Dynbook.page_serialize(book[key]));
  }
}

const CODE = `
// Doubles a natural number
(Double (Zero))   = (Zero)
(Double (Succ x)) = (Succ (Succ (Double x)))

// Computes 3 * 3
(Main) = (Double (Succ (Succ (Succ (Zero)))))
`;

async function main() {
  console.log("STARTING");
  // const wasm_src = await fetch("/generated/runtime.wasm")

  const [module, lib] = await load_lib();

  const file = Lambolt.read_file(CODE);
  const book: any = Dynbook.compile(file);

  console.log(book);

  add_dynbook(lib, book);

  // const arr = array_alloc(2**29);
  // const arr_64 = new BigUint64Array(arr.data);

  console.log(lib.ffi_get_cost());
  console.log(lib.ffi_get_size());
}

main()
