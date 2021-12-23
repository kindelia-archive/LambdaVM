//import * as L from "./../../../Lambolt/src/Lambolt.ts"
import * as L from "https://raw.githubusercontent.com/Kindelia/Lambolt/master/src/Lambolt.ts"
import * as R from "./../Runtime/Runtime.ts"
import {gen_name_table, gen_is_call, gen_groups, sanitize} from "./Common.ts"

// Compiler
// --------

// Compiles a Lambolt file to a target language.
export function compile(file: L.File) {
  //console.log("Compiling file...");

  // Generates the name table.
  var name_table = gen_name_table(file);

  // Generates is_call.
  var is_call = gen_is_call(file);

  // Groups the rules by name.
  var groups = gen_groups(file);

  var book : R.Book = {};
  for (var group_name in groups) {
    //console.log("- compiling", group_name, name_table[group_name] / R.EXT);
    book[String(name_table[group_name])] = compile_group(group_name, groups[group_name][0], groups[group_name][1], name_table, is_call);
  }

  return book;
}

// Compiles a group of rules to the target language.
export function compile_group(
  name: string,
  arity: number,
  rules: Array<L.Rule>,
  name_table: {[name:string]:bigint},
  is_call: {[name:string]:boolean},
): R.Page {
  function compile_group(name: string, arity: number, rules: Array<{rule:L.Rule,uses:{[key:string]:number}}>): R.Page {
    var page : R.Page = {
      match: [],
      rules: [],
    };

    // Finds which arguments of the group need to be reduced. For example, here:
    //   (add (succ a) b) = (succ (add a b))
    //   (add (zero)   b) = b
    // Only the first argument needs to be reduced. But here:
    //   (add (succ a) (succ b)) = (succ (succ (add a b)))
    //   (add (succ a) (zero)  ) = (succ a)
    //   (add (zero)   (succ b)) = (succ b)
    //   (add (zero)   (zero)  ) = (zero)
    // Both arguments need to be reduced, since they're both constructors.
    var reduce_at : {[key:string]:number} = {};
    for (var {rule,uses} of rules) {
      if (rule.lhs.$ === "Ctr") {
        for (var i = 0; i < rule.lhs.args.length; ++i) {
          if (rule.lhs.args[i].$ === "Ctr") {
            reduce_at[i] = 1;
          }
          if (rule.lhs.args[i].$ === "U32") {
            reduce_at[i] = 2;
          }
        }
      }
    }

    // Creates the "match" object
    for (var i = 0; i < arity; ++i) {
      page.match.push(reduce_at[i] || 0);
    }

    // For each of the rules in this group...
    for (var r = 0; r < rules.length; ++r) {
      var {rule, uses} = rules[r];

      if (rule.lhs.$ === "Ctr" && rule.lhs.args.length === arity) {

        page.rules[r] = {
          test: [],
          clrs: [],
          cols: [],
          root: 0n,
          body: [],
        }

        // Creates the test object for this rule
        //   (add (succ a) b) = (succ (add a b))
        //        /\ this rule will match if the first ctor's tag is SUCC
        for (var i = 0; i < arity; ++i) {
          var term = rule.lhs.args[i];
          switch (term.$) {
            case "Ctr": {
              page.rules[r].test.push(R.Ctr(0, name_table[term.name], 0n));
              break;
            }
            case "U32": {
              page.rules[r].test.push(R.U_32(BigInt(term.numb)));
              break;
            }
            case "Var": {
              page.rules[r].test.push(R.VAR);
              break;
            }
            default: {
              throw "Invalid left-hand side.";
              break;
            }
          }
        }

        // Collect variable links.
        // For each argument in this rule...
        for (var i = 0; i < arity; ++i) {
          var term = rule.lhs.args[i];
          switch (term.$) {
            // If it is a constructor, collect each field. That is,
            //   (add (succ a) b) = (succ (add a b))
            //              /\ this is a constructor field, so here we'll collect this field
            case "Ctr": {
              for (var j = 0; j < term.args.length; ++j) {
                var field = term.args[j];
                switch (field.$) {
                  case "Var": {
                    vars[field.name] = R.Out(BigInt(i), BigInt(j));
                    if (!uses[field.name]) {
                      page.rules[r].cols.push(R.Out(BigInt(i), BigInt(j)));
                    }
                    break;
                  }
                  default: {
                    throw "Nested pattern-matches are not available yet. (Used on a rewrite-rule for '" + name + "'.)";
                  }
                }
              }
              page.rules[r].clrs.push(term.args.length);
              break;
            }
            // If the argument is a variable, collect it.
            //   (add (succ a) b) = (succ (add a b))
            //                 /\ this is a var, so here we'll collect it
            case "Var": {
              vars[term.name] = R.Out(BigInt(i), 0xFFn);
              if (!uses[term.name]) {
                page.rules[r].cols.push(R.Out(BigInt(i), 0xFFn));
              }
              page.rules[r].clrs.push(0);
              break;
            }
            // If the argument is a number, we don't need to do anything.
            case "U32": {
              page.rules[r].clrs.push(0);
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
        
        //console.log("compiling", L.show_term(rule.rhs));
        page.rules[r].root = compile_term(rule.rhs, uses, page.rules[r].body, 0n);
      } else {
        throw "Invalid left-hand side.";
      }
    }

    return page;
  }

  // Compiles a term (i.e., the right-hand side). It just allocates space for
  // the term and creates the links.
  function compile_term(term: L.Term, uses:{[key:string]:number}, data: Array<R.Lnk>, loc: bigint | null) : R.Lnk {
    //console.log("compile_term", L.show_term(term));
    switch (term.$) {
      case "Var": {
        //console.log(term.name, vars, vars[term.name]);
        if (vars[term.name] !== undefined) {
          if (loc !== null) {
            var lnk = vars[term.name];
            switch (R.get_tag(lnk)) {
              case R.DP0: data[Number(R.get_val(lnk)+0n)] = R.Arg(loc); break;
              case R.DP1: data[Number(R.get_val(lnk)+1n)] = R.Arg(loc); break;
              case R.VAR: data[Number(R.get_val(lnk)+0n)] = R.Arg(loc); break;
            }
          }
          return vars[term.name];
        } else {
          console.log("???????????", term.name, vars);
          throw "Unbound variable: " + term.name;
        }
      }
      case "Dup": {
        var aloc = BigInt(data.length);
        data.length += 3;
        var dupk = (dups++);
        vars[term.nam0] = R.Dp0(dupk, aloc + 0n);
        vars[term.nam1] = R.Dp1(dupk, aloc + 0n);
        if (!uses[term.nam0]) {
          data[Number(aloc + 0n)] = R.Era();
        }
        if (!uses[term.nam1]) {
          data[Number(aloc + 1n)] = R.Era();
        }
        data[Number(aloc + 2n)] = compile_term(term.expr, uses, data, aloc + 2n);
        return compile_term(term.body, uses, data, loc);
      }
      case "Let": {
        vars[term.name] = compile_term(term.expr, uses, data, null);
        return compile_term(term.body, uses, data, loc);
      }
      case "Lam": {
        var aloc = BigInt(data.length);
        data.length += 2;
        vars[term.name] = R.Var(aloc + 0n);
        data[Number(aloc + 1n)] = compile_term(term.body, uses, data, aloc + 1n);
        if (!uses[term.name]) {
          data[Number(aloc + 0n)] = R.Era();
        }
        return R.Lam(aloc + 0n);
      }
      case "App": {
        var aloc = BigInt(data.length);
        data.length += 2;
        data[Number(aloc + 0n)] = compile_term(term.func, uses, data, aloc + 0n);
        data[Number(aloc + 1n)] = compile_term(term.argm, uses, data, aloc + 1n);
        return R.App(aloc + 0n);
      }
      case "Op2": {
        var aloc = BigInt(data.length);
        data.length += 2;
        data[Number(aloc + 0n)] = compile_term(term.val0, uses, data, aloc + 0n);
        data[Number(aloc + 1n)] = compile_term(term.val1, uses, data, aloc + 1n);
        var oper = (function (oper: string) {
          switch (oper) {
            case "ADD": return R.ADD;
            case "SUB": return R.SUB;
            case "MUL": return R.MUL;
            case "DIV": return R.DIV;
            case "MOD": return R.MOD;
            case "AND": return R.AND;
            case "OR" : return R.OR;
            case "XOR": return R.XOR;
            case "SHL": return R.SHL;
            case "SHR": return R.SHR;
            case "LTN": return R.LTN;
            case "LTE": return R.LTE;
            case "EQL": return R.EQL;
            case "GTE": return R.GTE;
            case "GTN": return R.GTN;
            case "NEQ": return R.NEQ;
          }
          return R.ADD;
        })(term.oper);
        return R.Op2(oper, aloc + 0n);
      }
      case "U32": {
        return R.U_32(BigInt(term.numb));
      }
      case "Ctr": {
        var aloc = BigInt(data.length);
        data.length += term.args.length;
        for (var i = 0; i < term.args.length; ++i) {
          data[Number(aloc + BigInt(i))] = compile_term(term.args[i], uses, data, aloc + BigInt(i));
        }
        if (is_call[term.name]) {
          return R.Cal(term.args.length, name_table[term.name], aloc + 0n);
        } else {
          return R.Ctr(term.args.length, name_table[term.name], aloc + 0n);
        }
      }
    }
  }

  var dups = 0n;
  var vars : {[name: string]: R.Lnk} = {};
  var uses : {[name: string]: number} = {};
  return compile_group(name, arity, rules.map(sanitize));
}

export function page_to_u64_array(page: R.Page): BigUint64Array {
  let nums : Array<bigint> = [];
  nums.push(BigInt(page.match.length));
  for (let num of page.match) {
    nums.push(BigInt(num));
  }
  nums.push(BigInt(page.rules.length));
  for (let rule of page.rules) {
    nums.push(BigInt(rule.test.length));
    for (let num of rule.test) {
      nums.push(num);
    }
    nums.push(rule.root);
    nums.push(BigInt(rule.body.length));
    for (let num of rule.body) {
      nums.push(num);
    }
    nums.push(BigInt(rule.clrs.length));
    for (let num of rule.clrs) {
      nums.push(BigInt(num));
    }
    nums.push(BigInt(rule.cols.length));
    for (let num of rule.cols) {
      nums.push(num);
    }
  }
  return new BigUint64Array(nums);
}

export function page_serialize(page: R.Page): Uint8Array {
  return new Uint8Array(page_to_u64_array(page).buffer);
}
