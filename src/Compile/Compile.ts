import * as LB from "https://raw.githubusercontent.com/Kindelia/LamBolt/master/src/LamBolt.ts"

// Compiler
// --------

function line(tab: number, text: string) {
  for (var i = 0; i < tab; ++i) {
    text = "  " + text;
  }
  return text + "\n";
}

export function sanitize(func: LB.Bond): LB.Bond {
  var size = 0;
  var uses : {[key:string]: number} = {};
  function fresh() : string {
    return "x" + (size++);
  }

  function duplicator(name: string, expr: LB.Term, body: LB.Term): LB.Term {
    var amount = uses[name];
    if (amount > 1) {
      var vars = [];
      for (var i = 0; i < (amount - 1) * 2; ++i) {
        vars.push(i < amount - 2 ? "c." + i : name + "." + (i - (amount - 2)));
      }
      vars.reverse();
      return (function go(i: number, body: LB.Term): LB.Term {
        if (i === amount - 1) {
          return body;
        } else {
          var var0 = vars.pop() as string;
          var var1 = vars.pop() as string;
          var exp0 = i === 0 ? expr : LB.Var("c." + (i - 1));
          return LB.Dup(var0, var1, exp0, go(i + 1, body));
        }
      })(0, body);
    } else {
      return LB.Let(name+".0", expr, body);
    }
  }

  function sanitize_bond(bond: LB.Bond): LB.Bond {
    var name = bond.name;
    var table : {[key:string]:string} = {};
    for (var arg_name of bond.args) {
      table[arg_name] = fresh();
    }
    var args = bond.args.map(x => table[x] || x);
    var body = sanitize_match(bond.body, table, args);
    return LB.Bond(name, args, body);
  }

  function sanitize_match(match: LB.Match, table: {[key:string]:string}, must_copy: string[]): LB.Match {
    switch (match.$) {
      case "Case": {
        let expr = table[match.expr] || match.expr;
        let cses : Array<{name: string, args: Array<string>, body: LB.Match}> = match.cses.map((cse) => {
          let name : string = cse.name;
          let args : Array<string> = cse.args;
          let body : LB.Match = cse.body;
          let new_table = {...table};
          for (let arg of args) {
            new_table[arg] = fresh();
          }
          let new_args = args.map(x => new_table[x] || x);
          let new_body = sanitize_match(body, new_table, must_copy.concat(new_args));
          return {name, args: new_args, body: new_body};
        })
        return LB.Case(expr, cses);
      }
      case "Body": {
        let expr = sanitize_term(match.expr, table); 
        for (var arg of must_copy) {
          expr = duplicator(arg, LB.Var(arg), expr);
        }
        return LB.Body(expr);
      }
    }
  }

  function sanitize_term(term: LB.Term, table: {[key:string]:string}): LB.Term {
    switch (term.$) {
      case "Var": {
        if (table[term.name]) {
          var used = uses[table[term.name]] || 0;
          var name = table[term.name] + "." + used;
          uses[table[term.name]] = used + 1;
          return LB.Var(name);
        } else {
          throw "Error: unbound variable '" + term.name + "'.";
        }
      }
      case "Dup": {
        let nam0 = fresh();
        let nam1 = fresh();
        let expr = sanitize_term(term.expr, table);
        let body = sanitize_term(term.body, {...table, [term.nam0]: nam0, [term.nam1]: nam1});
        return LB.Dup(nam0+".0", nam1+".0", expr, body);
      }
      case "Let": {
        let name = fresh();
        let expr = sanitize_term(term.expr, table);
        let body = sanitize_term(term.body, {...table, [term.name]: name});
        var used = uses[name] || 0;
        return duplicator(name, expr, body);
      }
      case "Lam": {
        let name = fresh();
        let body = sanitize_term(term.body, {...table, [term.name]: name});
        var used = uses[name] || 0;
        return LB.Lam(name, duplicator(name, LB.Var(name), body));
      }
      case "App": {
        let func = sanitize_term(term.func, table);
        let argm = sanitize_term(term.argm, table);
        return LB.App(func, argm);
      }
      case "Ctr": {
        let name = term.name;
        let args = term.args.map(x => sanitize_term(x,table));
        return LB.Ctr(name, args);
      }
      case "Cal": {
        let func = term.func;
        let args = term.args.map(x => sanitize_term(x, table));
        return LB.Cal(func, args);
      }
    }
  }

  return sanitize_bond(func);
}

