//import * as L from "./../../../Lambolt/src/Lambolt.ts"
import * as L from "https://raw.githubusercontent.com/Kindelia/Lambolt/master/src/Lambolt.ts"

// Compiler
// --------

// Compiles a Lambolt file to a target language.
export function compile(file: L.File, target: string, template: string) {
  console.log("compiling file");

  // Generates the name table.
  var name_table = gen_name_table(file);

  // Generates iscal.
  var iscal = gen_iscal(file);

  // Groups the rules by name.
  var groups = gen_groups(file);

  // Compiles constructor ids.
  var constructor_ids = "";
  for (var name in name_table) {
    constructor_ids += CONST(target) + " " + compile_constructor_name(name) + " = " + name_table[name] + ";\n";
  }

  // Compiles each group's rewrite rules.
  var rewrite_rules = "";
  for (var group_name in groups) {
    rewrite_rules += compile_group(group_name, groups[group_name][0], groups[group_name][1], name_table, iscal, target, 5);
  }

  //console.log(constructor_ids);
  //console.log(rewrite_rules);

  return template
    .replace("//GENERATED_REWRITE_RULES//", rewrite_rules)
    .replace("//GENERATED_CONSTRUCTOR_IDS//", constructor_ids);
}

// Compiles a group of rules to the target language.
export function compile_group(
  name: string,
  arity: number,
  rules: Array<L.Rule>,
  name_table: {[name:string]:number},
  iscal: {[name:string]:boolean},
  target: string,
  tab: number
): string {
  function compile_group(name: string, arity: number, rules: Array<{rule:L.Rule,uses:{[key:string]:number}}>, tab: number) {
    text += line(tab, "case " + compile_constructor_name(name) + ": {");

    // Finds which arguments of the group need to be reduced. For example, here:
    //   (add (succ a) b) = (succ (add a b))
    //   (add (zero)   b) = b
    // Only the first argument needs to be reduced. But here:
    //   (add (succ a) (succ b)) = (succ (succ (add a b)))
    //   (add (succ a) (zero)  ) = (succ a)
    //   (add (zero)   (succ b)) = (succ b)
    //   (add (zero)   (zero)  ) = (zero)
    // Both arguments need to be reduced, since they're both constructors.
    var reduce_at : {[key:string]:boolean} = {};
    for (var {rule,uses} of rules) {
      if (rule.lhs.$ === "Ctr") {
        for (var i = 0; i < rule.lhs.args.length; ++i) {
          if (rule.lhs.args[i].$ === "Ctr") {
            reduce_at[i] = true;
          }
        }
      }
    }

    // Creates a variable for the location and pointer of each argument.
    //   (add (succ a) b) = (succ (add a b))
    //   (add (zero)   b) = b
    //        /\       /\
    //        creates a loc and lnk for of each of these args
    //        /\ 
    //        reduces this arg
    for (var i = 0; i < arity; ++i) {
      text += line(tab+1, VAR(target) + " LOC_"+i+" = get_loc(term,"+i+");");
    }
    for (var i = 0; i < arity; ++i) {
      if (reduce_at[i]) {
        text += line(tab+1, VAR(target)+" LNK_"+i+" = reduce(MEM, LOC_"+i+");");
      } else {
        text += line(tab+1, VAR(target)+" LNK_"+i+" = get_lnk(MEM, term, "+i+");");
      }
    }

    // For each of the rules in this group...
    for (var {rule,uses} of rules) {
      if (rule.lhs.$ === "Ctr" && rule.lhs.args.length === arity) {

        var clears = ["clear(MEM, get_loc(term, 0), "+rule.lhs.args.length+")"];
        var collects = [];

        // Checks if this rule matches and enters its branch. That is,
        //   (add (succ a) b) = (succ (add a b))
        //        /\ this rule will match if the first ctor's tag is SUCC
        var conds = [];
        for (var i = 0; i < arity; ++i) {
          var term = rule.lhs.args[i];
          switch (term.$) {
            case "Ctr": {
              conds.push("get_fun(LNK_"+i+") == "+(compile_constructor_name(term.name)||"?"));
              break;
            }
            case "U32": {
              conds.push("get_num(LNK_"+i+") == "+term.numb);
              break;
            }
          }
        }
        text += line(tab+1, "if ("+(conds.join(" && ") || "1")+") {");
        text += line(tab+2, GAS(target)+";");

        // We've matched! Great. Now, we must collect the variable names.
        // For each argument in this rule...
        for (var i = 0; i < arity; ++i) {
          var term = rule.lhs.args[i];
          switch (term.$) {
            // If it is a constructor, link the name of each field to their locs and lnks. That is,
            //   (add (succ a) b) = (succ (add a b))
            //              /\ this is a constructor field, so here we'll create a loc and lnk for it!
            case "Ctr": {
              for (var j = 0; j < term.args.length; ++j) {
                var field = term.args[j];
                switch (field.$) {
                  case "Var": {
                    locs[field.name] = define("loc", "get_loc(LNK_"+i+", "+j+")", tab+2);
                    args[field.name] = define("lnk", "get_lnk(MEM, LNK_"+i+", "+j+")", tab+2);
                    if (!uses[field.name]) {
                      collects.push(args[field.name]);
                    }
                    break;
                  }
                  default: {
                    throw "Nested pattern-matches are not available yet. (Used on a rewrite-rule for '" + name + "'.)";
                  }
                }
              }
              clears.push("clear(MEM, get_loc(LNK_"+i+", 0), "+term.args.length+")");
              break;
            }
            // If the argument is a variable, link its name to its loc and lnk. That is,
            //   (add (succ a) b) = (succ (add a b))
            //                 /\ this is a var, so here we'll create a loc and lnk for it!
            case "Var": {
              locs[term.name] = define("loc", "LOC_"+i, tab+2);
              args[term.name] = define("lnk", "LNK_"+i, tab+2);
              if (!uses[term.name]) {
                collects.push(args[term.name]);
              }
              break;
            }
            // If the argument is a number, we don't need to do anything.
            case "U32": {
              break;
            }
            // Otherwise, something is very wrong.
            default: {
              throw "Invalid left-hand side.";
            }
          }
        }

        // At this point, we've matched a rule and collected all the left-hand
        // side variables. Great! Now we just need to compile the right-hand.
        var done = compile_term(rule.rhs, tab+2);
        text += line(tab+2, "link(MEM, host, " + done + ");"); 

        // Now we free the nodes used in this rule.
        for (var clear of clears) {
          text += line(tab+2, clear + ";");
        }

        // Now we collect the variables that went out of scope.
        for (var collect of collects) {
          text += line(tab+2, "collect(MEM, " + collect + ");");
        }

        // And we're done! WP.
        text += line(tab+2, "continue;");
        text += line(tab+1, "}");
      } else {
        throw "Invalid left-hand side.";
      }
    }
    text += line(tab+1, "break;");
    text += line(tab, "}");
  }

  // Compiles a term (i.e., the right-hand side). It just allocates space for
  // the term and creates the links.
  function compile_term(term: L.Term, tab: number) : string {
    switch (term.$) {
      case "Var":
        return args[term.name] ? args[term.name] : "?";
      case "Dup":
        var name = fresh("dup");
        var dupk = dups++;
        text += line(tab, VAR(target) + " " + name + " = alloc(MEM, 3);");
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
        text += line(tab, VAR(target) + " " + name + " = alloc(MEM, 2);");
        args[term.name] = "Var("+name+")";
        var body = compile_term(term.body, tab);
        text += line(tab, "link(MEM, " + name+"+1, " + body + ");");
        return "Lam(" + name + ")";
      case "App":
        var name = fresh("app");
        var func = compile_term(term.func, tab);
        var argm = compile_term(term.argm, tab);
        text += line(tab, VAR(target) + " " + name + " = alloc(MEM, 2);");
        text += line(tab, "link(MEM, " + name+"+0, " + func + ");");
        text += line(tab, "link(MEM, " + name+"+1, " + argm + ");");
        return "App(" + name + ")";
      case "Ctr":
        var ctr_args : Array<string> = [];
        for (var i = 0; i < term.args.length; ++i) {
          ctr_args.push(compile_term(term.args[i], tab));
        }
        var name = fresh("ctr");
        text += line(tab, VAR(target) + " " + name + " = alloc(MEM, " + ctr_args.length + ");");
        for (var i = 0; i < ctr_args.length; ++i) {
          text += line(tab, "link(MEM, " + name+"+"+i + ", " + ctr_args[i] + ");");
        }
        return (iscal[term.name] ? "Cal" : "Ctr") + "(" + (compile_constructor_name(term.name)||0) + ", " + ctr_args.length + ", " + name + ")";
      case "Op2":
        var name = fresh("op2");
        var val0 = compile_term(term.val0, tab);
        var val1 = compile_term(term.val1, tab);
        text += line(tab, VAR(target) + " " + name + " = alloc(MEM, 2);");
        text += line(tab, "link(MEM, " + name+"+0, " + val0 + ");");
        text += line(tab, "link(MEM, " + name+"+1, " + val1 + ");");
        return "Op2(" + term.oper.toUpperCase() + ", " + name + ")";
      case "U32":
        return "U_32(" + term.numb + ")";
    }
  }

  // Associates an expression with a fresh name.
  function define(prefix: string, expr: string, tab: number) : string {
    var name = fresh(prefix);
    text += line(tab, VAR(target) + " " + name + " = " + expr + ";");
    return name;
  }

  // Generates a fresh name.
  function fresh(prefix: string) : string {
    return prefix + "$" + (size++);
  }

  var locs : {[name: string]: string} = {};
  var args : {[name: string]: string} = {};
  var uses : {[name: string]: number} = {};
  var dups = 0;
  var text = "";
  var size = 0;
  compile_group(name, arity, rules.map(sanitize), tab);
  return text;
}

