import * as L from "https://raw.githubusercontent.com/Kindelia/Lambolt/master/src/Lambolt.ts"

// Generates a name table for a whole program. That table links constructor
// names (such as `cons` and `succ`) to small ids (such as `0` and `1`).
export function gen_name_table(file: L.File) : {[name: string]: bigint} {
  var table : {[name: string]: bigint} = {};
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
          if (term.name[0] === "." && !isNaN(Number(term.name.slice(1)))) {
            table[term.name] = BigInt(term.name.slice(1));
          } else {
            table[term.name] = BigInt(fresh++);
          }
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
export function gen_is_call(file: L.File) : {[name: string]: boolean} {
  var is_call : {[name: string]: boolean} = {};
  for (var rule of file) {
    if (rule.lhs.$ === "Ctr") {
      is_call[rule.lhs.name] = true;
    }
  }
  return is_call;
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