export function compile_bond(func: LB.Bond, table: {[name:string]:number}, target: string, tab: number): string {
  if (target === "ts") {
    var VAR = "var"; 
    var GAS = "++GAS";
  } else if (target === "c") {
    var VAR = "u64";
    var GAS = "inc_gas(MEM)";
  } else {
    throw "Unknown target: " + target;
  }
  
  function compile_bond(bond: LB.Bond, tab: number) {
    text += line(tab, "case " + table[bond.name] + ": {");
    for (var i = 0; i < bond.args.length; ++i) {
      locs[bond.args[i]] = define("loc", "get_loc(term, "+i+")", tab+1);
      args[bond.args[i]] = define("arg", "get_lnk(MEM, term, "+i+")", tab+1);
    }
    var clear = ["clear(MEM, get_loc(term, 0), "+bond.args.length+")"];
    compile_match(bond.body, clear, tab + 1)
    //text += line(tab+1, "break;");
    text += line(tab, "}");
  }

  function compile_match(match: LB.Match, clear: Array<string>, tab: number) {
    switch (match.$) {
      case "Case":
        var expr_name = locs[match.expr] || "";
        text += line(tab, VAR+" " + expr_name + "$ = reduce(MEM, " + expr_name + ");");
        text += line(tab, "switch (get_tag("+expr_name+"$) == CTR ? get_fun(" + expr_name + "$) : -1) {");
        for (var i = 0; i < match.cses.length; ++i) {
          var cse = match.cses[i];
          text += line(tab+1, "case " + (table[cse.name]||0) + ": {");
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
      case "Body":
        if (GAS) {
          text += line(tab, GAS+";");
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

  function compile_term(term: LB.Term, tab: number) : string {
    switch (term.$) {
      case "Var":
        return args[term.name] ? args[term.name] : "?";
      case "Dup":
        var name = fresh("dup");
        var dupk = dups++;
        text += line(tab, VAR + " " + name + " = alloc(MEM, 3);");
        args[term.nam0] = "Dp0(" + dupk + ", "+name+")"; // TODO
        args[term.nam1] = "Dp1(" + dupk + ", "+name+")"; // TODO
        var expr = compile_term(term.expr, tab);
        text += line(tab, "link(MEM, "+name+"+2, "+expr+");");
        var body = compile_term(term.body, tab);
        return body;
      case "Let":
        var expr = compile_term(term.expr, tab);
        args[term.name] = expr;
        var body = compile_term(term.body, tab);
        return body;
      case "Lam":
        var name = fresh("lam");
        text += line(tab, VAR + " " + name + " = alloc(MEM, 2);");
        args[term.name] = "Var("+name+")";
        var body = compile_term(term.body, tab);
        text += line(tab, "link(MEM, " + name+"+1, " + body + ");");
        return "Lam(" + name + ")";
      case "App":
        var name = fresh("app");
        var func = compile_term(term.func, tab);
        var argm = compile_term(term.argm, tab);
        text += line(tab, VAR + " " + name + " = alloc(MEM, 2);");
        text += line(tab, "link(MEM, " + name+"+0, " + func + ");");
        text += line(tab, "link(MEM, " + name+"+1, " + argm + ");");
        return "App(" + name + ")";
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
        return "Ctr(" + (table[term.name]||0) + ", " + ctr_args.length + ", " + name + ")";
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
        return "Cal(" + (table[term.func]||0) + ", " + cal_args.length + ", " + name + ")";
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
  var dups = 0;
  var text = "";
  var size = 0;
  //compile_func(func, tab);
  compile_bond(sanitize(func), tab);
  return text;
}

export function gen_name_table(file: LB.File) : {[name: string]: number} {
  var table : {[name: string]: number} = {};
  var fresh = 0;
  for (var i = 0; i < file.defs.length; ++i) {
    var def = file.defs[i];
    switch (def.$) {
      case "NewBond":
        table[def.bond.name] = ++fresh;
        break;
      case "NewType":
        for (var ctr of def.type.ctrs) {
          table[ctr.name] = ++fresh;
        }
        break;
    }
  }
  return table;
}

export function compile(file: LB.File, target: string) {
  var table = gen_name_table(file);

  var code = "";
  for (var def of file.defs) {
    switch (def.$) {
      case "NewBond":
        code += compile_bond(def.bond, table, target, 5);
        break;
    }
  }

  return code;
}
