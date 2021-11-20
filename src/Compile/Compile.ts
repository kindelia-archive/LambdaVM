import * as K from "./../Kindash/Language.ts"

// Compiler
// --------

function line(tab: number, text: string) {
  for (var i = 0; i < tab; ++i) {
    text = "  " + text;
  }
  return text + "\n";
}

export function sanitize(func: K.Function): K.Function {
  var size = 0;
  function fresh() : string {
    return "x" + (size++);
  }

  function sanitize_func(func: K.Function): K.Function {
    var name = func.name;
    var table : {[key:string]:string} = {};
    for (var arg_name of func.args) {
      table[arg_name] = fresh();
    }
    var args = func.args.map(x => table[x] || x);
    var body = sanitize_match(func.body, table);
    return K.Fun(name, args, body);
  }

  function sanitize_match(match: K.Match, table: {[key:string]:string}): K.Match {
    switch (match.ctor) {
      case "Mat": {
        let expr = table[match.expr] || match.expr;
        let cses : Array<K.Case> = match.cses.map((cse) => {
          let func : string = cse.func;
          let args : Array<string> = cse.args;
          let body : K.Match = cse.body;
          let new_table = {...table};
          for (let arg of args) {
            new_table[arg] = fresh();
          }
          let new_args = args.map(x => new_table[x] || x);
          let new_body = sanitize_match(body, new_table);
          return K.Cse(func, new_args, new_body);
        })
        return K.Mat(expr, cses);
      }
      case "Ret": {
        let expr = sanitize_term(match.expr, table); 
        return K.Ret(expr);
      }
    }
  }

  function sanitize_term(term: K.Term, table: {[key:string]:string}): K.Term {
    switch (term.ctor) {
      case "Var": {
        return K.Var(table[term.name] || term.name);
      }
      case "Dup": {
        let nam0 = fresh();
        let nam1 = fresh();
        let expr = sanitize_term(term.expr, table);
        let body = sanitize_term(term.body, {...table, [term.nam0]: nam0, [term.nam1]: nam1});
        return K.Dup(nam0, nam1, expr, body);
      }
      case "Lam": {
        let name = fresh();
        let body = sanitize_term(term.body, {...table, [term.name]: name});
        return K.Lam(name, body);
      }
      case "App": {
        let func = sanitize_term(term.func, table);
        let argm = sanitize_term(term.argm, table);
        return K.App(func, argm);
      }
      case "Ctr": {
        let func = term.func;
        let args = term.args.map(x => sanitize_term(x,table));
        return K.Ctr(func, args);
      }
      case "Cal": {
        let func = term.func;
        let args = term.args.map(x => sanitize_term(x, table));
        return K.Cal(func, args);
      }
    }
  }

  return sanitize_func(func);
}

