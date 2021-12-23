// Importing a dylib on TypeScript

//import * as Lambolt from "./../../Lambolt/src/Lambolt.ts"
import * as Lambolt from "https://raw.githubusercontent.com/Kindelia/Lambolt/master/src/Lambolt.ts"
import * as Runtime from "./Runtime/Runtime.ts"
import * as Compile from "./Compile/Compile.ts"
import * as Dynbook from "./Compile/Dynbook.ts"
import * as Readback from "./Compile/Readback.ts"

type Mode = "DYNAMIC" | "STATIC";

//const MODE : Mode = "DYNAMIC";
const MODE : Mode = "STATIC";

async function build_runtime(file: Lambolt.File, target: string, mode: Mode) {
  var source_path = new URL("./Runtime/Runtime."+target, import.meta.url);
  var target_path = new URL("./../bin/Runtime."+target, import.meta.url);
  var source_code = await Deno.readTextFile(source_path);
  var target_code = Compile.compile(file, target, mode, source_code);
  await Deno.writeTextFileSync(target_path, target_code);
}

async function c_compile() {
  var bin = (new URL("./../bin/", import.meta.url)).pathname;
  var cmd = "clang -O3 -shared -o "+bin+"Runtime.so "+bin+"Runtime.c";
  var stt = await Deno.run({cmd: cmd.split(" ")}).status();
  console.log(cmd);
}

var c_dylib : any = null;
function c_load_dylib() {
  if (c_dylib === null) {
    var path = new URL("./../bin/Runtime.so", import.meta.url);
    c_dylib = Deno.dlopen(path, {
      "ffi_normal": {parameters: ["buffer","u32", "u32"], result: "u32"},
      "ffi_dynbook_add_page": {parameters: ["u64", "buffer"], result: "void"},
      "ffi_get_gas": {parameters: [], result: "u32"},
    });
  }
  return c_dylib;
}

function c_add_dynbook(book: Runtime.Book) {
  var dylib = c_load_dylib();
  for (var key in book) {
    dylib.symbols.ffi_dynbook_add_page(Number(key), Dynbook.page_serialize(book[key]));
  }
}

function c_normal(mem: Runtime.Mem, host: number): number {
  var dylib = c_load_dylib();
  mem.size = dylib.symbols.ffi_normal(new Uint8Array(mem.data.buffer), mem.size, Number(host)) as number;
  return dylib.symbols.ffi_get_gas() as number;
}

export async function run(code: string, opts: any) {
  // Reads Lambolt file and main
  // ---------------------------
  
  var file = Lambolt.read_file(code);
  var book = Dynbook.compile(file);

  var main = file[file.length - 1];
  if (!main
    || main.$ !== "Rule"
    || main.lhs.$ !== "Ctr"
    || main.lhs.name !== "Main"
    || main.lhs.args.length !== 0) {
    throw "Main not found.";
  }

  // Generates name tables
  // ---------------------
  
  var name_table = Compile.gen_name_table(file);
  var numb_table : {[numb:string]:string} = {};
  for (var name in name_table) {
    if (name[0] !== ".") {
      numb_table[String(name_table[name])] = name;
    }
  }

  // Builds normalizer function
  // --------------------------

  var normal : ((MEM: Runtime.Mem, host: number) => number) | null = null;

  if (opts.target === "c") {
    await build_runtime(file, "c", MODE);
    await c_compile();
    if (MODE === "DYNAMIC") {
      c_add_dynbook(book);
    }
    normal = c_normal;
  }

  if (opts.target === "ts") {
    await build_runtime(file, "ts", MODE);
    var js = await import((new URL("./../bin/Runtime.ts", import.meta.url)).pathname);
    if (MODE === "DYNAMIC") {
      js.add_dynbook(book);
    }
    normal = js.normal;
  }

  // Builds runtime memory
  // ---------------------

  var mem = Runtime.init();
  Runtime.link(mem, 0n, Runtime.Cal(0, name_table["Main"]||0n, 0n));

  // Evaluates main()
  // ----------------

  if (normal !== null) {
    var ini = Date.now();
    var rwt = (normal as any)(mem, 0n);
    console.log(Readback.runtime_to_lambolt(mem, Runtime.ask_lnk(mem,0n), numb_table));
    console.log("");
    console.log("* rwt: " + rwt + " (" + (rwt/((Date.now()-ini)/1000)/1000000).toFixed(2) + "m rwt/s)");
    console.log("* mem: " + mem.size);
  } else {
    console.log("Couldn't load runtime.");
  }
}
