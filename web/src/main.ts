import Module from "./generated/runtime.js";

async function main() {
  console.log("STARTING");
  // const wasm_src = await fetch("/generated/runtime.wasm")

  const module = await Module();

  console.log(module);
  const ffi_dynbook_add_page = module.cwrap("ffi_dynbook_add_page", null, ["bigint", "bigint"]);
  const ffi_get_cost = module.cwrap("ffi_get_cost", "number", []);
  const ffi_get_size = module.cwrap("ffi_get_size", "number", []);
  const ffi_normal = module.cwrap("ffi_normal", null, ["number", "number", "number"]);

  console.log(ffi_get_cost());
  console.log(ffi_get_size());
}

main()
