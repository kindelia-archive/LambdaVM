// Importing a dylib on TypeScript

//import * as Lambolt from "./../../Lambolt/src/Lambolt.ts"
import * as Lambolt from "https://raw.githubusercontent.com/Kindelia/Lambolt/master/src/Lambolt.ts"
import * as Runtime from "./Runtime/Runtime.ts"
import * as Compile from "./Compile/Compile.ts"
import * as Dynbook from "./Compile/Dynbook.ts"
import * as Readback from "./Compile/Readback.ts"

type Mode = "DYNAMIC" | "COMPILED";

const MODE : Mode = "DYNAMIC";
//const MODE : Mode = "COMPILED";

function dylib_suffix() {
  switch (Deno.build.os) {
    case "windows": return "dll";
    case "darwin": return "dylib";
    case "linux": return "so";
  }
}

async function build_runtime(file: Lambolt.File, target: string, mode: Mode) {
  var source_path = new URL("./Runtime/Runtime."+target, import.meta.url);
  var target_path = new URL("./../bin/Runtime."+target, import.meta.url);
  var source_code = await Deno.readTextFile(source_path);
  if (mode === "DYNAMIC") {
    var target_code = source_code; // use dynamic book
  } else {
    var target_code = Compile.compile(file, target, source_code); // compile book directly
  }
  await Deno.writeTextFileSync(target_path, target_code);
}

async function c_compile() {
  var bin = (new URL("./../bin/", import.meta.url)).pathname;
  var cm0 = ["clang", "-O3", "-c", "-o", bin+"Runtime.o", bin+"Runtime.c"];
  var cm1 = ["clang", "-O3", "-shared", "-o", bin+"Runtime."+dylib_suffix(), bin+"Runtime.c"];
  var st0 = await Deno.run({cmd: cm0}).status();
  var st1 = await Deno.run({cmd: cm1}).status();
  console.log(cm0.join(" "));
  console.log(cm1.join(" "));
}

var c_dylib : any = null;
function c_load_dylib() {
  if (c_dylib === null) {
    var path = new URL("./../bin/Runtime." + dylib_suffix(), import.meta.url);
    c_dylib = Deno.dlopen(path, {
      "normal_ffi": {
        parameters: ["buffer","u32", "u32"],
        result: "u32",
      },
      "dynbook_page_init_ffi": {
        parameters: ["u64", "buffer", "u64", "u64"],
        result: "void",
      },
      "dynbook_page_add_rule_ffi": {
        parameters: ["u64", "u64", "buffer", "u64", "buffer", "u64", "buffer", "u64", "buffer", "buffer", "u64"],
        result: "void",
      },
      "get_gas": {
        parameters: [],
        result: "u32"
      },
    });
  }
  return c_dylib;
}

function c_add_dynbook(book: Runtime.Book) {
  //export type Page = {
    //match: Array<number>,
    //rules: Array<{
      //test: Array<number>, 
      //clrs: Array<number>,
      //cols: Array<Lnk>,
      //root: Lnk,
      //body: Array<Lnk>,
    //}>
  //}
  
  function prepare_numbers(numbers: Array<number>): Uint8Array {
    var data = new BigUint64Array(numbers.length);
    for (var i = 0; i < numbers.length; ++i) {
      data[i] = BigInt(numbers[i]);
    }
    return new Uint8Array(data.buffer);
  }

  function prepare_lnks(lnks: Array<Runtime.Lnk>): Uint8Array {
    var data = new BigUint64Array(lnks.length);
    for (var i = 0; i < lnks.length; ++i) {
      var lnk = lnks[i];
      var num = 0n;
      var num = num | BigInt(Runtime.get_tag(lnk));
      var num = num | BigInt(Runtime.get_ext(lnk));
      var num = num | BigInt(Runtime.get_val(lnk));
      var num = num | (Runtime.is_cal(lnk) ? 0x8000000000000000n : 0n);
      data[i] = num;
    }
    return new Uint8Array(data.buffer);
  }

  var dylib = c_load_dylib();

  //console.log(JSON.stringify(book,null,2));

  // For each page
  for (var key in book) {
    var page = book[key];

    // Adds this page
    var page_index = Number(key);
    var match_data = prepare_numbers(page.match);
    var match_size = page.match.length;
    var count      = page.rules.length;
    dylib.symbols.dynbook_page_init_ffi(
      page_index,
      match_data,
      match_size,
      count,
    );

    // Adds this page's rules
    for (var rule_index = 0; rule_index < page.rules.length; ++rule_index) {
      var rule      = page.rules[rule_index];
      var test_data = prepare_numbers(rule.test);
      var test_size = rule.test.length;
      var clrs_data = prepare_numbers(rule.clrs);
      var clrs_size = rule.clrs.length;
      var cols_data = prepare_lnks(rule.cols);
      var cols_size = rule.cols.length;
      var root      = prepare_lnks([rule.root]);
      var body_data = prepare_lnks(rule.body);
      var body_size = rule.body.length;
      //console.log("page_index:", (page_index));
      //console.log("rule_index:", (rule_index));
      //console.log("test_data:", (new BigUint64Array(test_data.buffer)));
      //console.log("test_size:", (test_size));
      //console.log("clrs_data:", (new BigUint64Array(clrs_data.buffer)));
      //console.log("clrs_size:", (clrs_size));
      //console.log("cols_data:", (new BigUint64Array(cols_data.buffer)));
      //console.log("cols_size:", (cols_size));
      //console.log("root     :", (new BigUint64Array(root.buffer)));
      //console.log("body_data:", (new BigUint64Array(body_data.buffer)));
      //console.log("body_size:", (body_size));
      //console.log("");
      dylib.symbols.dynbook_page_add_rule_ffi(
        page_index,
        rule_index,
        test_data,
        test_size,
        clrs_data,
        clrs_size,
        cols_data,
        cols_size,
        root,
        body_data,
        body_size,
      );
    }
  }
}