// Compiles a constructor name
function compile_constructor_name(name: string) {
  return "$"+name.toUpperCase();
}

// This big function sanitizes a rule. That is, it renames every variable in a
// rule, in order to make it unique. Moreover, it will also add a `.N` to the
// end of the name of each variable used in the right-hand side of the rule,
// where `N` stands for the number of times it was used. For example:
//   sanitize `(fn (cons head tail)) = (cons (pair head head) tail)`
//         ~> `(fn (cons x0   x1))   = (cons (pair x0.0 x0.1) x1.0)`
// It also returns the usage count of each variable.
export function sanitize(rule: L.Rule): {rule: L.Rule, uses: {[key:string]:number}} {
  var size = 0;
  var uses : {[key:string]: number} = {};
  function fresh() : string {
    return "x" + (size++);
  }

  function duplicator(name: string, expr: L.Term, body: L.Term): L.Term {
    var amount = uses[name];
    if (amount > 1) {
      var vars = [];
      for (var i = 0; i < (amount - 1) * 2; ++i) {
        vars.push(i < amount - 2 ? "c." + i : name + "." + (i - (amount - 2)));
      }
      vars.reverse();
      return (function go(i: number, body: L.Term): L.Term {
        if (i === amount - 1) {
          return body;
        } else {
          var var0 = vars.pop() as string;
          var var1 = vars.pop() as string;
          var exp0 = i === 0 ? expr : L.Var("c." + (i - 1));
          return L.Dup(var0, var1, exp0, go(i + 1, body));
        }
      })(0, body);
    } else {
      return L.Let(name+".0", expr, body);
    }
  }

  function create_fresh(rule: L.Rule): {[key:string]: string} {
    var table : {[key:string]:string} = {};
    switch (rule.lhs.$) {
      case "Ctr": {
        var name = rule.lhs.name;
        var new_rule = [];
        for (var arg of rule.lhs.args) {
          switch (arg.$) {
            case "Var": {
              table[arg.name] = fresh();
              break;
            }
            case "Ctr": {
              for (var field of arg.args) {
                switch (field.$) {
                  case "Var": {
                    table[field.name] = fresh();
                    break;
                  }
                  default: {
                    throw "Invalid left-hand side.";
                  }
                }
              }
              break;
            }
            case "U32": {
              break;
            }
            default: {
              throw "Invalid left-hand side.";
            }
          }
        }
        break;
      }
      default: {
        throw "Invalid left-hand side.";
      }
    }
    return table;
  }

  function sanitize_term(term: L.Term, table: {[key:string]:string}, lhs: boolean): L.Term {
    switch (term.$) {
      case "Var": {
        if (lhs) {
          return L.Var(table[term.name] || term.name);
        } else {
          if (table[term.name]) {
            var used = uses[table[term.name]] || 0;
            var name = table[term.name] + "." + used;
            uses[table[term.name]] = used + 1;
            return L.Var(name);
          } else {
            throw "Error: unbound variable '" + term.name + "'.";
          }
        }
      }
      case "Dup": {
        let nam0 = fresh();
        let nam1 = fresh();
        let expr = sanitize_term(term.expr, table, lhs);
        let body = sanitize_term(term.body, {...table, [term.nam0]: nam0, [term.nam1]: nam1}, lhs);
        return L.Dup(nam0+".0", nam1+".0", expr, body);
      }
      case "Let": {
        let name = fresh();
        let expr = sanitize_term(term.expr, table, lhs);
        let body = sanitize_term(term.body, {...table, [term.name]: name}, lhs);
        var used = uses[name] || 0;
        return duplicator(name, expr, body);
      }
      case "Lam": {
        let name = fresh();
        let body = sanitize_term(term.body, {...table, [term.name]: name}, lhs);
        var used = uses[name] || 0;
        return L.Lam(name, duplicator(name, L.Var(name), body));
      }
      case "App": {
        let func = sanitize_term(term.func, table, lhs);
        let argm = sanitize_term(term.argm, table, lhs);
        return L.App(func, argm);
      }
      case "Ctr": {
        let name = term.name;
        let args = term.args.map(x => sanitize_term(x,table, lhs));
        return L.Ctr(name, args);
      }
      case "Op2": {
        var oper = term.oper;
        var val0 = sanitize_term(term.val0, table, lhs);
        var val1 = sanitize_term(term.val1, table, lhs);
        return L.Op2(oper, val0, val1);
      }
      case "U32": {
        return L.U32(term.numb);
      }
    }
  }

  var table = create_fresh(rule);
  var lhs = sanitize_term(rule.lhs, {...table}, true);
  var rhs = sanitize_term(rule.rhs, {...table}, false);
  for (var key in table) {
    rhs = duplicator(table[key], L.Var(table[key]), rhs);
  }
  var rule = L.Rule(lhs, rhs);
  return {rule, uses};
}

