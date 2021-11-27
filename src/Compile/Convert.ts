import * as C from "./../Crusher/Language.ts"
import * as LB from "https://raw.githubusercontent.com/Kindelia/LamBolt/master/src/LamBolt.ts"

export function lambolt_to_crusher(term: LB.Term, table: {[name:string]:number}): string {
  var vars = 0;
  var lets = 0;
  var dups = "";

  function nth_name(n: any): any {
    var s = "";
    ++n;
    while (n > 0) {
      --n;
      s += String.fromCharCode(97 + n % 26);
      n = Math.floor(n / 26);
    }
    return s;
  };

  function prepare(term: any, lams: any): any {
    switch (term.ctor) {
      case "Lam": {
        let lamb : any = {ctor: "Lam", name: nth_name(vars++)};
        var lams = {...lams, [term.name]: lamb};
        lamb.uses = 0;
        lamb.body = prepare(term.body, lams);
        return lamb;
      }
      case "App": {
        let func = prepare(term.func, lams);
        let argm = prepare(term.argm, lams);
        return {ctor: "App", func, argm};
      }
      case "Ctr": {
        let func = term.func;
        let args = term.args.map((x:any) => prepare(x, lams));
        return {ctor: "Ctr", func, args};
      }
      case "Cal": {
        let func = term.func;
        let args = term.args.map((x:any) => prepare(x, lams));
        return {ctor: "Cal", func, args};
      }
      case "Var": {
        var got = lams[term.name];
        var name = got.name + (got.uses++);
        return {ctor: "Var", name};
      }
    }
  }

  function compile(term: any): string {
    switch (term.ctor) {
      case "Lam": {
        let body = compile(term.body);
        let name = "";
        if (term.uses > 1) {
          for (let i = 0; i < term.uses - 1; ++i) {
            let kind = ++lets;
            let nam0 = term.name+(i*2+0);
            let nam1 = term.name+(i*2+1);
            let expr = term.name + (i === term.uses-2 ? "" : term.uses +i);
            dups += "!" + kind + "<" + nam0 + " " + nam1 + "> = " + expr + "; ";
          };
          name = term.name;
        } else if (term.uses === 1) {
          name = term.name + "0";
        } else {
          name = "_";
        };
        return "λ" + name + " " + body
      }
      case "App": {
        let func = compile(term.func);
        let argm = compile(term.argm);
        return "(" + func + " " + argm + ")";
      }
      case "Ctr": {
        let func = table[term.func];
        var size = term.args.length;
        let args = term.args.map((x:any) => compile(x));
        return "$" + func + ":" + size + "{" + args.join(" ") + "}";
      }
      case "Cal": {
        let func = table[term.func];
        var size = term.args.length;
        let args = term.args.map((x:any) => compile(x));
        return "@" + func + ":" + size + "(" + args.join(" ") + ")";
      }
      case "Var": {
        return term.name;
      }
    }
    return "?";
  }

  var text = compile(prepare(term,{}));
  var text = dups + text;
  return text;
}