function c_normal(mem: Runtime.Mem, host: number): number {
  var dylib = c_load_dylib();

  //function js_to_c(f64: Float64Array, size: number): Float64Array {
    //var u64 = new BigInt64Array(size);
    //for (var i = 0; i < size; ++i) {
      //var lnk = f64[i];
      //var num = 0n;
      //var num = num | BigInt(Runtime.get_tag(lnk));
      //var num = num | BigInt(Runtime.get_ext(lnk));
      //var num = num | BigInt(Runtime.get_val(lnk));
      //var num = num | BigInt(Runtime.is_cal(lnk) ? 0x8000000000000000n : 0n);
      //u64[i] = num;
    //}
    //return new Float64Array(u64.buffer);
  //}

  //function c_to_js(arr: Float64Array, size: number): Float64Array {
    //var u64 = new BigInt64Array(arr.buffer);
    //var f64 = new Float64Array(size);
    //for (var i = 0; i < size; ++i) {
      //var tag = Number(u64[i] & 0x001F000000000000n);
      //var ext = Number(u64[i] & 0x0000FFFF00000000n);
      //var val = Number(u64[i] & 0x00000000FFFFFFFFn);
      //var ict = u64[i] >= 0n ? 1 : -1;
      //f64[i] = ict * (tag + ext + val);
    //}
    //return f64;
  //}

  //console.log("size:" + mem.size);
  //console.log("data:", mem.data.slice(0,2));
  

  //var ini = Date.now();
  //mem.data.set(js_to_c(mem.data, mem.size));
  //console.log("a", Date.now() - ini);

  //var ini = Date.now();
  
  mem.size = dylib.symbols.normal_ffi(new Uint8Array(mem.data.buffer), mem.size, host) as number;

  //mem.size = 1;
  //console.log("b", Date.now() - ini);

  //var ini = Date.now();
  //mem.data.set(c_to_js(mem.data, mem.size));
  //console.log("c", Date.now() - ini, mem.size);

  //console.log("size:" + mem.size);
  //console.log("data:", mem.data.slice(0,2));

  return dylib.symbols.get_gas() as number;
}

export async function run(code: string, opts: any) {
  // Reads Lambolt file and main
  // ---------------------------
  
  var file = Lambolt.read_file(code);
  var book = Dynbook.compile(file);
  //console.log(Lambolt.show_file(file));

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
    c_add_dynbook(book);
    normal = c_normal;
  }

  if (opts.target === "ts") {
    await build_runtime(file, "ts", MODE);
    var js = await import((new URL("./../bin/Runtime.ts", import.meta.url)).pathname);
    js.add_dynbook(book);
    normal = js.normal;
  }

  // Builds runtime memory
  // ---------------------

  var mem = Runtime.init();
  Runtime.link(mem, 0, Runtime.Cal(0, name_table["Main"]||0, 0));

  // Evaluates main()
  // ----------------

  if (normal !== null) {
    var ini = Date.now();
    //console.log(Convert.runtime_to_lambolt(mem, Runtime.ask_lnk(mem,0), numb_table));
    var rwt = (normal as any)(mem, 0);
    console.log(Readback.runtime_to_lambolt(mem, Runtime.ask_lnk(mem,0), numb_table));
    console.log("");
    console.log("* rwt: " + rwt + " (" + (rwt/((Date.now()-ini)/1000)/1000000).toFixed(2) + "m rwt/s)");
    console.log("* mem: " + mem.size);
  } else {
    console.log("Couldn't load runtime.");
  }
}