// Generates a name table for a whole program. That table links constructor
// names (such as `cons` and `succ`) to small ids (such as `0` and `1`).
export function gen_name_table(file: L.File) : {[name: string]: number} {
  var table : {[name: string]: number} = {};
  var fresh : number = 0;
  function find_ctrs(term: L.Term) {
    switch (term.$) {
      case "Var": {
        break;
      }
      case "Dup": {
        find_ctrs(term.expr);
        find_ctrs(term.body);
        break;
      }
      case "Let": {
        find_ctrs(term.expr);
        find_ctrs(term.body);
        break;
      }
      case "Lam": {
        find_ctrs(term.body);
        break;
      }
      case "App": {
        find_ctrs(term.func);
        find_ctrs(term.argm);
        break;
      }
      case "Ctr": {
        if (table[term.name] === undefined) {
          table[term.name] = fresh++;
        }
        for (var arg of term.args) {
          find_ctrs(arg);
        }
        break;
      }
      case "Op2": {
        find_ctrs(term.val0);
        find_ctrs(term.val1);
        break;
      }
      case "U32": {
        break;
      }
    }
  }
  for (var rule of file) {
    find_ctrs(rule.lhs);
    find_ctrs(rule.rhs);
  }
  return table;
}

// Finds constructors that are used as functions.
export function gen_iscal(file: L.File) : {[name: string]: boolean} {
  var iscal : {[name: string]: boolean} = {};
  for (var rule of file) {
    if (rule.lhs.$ === "Ctr") {
      iscal[rule.lhs.name] = true;
    }
  }
  return iscal;
}

