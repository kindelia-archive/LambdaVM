// Importing a dylib on TypeScript

//import * as Lambolt from "./../../Lambolt/src/Lambolt.ts"
import * as Lambolt from "https://raw.githubusercontent.com/Kindelia/Lambolt/master/src/Lambolt.ts"
import * as Runtime from "./Runtime/Runtime.ts"
import * as Compile from "./Compile/Compile.ts"
import * as Convert from "./Compile/Convert.ts"

function dylib_suffix() {
  switch (Deno.build.os) {
    case "windows": return "dll";
    case "darwin": return "dylib";
    case "linux": return "so";
  }
}

async function build_runtime(file: Lambolt.File, target: string) {
  var source_path = new URL("./Runtime/Runtime."+target, import.meta.url);
  var target_path = new URL("./../bin/Runtime."+target, import.meta.url);
  var source_code = await Deno.readTextFile(source_path);
  var target_code = Compile.compile(file, target, source_code);
  await Deno.writeTextFileSync(target_path, target_code);
}

async function compile_c_dylib() {
  var bin = (new URL("./../bin/", import.meta.url)).pathname;
  var st0 = await Deno.run({cmd: ["clang", "-O3", "-c", "-o", bin+"Runtime.o", bin+"Runtime.c"]}).status();
  var st1 = await Deno.run({cmd: ["clang", "-O3", "-shared", "-o", bin+"Runtime."+dylib_suffix(), bin+"Runtime.c"]}).status();
}

function load_c_dylib() {
  var path = new URL("./../bin/Runtime." + dylib_suffix(), import.meta.url);
  return Deno.dlopen(path, {
    "normal_ffi": {
      parameters: [
        "buffer","u32", "buffer","u32", "buffer","u32", "buffer","u32",
        "buffer","u32", "buffer","u32", "buffer","u32", "buffer","u32",
        "buffer","u32", "buffer","u32", "u32"
      ],
      result: "u32",
    },
    "get_gas": {
      parameters: [],
      result: "u32"
    },
  });
}

function normal_clang(MEM: Runtime.Mem, host: number): number {
  var dylib = load_c_dylib();

  function convert(arr: Uint32Array): Uint8Array {
    return new Uint8Array(arr.buffer);
  }

  MEM.lnk.size = dylib.symbols.normal_ffi(
    convert(MEM.lnk.data), MEM.lnk.size,
    convert(MEM.use[0].data), MEM.use[0].size,
    convert(MEM.use[1].data), MEM.use[2].size,
    convert(MEM.use[2].data), MEM.use[2].size,
    convert(MEM.use[3].data), MEM.use[3].size,
    convert(MEM.use[4].data), MEM.use[4].size,
    convert(MEM.use[5].data), MEM.use[5].size,
    convert(MEM.use[6].data), MEM.use[6].size,
    convert(MEM.use[7].data), MEM.use[7].size,
    convert(MEM.use[8].data), MEM.use[8].size,
    host
  ) as number;

  return dylib.symbols.get_gas() as number;
}

export async function run(code: string, opts: any) {

  // Reads file as Lambolt Defs
  // --------------------------
  
  var file = Lambolt.read(Lambolt.parse_file, code);

  //console.log(Lambolt.show_file(file));
  var main = file[file.length - 1];
  if (!(main && main.$ === "Rule" && main.lhs.$ === "Ctr" && main.lhs.name === "Main" && main.lhs.args.length === 0)) {
    throw "Main not found.";
  }
  var name_table = Compile.gen_name_table(file);
  var numb_table : {[numb:string]:string} = {};
  for (var name in name_table) {
    numb_table[String(name_table[name])] = name;
  }

  // Builds normalizer function
  // --------------------------

  var normal : ((MEM: Runtime.Mem, host: number) => number) | null = null;

  if (opts.target === "c") {
    await build_runtime(file, "c");
    await compile_c_dylib();
    normal = normal_clang;
  }

  if (opts.target === "ts") {
    await build_runtime(file, "ts");
    normal = (await import((new URL("./../bin/Runtime.ts", import.meta.url)).pathname)).normal;
  }

  // Builds runtime memory
  // ---------------------

  var mem = Runtime.init();
  Runtime.link(mem, 0, Runtime.Cal(name_table["Main"] || 0, 0, 0));

  // Evaluates main()
  // ----------------

  if (normal !== null) {
    console.log("Running...");
    var ini = Date.now();
    var rwt = normal(mem, 0);
    console.log(Convert.runtime_to_lambolt(mem, Runtime.deref(mem,0), numb_table));
    console.log("");
    console.log("* gas: " + rwt);
    console.log("* mem: " + mem.lnk.size);
    console.log("* rwt: " + rwt + " (" + (rwt/((Date.now()-ini)/1000)/1000000).toFixed(2) + "m rwt/s)");
  } else {
    console.log("Couldn't load runtime.");
  }
}
