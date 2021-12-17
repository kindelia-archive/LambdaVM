//import * as L from "./../../../Lambolt/src/Lambolt.ts"
import * as L from "https://raw.githubusercontent.com/Kindelia/Lambolt/master/src/Lambolt.ts"
import {gen_name_table, gen_is_call, gen_groups, sanitize} from "./Common.ts"
export * from "./Common.ts"

// Compiler
// --------

// Compiles a Lambolt file to a target language.
export function compile(file: L.File, target: string, mode: "DYNAMIC" | "STATIC", template: string) {
  //console.log("Compiling file...");

  // Generates the name table.
  var name_table = gen_name_table(file);

  // Generates is_call.
  var is_call = gen_is_call(file);

  // Groups the rules by name.
  var groups = gen_groups(file);

  // Compiles dynamic flag.
  var dynamic_flag = "DYNAMIC = " + (mode === "DYNAMIC" ? 1 : 0) + ";\n";

  // Compiles constructor ids.
  var constructor_ids = "";
  for (var name in name_table) {
    constructor_ids += CONST(target) + " " + compile_constructor_name(name) + " = " + U64(target,name_table[name]) + ";\n";
  }

  // Compiles each group's rewrite rules.
  var rewrite_rules = "";
  for (var group_name in groups) {
    rewrite_rules += compile_group(group_name, groups[group_name][0], groups[group_name][1], name_table, is_call, target, 6);
  }

  //console.log(constructor_ids);
  //console.log(rewrite_rules);

  return template
    .replace("//GENERATED_DYNAMIC_FLAG//", dynamic_flag)
    .replace("//GENERATED_REWRITE_RULES//", rewrite_rules)
    .replace("//GENERATED_CONSTRUCTOR_IDS//", constructor_ids);
}

