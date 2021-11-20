// Importing a dylib on TypeScript

import * as Kindash from "./Kindash/Language.ts"
import * as Crusher from "./Crusher/Language.ts"
import * as Compile from "./Compile/Compile.ts"
import * as Convert from "./Compile/Convert.ts"

function dylib_suffix() {
  switch (Deno.build.os) {
    case "windows": return "dll";
    case "darwin": return "dylib";
    case "linux": return "so";
  }
}

async function build_runtime(file: Kindash.File, target: string) {
  var comp = Compile.compile(file, target);
  var srcp = new URL("./Crusher/Runtime."+target, import.meta.url);
  var trgp = new URL("./../bin/Runtime."+target, import.meta.url);
  var code = (await Deno.readTextFile(srcp)).replace("//GENERATED_CODE//", comp);
  await Deno.writeTextFileSync(trgp, code);
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
  });
}

function normal_clang(MEM: Crusher.Mem, host: Crusher.Loc): number {
  var dylib = load_c_dylib();

  function convert(arr: Uint32Array): Uint8Array {
    return new Uint8Array(arr.buffer);
  }

  return dylib.symbols.normal_ffi(
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
}

export async function run(code: string, opts: any) {
  var file = Kindash.read(Kindash.parse_file, code);

  var main = file.funs[file.funs.length-1];
  if (main.name !== "main" || main.body.ctor !== "Ret") {
    throw "Main not found.";
  }

  var term = main.body.expr;
  var core = opts.core ? code : Convert.kindash_to_crusher(term, Compile.gen_name_table(file));

  var normal : ((MEM: Crusher.Mem, host: Crusher.Loc) => number) | null = null;

  if (opts.target === "c") {
    await build_runtime(file, "c");
    await compile_c_dylib();
    normal = normal_clang;
  }

  if (opts.target === "ts") {
    await build_runtime(file, "ts");
    var Runtime = await import((new URL("./../bin/Runtime.ts", import.meta.url)).pathname);
    normal = Runtime.normal;
  }


  console.log("Term:\n=====\n" + Kindash.show_term(term) + "\n");
  console.log("Core:\n=====\n" + core + "\n");

  if (normal !== null) {
    var mem = Crusher.read_term(core);
    var gas = normal(mem, 0);
    console.log("Norm:\n=====\n" + Convert.crusher_to_kindash(mem) + "\n");
    console.log("Cost:\n=====\n- gas: " + gas + " \n- mem: " + mem.lnk.size);
  } else {
    console.log("Couldn't load runtime.");
  }
}

//var code = `
//con 0 false{}
//con 1 true{}
//con 0 zero{}
//con 1 succ{pred}

//fun not(x):
  //case x {
    //false{}: true{}
    //true{}: false{}
  //}

//fun double(x):
  //case x {
    //zero{}: zero{}
    //succ{pred}: succ{succ{double(pred)}}
  //}

//fun main():
  //double(succ{succ{succ{zero{}}}})
//`

//run(code, {target: "ts"});
////console.log(Kindash.show_file(Kindash.read(Kindash.parse_file, code)));