// Groups rules by name. For example:
//   (add (succ a) (succ b)) = (succ (succ (add a b)))
//   (add (succ a) (zero)  ) = (succ a)
//   (add (zero)   (succ b)) = (succ b)
//   (add (zero)   (zero)  ) = (zero)
// This is a group of 4 rules starting with the "add" name.
export function gen_groups(file: L.File): {[key: string]: [number, Array<L.Rule>]} {
  var groups : {[key: string]: [number, Array<L.Rule>]} = {};
  for (var rule of file) {
    if (rule.lhs.$ === "Ctr") {
      if (!groups[rule.lhs.name]) {
        groups[rule.lhs.name] = [rule.lhs.args.length, [rule]];
      } else if (groups[rule.lhs.name][0] === rule.lhs.args.length) {
        groups[rule.lhs.name][1].push(rule);
      } else {
        throw "Rewrite rules for '" + rule.lhs.name + "' have different argument counts.";
      }
    } else {
      throw "Invalid left-hand side.";
    }
  }
  return groups;
}

// Creates a new line with an amount of tabs.
function line(tab: number, text: string) {
  for (var i = 0; i < tab; ++i) {
    text = "  " + text;
  }
  return text + "\n";
}

function CONST(target: string) {
  switch (target) {
    case "ts": return "const";
    case "c": return "const u64";
  }
}

function VAR(target: string) {
  switch (target) {
    case "ts": return "var";
    case "c": return "u64";
  }
}

function GAS(target: string) {
  switch (target) {
    case "ts": return "++GAS";
    case "c": return "inc_gas(MEM)";
  }
}
