//import * as L from "./../../../Lambolt/src/Lambolt.ts"
import * as L from "https://raw.githubusercontent.com/Kindelia/Lambolt/master/src/Lambolt.ts"
import * as C from "./../Runtime/Runtime.ts"

// Reads back a Lambolt term from Runtime's memory
export function runtime_to_lambolt(MEM: C.Mem, input_term: C.Lnk | null = null, table: {[idx:string]:string}) : string {
  var term : C.Lnk = input_term ? input_term : C.deref(MEM, 0);
  var names : C.MAP<string> = {};
  var count : number = 0;
  var seen : C.MAP<boolean> = {};
  function name(term: C.Lnk, depth: number) {
    if (!seen[term]) {
      seen[term] = true;
      switch (C.get_tag(term)) {
        case C.LAM: {
          if (C.get_tag(C.get_lnk(MEM, term, 0)) !== C.NIL) {
            names[C.Var(C.get_loc(term,0))] = "x" + (++count);
          }
          name(C.get_lnk(MEM, term, 1), depth + 1);
          break;
        }
        case C.APP: {
          name(C.get_lnk(MEM, term, 0), depth + 1);
          name(C.get_lnk(MEM, term, 1), depth + 1);
          break;
        }
        case C.PAR: {
          name(C.get_lnk(MEM, term, 0), depth + 1);
          name(C.get_lnk(MEM, term, 1), depth + 1);
          break;
        }
        case C.DP0: {
          name(C.get_lnk(MEM, term, 2), depth + 1);
          break;
        }
        case C.DP1: {
          name(C.get_lnk(MEM, term, 2), depth + 1);
          break;
        }
        case C.CAL:
        case C.CTR: {
          var arity = C.get_ari(term);
          for (var i = 0; i < arity; ++i) {
            name(C.get_lnk(MEM, term, i), depth + 1);
          }
          break;
        }
        case C.OP2: {
          name(C.get_lnk(MEM, term, 0), depth + 1);
          name(C.get_lnk(MEM, term, 1), depth + 1);
          break;
        }
        case C.U32: {
          break;
        }
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
          return "[" + func + " " + argm + "]"
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
        case C.CAL:
        case C.CTR: {
          let func = C.get_fun(term);
          var arit = C.get_ari(term);
          let args = [];
          for (let i = 0; i < arit; ++i) {
            args.push(go(C.get_lnk(MEM, term, i), stacks, seen, depth + 1));
          }
          var name = table[func] || ("$" + String(func));
          return "(" + name + args.map(x => " " + x).join("") + ")";
        }
        case C.OP2: {
          let oper = (function() {
            switch (C.get_ope(term)) {
              case C.ADD: return "+";
              case C.SUB: return "-";
              case C.MUL: return "*";
              case C.DIV: return "/";
              case C.MOD: return "%";
              case C.AND: return "&";
              case C.OR : return "|";
              case C.XOR: return "^";
            }
          })();
          let val0 = go(C.get_lnk(MEM, term, 0), stacks, seen, depth + 1);
          let val1 = go(C.get_lnk(MEM, term, 1), stacks, seen, depth + 1);
          return "{" + val0 + " " + oper + " " + val1 + "}"
        }
        case C.U32: {
          return "#" + C.get_num(term);
        }
        case C.VAR: {
          return names[term] || "^"+String(C.get_loc(term,0)); // + "<" + C.show_lnk(C.deref(MEM, C.get_loc(term,0))) + ">";
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