export function crusher_to_lambolt(MEM: C.Mem, input_term: C.Lnk | null = null, table: {[idx:string]:string}) : string {
  var term : C.Lnk = input_term ? input_term : C.deref(MEM, 0);
  var names : C.MAP<string> = {};
  var count : number = 0;
  var seen : C.MAP<boolean> = {};
  function name(term: C.Lnk, depth: number) {
    if (!seen[term]) {
      seen[term] = true;
      switch (C.get_tag(term)) {
        case C.LAM:
          if (C.get_tag(C.get_lnk(MEM, term, 0)) !== C.NIL) {
            names[C.Var(C.get_loc(term,0))] = "x" + (++count);
          }
          name(C.get_lnk(MEM, term, 1), depth + 1);
          break;
        case C.APP:
          name(C.get_lnk(MEM, term, 0), depth + 1);
          name(C.get_lnk(MEM, term, 1), depth + 1);
          break;
        case C.PAR:
          name(C.get_lnk(MEM, term, 0), depth + 1);
          name(C.get_lnk(MEM, term, 1), depth + 1);
          break;
        case C.DP0:
          name(C.get_lnk(MEM, term, 2), depth + 1);
          break;
        case C.DP1:
          name(C.get_lnk(MEM, term, 2), depth + 1);
          break;
        case C.CTR:
          var arity = C.get_ari(term);
          for (var i = 0; i < arity; ++i) {
            name(C.get_lnk(MEM, term, i), depth + 1);
          }
          break;
        case C.CAL:
          var arity = C.get_ari(term);
          for (var i = 0; i < arity; ++i) {
            name(C.get_lnk(MEM, term, i), depth + 1);
          }
          break;
      }
    }
  }
  function go(term: C.Lnk, stacks: C.MAP<string>, seen: C.MAP<number>, depth: number) : string {
    if (seen[term]) {
      return "@";
      //return "(seen:" + Object.keys(seen).length + " | " + "depth:" + depth + ")";
    } else {
      //seen = {...seen, [term]: true};
      //if (depth > 30) return "(...)";
      switch (C.get_tag(term)) {
        case C.LAM: {
          let body = go(C.get_lnk(MEM, term, 1), stacks, seen, depth + 1);
          let name = "~";
          if (C.get_tag(C.get_lnk(MEM, term, 0)) !== C.NIL) {
            name = names[C.Var(C.get_loc(term,0))] || "?";
          }
          return "λ" + name + " " + body;
        }
        case C.APP: {
          let func = go(C.get_lnk(MEM, term, 0), stacks, seen, depth + 1);
          let argm = go(C.get_lnk(MEM, term, 1), stacks, seen, depth + 1);
          return "(" + func + " " + argm + ")"
        }
        case C.PAR: {
          let col = C.get_col(term);
          if (!stacks[col]) {
            stacks[col] = "";
          }
          if (stacks[col] !== undefined && stacks[col].length > 0) {
            if (stacks[col][0] === "0") {
              return go(C.get_lnk(MEM, term, 0), {...stacks,[col]:stacks[col].slice(1)}, seen, depth + 1);
            } else {
              return go(C.get_lnk(MEM, term, 1), {...stacks,[col]:stacks[col].slice(1)}, seen, depth + 1);
            }
          } else {
            let val0 = go(C.get_lnk(MEM, term, 0), stacks, seen, depth + 1);
            let val1 = go(C.get_lnk(MEM, term, 1), stacks, seen, depth + 1);
            return "{" + val0 + " " + val1 + "}"
          }
        }
        case C.DP0: {
          let col = C.get_col(term);
          return "" + go(C.get_lnk(MEM, term, 2), {...stacks,[col]:"0"+stacks[col]}, seen, depth + 1);
        }
        case C.DP1: {
          let col = C.get_col(term);
          return "" + go(C.get_lnk(MEM, term, 2), {...stacks,[col]:"1"+stacks[col]}, seen, depth + 1);
        }
        case C.CTR: {
          let func = C.get_fun(term);
          var arit = C.get_ari(term);
          let args = [];
          for (let i = 0; i < arit; ++i) {
            args.push(go(C.get_lnk(MEM, term, i), stacks, seen, depth + 1));
          }
          var name = table[func] || ("$" + String(func));
          return name+ "{" + args.join(" ") + "}";
        }
        case C.CAL: {
          let func = C.get_fun(term);
          var arit = C.get_ari(term);
          let args = [];
          for (let i = 0; i < arit; ++i) {
            args.push(go(C.get_lnk(MEM, term, i), stacks, seen, depth + 1));
          }
          var name = table[func] || ("@" + String(func));
          return name + "(" + args.join(" ") + ")";
        }
        case C.VAR: {
          return names[term] || "^"+String(C.get_loc(term,0)) + "<" + C.show_lnk(C.deref(MEM, C.get_loc(term,0))) + ">";
        }
        case C.ARG: {
          return "!";
        }
        case C.NIL: {
          return "~";
        }
      }
      return "?(" + C.get_tag(term) + ")";
    }
  }
  name(term, 0);
  return go(term, {}, {}, 0);
}