export function compile_function(func: K.Function, table: {[name:string]:number}, target: string, tab: number): string {
  if (target === "ts") {
    var VAR = "var"; 
    var GAS = "++GAS";
  } else if (target === "c") {
    var VAR = "u64";
    var GAS = "+GAS";
  } else {
    throw "Unknown target: " + target;
  }
  
  function compile_function(func: K.Function, tab: number) {
    text += line(tab, "case " + table[func.name] + ": {");
    for (var i = 0; i < func.args.length; ++i) {
      locs[func.args[i]] = define("loc", "get_loc(term, "+i+")", tab+1);
      args[func.args[i]] = define("arg", "get_lnk(MEM, term, "+i+")", tab+1);
    }
    var clear = ["clear(MEM, get_loc(term, 0), "+func.args.length+")"];
    compile_match(func.body, clear, tab + 1)
    //text += line(tab+1, "break;");
    text += line(tab, "}");
  }

  function compile_match(match: K.Match, clear: Array<string>, tab: number) {
    switch (match.ctor) {
      case "Mat":
        //console.log("get", match.expr, args);
        var expr_name = locs[match.expr] || "";
        text += line(tab, VAR+" " + expr_name + "$ = reduce(MEM, " + expr_name + ");");
        text += line(tab, "switch (get_tag("+expr_name+"$) == CTR ? get_ex0(" + expr_name + "$) : -1) {");
        for (var i = 0; i < match.cses.length; ++i) {
          text += line(tab+1, "case " + i + ": {");
          var cse = match.cses[i];
          for (var j = 0; j < cse.args.length; ++j) {
            locs[cse.args[j]] = define("fld_loc", "get_loc("+expr_name+"$, "+j+")", tab + 2);
            args[cse.args[j]] = define("fld_arg", "get_lnk(MEM, "+expr_name+"$, "+j+")", tab + 2);
          }
          var cse_clear = ["clear(MEM, get_loc("+expr_name+"$, 0), "+cse.args.length+")"].concat(clear);
          compile_match(cse.body, cse_clear, tab + 2);
          text += line(tab+1, "}");
        }
        text += line(tab, "}");
        break;
      case "Ret":
        if (GAS) {
          text += line(tab, "++GAS;");
        }
        var done = compile_term(match.expr, tab);
        text += line(tab, "link(MEM, host, " + done + ");"); 
        for (var eraser of clear) {
          text += line(tab, eraser + ";");
        }
        text += line(tab, "continue;");
        break;
    }
  }

  function compile_term(term: K.Term, tab: number) : string {
    switch (term.ctor) {
      case "Var":
        //console.log("->", term.name, args);
        return args[term.name] ? args[term.name] : "?";
      case "Dup":
        var name = fresh("dup");
        text += line(tab, VAR + " " + name + " = alloc(MEM, 3);");
        args[term.nam0] = "lnk(DP0, 127, 0, "+name+")"; // TODO
        args[term.nam1] = "lnk(DP1, 127, 0, "+name+")"; // TODO
        var expr = compile_term(term.expr, tab);
        text += line(tab, "link(MEM, "+name+"+2, "+expr+");");
        var body = compile_term(term.body, tab);
        return body;
      case "Lam":
        var name = fresh("lam");
        text += line(tab, VAR + " " + name + " = alloc(MEM, 2);");
        args[term.name] = "lnk(VAR, 0, 0, "+name+")";
        var body = compile_term(term.body, tab);
        return "lnk(LAM, 0, 0, " + name + ")";
      case "App":
        var name = fresh("app");
        var func = compile_term(term.func, tab);
        var argm = compile_term(term.argm, tab);
        text += line(tab, VAR + " " + name + " = alloc(MEM, 2);");
        text += line(tab, "link(MEM, " + name+"+0, " + func + ");");
        return "lnk(APP, 0, 0, " + name + ")";
      case "Ctr":
        var ctr_args : Array<string> = [];
        for (var i = 0; i < term.args.length; ++i) {
          ctr_args.push(compile_term(term.args[i], tab));
        }
        var name = fresh("ctr");
        text += line(tab, VAR + " " + name + " = alloc(MEM, " + ctr_args.length + ");");
        for (var i = 0; i < ctr_args.length; ++i) {
          text += line(tab, "link(MEM, " + name+"+"+i + ", " + ctr_args[i] + ");");
        }
        return "lnk(CTR, " + table[term.func] + ", " + ctr_args.length + ", " + name + ")";
      case "Cal":
        var cal_args : Array<string> = [];
        for (var i = 0; i < term.args.length; ++i) {
          cal_args.push(compile_term(term.args[i], tab));
        }
        //console.log("cal_args:", cal_args);
        var name = fresh("cal");
        text += line(tab, VAR + " " + name + " = alloc(MEM, " + cal_args.length + ");");
        for (var i = 0; i < cal_args.length; ++i) {
          text += line(tab, "link(MEM, " + name+"+"+i + ", " + cal_args[i] + ");");
        }
        return "lnk(CAL, " + table[term.func] + ", " + cal_args.length + ", " + name + ")";
    }
  }

  function fresh(prefix: string) : string {
    return prefix + "$" + (size++);
  }

  function define(prefix: string, expr: string, tab: number) : string {
    var name = fresh(prefix);
    text += line(tab, VAR + " " + name + " = " + expr + ";");
    return name;
  }

  var locs : {[name: string]: string} = {};
  var args : {[name: string]: string} = {};
  var uses : {[name: string]: number} = {};
  var text = "";
  var size = 0;
  //compile_func(func, tab);
  compile_function(sanitize(func), tab);
  return text;
}

export function gen_name_table(file: K.File) : {[name: string]: number} {
  var table : {[name: string]: number} = {};
  for (var i = 0; i < file.cons.length; ++i) {
    table[file.cons[i].name] = file.cons[i].numb;
  }
  for (var i = 0; i < file.funs.length; ++i) {
    table[file.funs[i].name] = i;
  }
  return table;
}

export function compile(file: K.File, target: string) {
  var table : {[name: string]: number} = gen_name_table(file);

  var code = "";
  for (var fun of file.funs) {
    code += compile_function(fun, table, target, 5);
  }

  return code;
}

// Tests
// -----

//var code = `
//def @0(x):
  //case x {
    //$0{pred}: $0{$0{} $1{pred}}
    //$1{pred}: @1(@0(pred))
    //$2{}: $0{$1{} $2{}}
  //}

//def @1(p):
  //case p {
    //$0{carry pred}: $0{carry $0{pred}}
  //}

//def @2(x):
  //@3(@0(x))

//def @3(x):
  //case x {
    //$0{carry next}: case carry { 
      //$0{}: @2(next)
      //$1{}: next
    //}
  //}
  
//`;

////var code = `
////def @0(x):
  ////case x {
    ////$0{}: $1{}
    ////$1{}: $0{}
  ////}
////`;

//var defs = parse(code);

////console.log(show_defs(defs));
//console.log(show_defs(defs.map(sanitize)));
//console.log("");

//console.log("        {\n");
//for (var def of defs) {
  //console.log(compile(def,5,"c"));
//}
//console.log("        }");

////const ZERO = 0;
////const SUCC = 1;

////const MUL2 = 0;

////var test = Fun(MUL2, ["a"],
  ////Mat("a", [
    ////// zero:
    ////[[], Ret(Ctr(ZERO,[]))],
    ////// succ:
    ////[["a_pred"], Ret(Ctr(SUCC,[Ctr(SUCC,[Cal(MUL2,[Var("a_pred")])])]))],
  ////]));

////console.log(compile(test, 5));