// Compiles a group of rules to the target language.
export function compile_group(
  name: string,
  arity: number,
  rules: Array<L.Rule>,
  name_table: {[name:string]:bigint},
  is_call: {[name:string]:boolean},
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
          if (rule.lhs.args[i].$ === "Ctr" || rule.lhs.args[i].$ === "U32") {
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
        text += line(tab+1, VAR(target)+" LNK_"+i+" = reduce("+TID(target)+"mem, LOC_"+i+");");
        text += line(tab+1, "if (get_tag(LNK_"+i+") == PAR) return cal_par("+TID(target)+"mem, host, term, LNK_"+i+", "+i+");");
      } else {
        text += line(tab+1, VAR(target)+" LNK_"+i+" = ask_arg(mem, term, "+i+");");
      }
    }

    // For each of the rules in this group...
    for (var {rule,uses} of rules) {
      if (rule.lhs.$ === "Ctr" && rule.lhs.args.length === arity) {

        var clears = ["clear(mem, get_loc(term, 0), "+rule.lhs.args.length+")"];
        var collects = [];

        // Checks if this rule matches and enters its branch. That is,
        //   (add (succ a) b) = (succ (add a b))
        //        /\ this rule will match if the first ctor's tag is SUCC
        var conds = [];
        for (var i = 0; i < arity; ++i) {
          var term = rule.lhs.args[i];
          switch (term.$) {
            case "Ctr": {
              conds.push("get_tag(LNK_"+i+") == CTR && get_ext(LNK_"+i+") == "+(compile_constructor_name(term.name)||"?"));
              break;
            }
            case "U32": {
              conds.push("get_tag(LNK_"+i+") == U32 && get_val(LNK_"+i+") == "+U64(target,term.numb));
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
                    args[field.name] = define("lnk", "ask_arg(mem, LNK_"+i+", "+j+")", tab+2);
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
              clears.push("clear(mem, get_loc(LNK_"+i+", 0), "+term.args.length+")");
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
        var done = compile_term(rule.rhs, tab+2, uses);
        text += line(tab+2, "link(mem, host, " + done + ");"); 

        // Now we free the nodes used in this rule.
        for (var clear of clears) {
          text += line(tab+2, clear + ";");
        }

        // Now we collect the variables that went out of scope.
        for (var collect of collects) {
          text += line(tab+2, "collect(mem, " + collect + ");");
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
  function compile_term(term: L.Term, tab: number, uses:{[key:string]:number}) : string {
    switch (term.$) {
      case "Var":
        return args[term.name] ? args[term.name] : "?";
      case "Dup":
        var name = fresh("dup");
        var dupn = fresh("col");
        var dupk = dups++;
        text += line(tab, VAR(target) + " " + name + " = alloc(mem, 3);");
        text += line(tab, VAR(target) + " " + dupn + " = " + U64(target,dupk) + ";");
        args[term.nam0] = "Dp0("+dupn+", "+name+")";
        args[term.nam1] = "Dp1("+dupn+", "+name+")";
        if (!uses[term.nam0]) {
          text += line(tab, "link(mem, " + name + "+"+U64(target,0)+", Era());");
        }
        if (!uses[term.nam1]) {
          text += line(tab, "link(mem, " + name + "+"+U64(target,1)+", Era());");
        }
        var expr = compile_term(term.expr, tab, uses);
        text += line(tab, "link(mem, "+name+"+"+U64(target,2)+", "+expr+");");
        var body = compile_term(term.body, tab, uses);
        return body;
      case "Let":
        var expr = compile_term(term.expr, tab, uses);
        args[term.name] = expr;
        var body = compile_term(term.body, tab, uses);
        return body;
      case "Lam":
        var name = fresh("lam");
        text += line(tab, VAR(target) + " " + name + " = alloc(mem, 2);");
        args[term.name] = "Var("+name+")";
        var body = compile_term(term.body, tab, uses);
        if (!uses[term.name]) {
          text += line(tab, "link(mem, " + name+"+"+U64(target,0)+", Era());");
        }
        text += line(tab, "link(mem, " + name+"+"+U64(target,1)+", " + body + ");");
        return "Lam(" + name + ")";
      case "App":
        var name = fresh("app");
        var func = compile_term(term.func, tab, uses);
        var argm = compile_term(term.argm, tab, uses);
        text += line(tab, VAR(target) + " " + name + " = alloc(mem, 2);");
        text += line(tab, "link(mem, " + name+"+"+U64(target,0)+", " + func + ");");
        text += line(tab, "link(mem, " + name+"+"+U64(target,1)+", " + argm + ");");
        return "App(" + name + ")";
      case "Ctr":
        var ctr_args : Array<string> = [];
        for (var i = 0; i < term.args.length; ++i) {
          ctr_args.push(compile_term(term.args[i], tab, uses));
        }
        var name = fresh("ctr");
        text += line(tab, VAR(target) + " " + name + " = alloc(mem, " + ctr_args.length + ");");
        for (var i = 0; i < ctr_args.length; ++i) {
          text += line(tab, "link(mem, " + name+"+"+U64(target,i) + ", " + ctr_args[i] + ");");
        }
        return (is_call[term.name] ? "Cal" : "Ctr") + "(" + ctr_args.length + ", " + (compile_constructor_name(term.name)||0) + ", " + name + ")";
      case "Op2":
        var name = fresh("op2");
        var val0 = compile_term(term.val0, tab, uses);
        var val1 = compile_term(term.val1, tab, uses);
        text += line(tab, VAR(target) + " " + name + " = alloc(mem, 2);");
        text += line(tab, "link(mem, " + name+"+"+U64(target,0)+", " + val0 + ");");
        text += line(tab, "link(mem, " + name+"+"+U64(target,1)+", " + val1 + ");");
        return "Op2(" + term.oper.toUpperCase() + ", " + name + ")";
      case "U32":
        return "U_32(" + U64(target,term.numb) + ")";
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
  return "$"+name.toUpperCase().replace(/\./g,"$");
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

function U64(target: string, num: number | bigint): string {
  switch (target) {
    case "ts": return "" + num + "n";
    case "c": return "" + num;
  }
  return "0";
}

function GAS(target: string) {
  switch (target) {
    case "ts": return "++GAS";
    case "c": return "inc_gas(tid)";
  }
}

function TID(target: string) {
  switch (target) {
    case "ts": return "";
    case "c": return "tid, ";
  }
}
