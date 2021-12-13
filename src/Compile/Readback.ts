//import * as L from "./../../../Lambolt/src/Lambolt.ts"
import * as L from "https://raw.githubusercontent.com/Kindelia/Lambolt/master/src/Lambolt.ts"
import * as C from "./../Runtime/Runtime.ts"

// Reads back a Lambolt term from Runtime's memory
export function runtime_to_lambolt(MEM: C.Mem, input_term: C.Lnk | null = null, table: {[idx:string]:string}) : string {
  var term : C.Lnk = input_term ? input_term : C.ask_lnk(MEM, 0n);
  var names : C.MAP<string> = {};
  var count : number = 0;
  var seen : C.MAP<boolean> = {};
  function name(term: C.Lnk, depth: number) {
    if (!seen[String(term)]) {
      seen[String(term)] = true;
      switch (C.get_tag(term)) {
        case C.LAM: {
          if (C.get_tag(C.ask_arg(MEM, term, 0)) !== C.ERA) {
            names[String(C.Var(C.get_loc(term,0)))] = "x" + (++count);
          }
          name(C.ask_arg(MEM, term, 1), depth + 1);
          break;
        }
        case C.APP: {
          name(C.ask_arg(MEM, term, 0), depth + 1);
          name(C.ask_arg(MEM, term, 1), depth + 1);
          break;
        }
        case C.PAR: {
          name(C.ask_arg(MEM, term, 0), depth + 1);
          name(C.ask_arg(MEM, term, 1), depth + 1);
          break;
        }
        case C.DP0: {
          name(C.ask_arg(MEM, term, 2), depth + 1);
          break;
        }
        case C.DP1: {
          name(C.ask_arg(MEM, term, 2), depth + 1);
          break;
        }
        case C.OP2: {
          name(C.ask_arg(MEM, term, 0), depth + 1);
          name(C.ask_arg(MEM, term, 1), depth + 1);
          break;
        }
        case C.U32: {
          break;
        }
        case C.CT0: case C.CT1: case C.CT2: case C.CT3: case C.CT4: case C.CT5: case C.CT6: case C.CT7:
        case C.CT8: case C.CT9: case C.CTA: case C.CTB: case C.CTC: case C.CTD: case C.CTE: case C.CTF: case C.CTG:
        case C.FN0: case C.FN1: case C.FN2: case C.FN3: case C.FN4: case C.FN5: case C.FN6: case C.FN7:
        case C.FN8: case C.FN9: case C.FNA: case C.FNB: case C.FNC: case C.FND: case C.FNE: case C.FNF: case C.FNG: {
          var arity = C.get_ari(term);
          for (var i = 0; i < arity; ++i) {
            name(C.ask_arg(MEM, term, i), depth + 1);
          }
          break;
        }
      }
    }
  }
  function go(term: C.Lnk, stacks: C.MAP<string>, seen: C.MAP<number>, depth: number) : string {
    if (seen[String(term)]) {
      return "@";
      //return "(seen:" + Object.keys(seen).length + " | " + "depth:" + depth + ")";
    } else {
      //seen = {...seen, [term]: true};
      //if (depth > 30) return "(...)";
      switch (C.get_tag(term)) {
        case C.LAM: {
          let body = go(C.ask_arg(MEM, term, 1), stacks, seen, depth + 1);
          let name = "~";
          if (C.get_tag(C.ask_arg(MEM, term, 0)) !== C.ERA) {
            name = names[String(C.Var(C.get_loc(term,0)))] || "?";
          }
          return "λ" + name + " " + body;
        }
        case C.APP: {
          let func = go(C.ask_arg(MEM, term, 0), stacks, seen, depth + 1);
          let argm = go(C.ask_arg(MEM, term, 1), stacks, seen, depth + 1);
          return "(" + func + " " + argm + ")"
        }
        case C.PAR: {
          let col = Number(C.get_ext(term));
          if (!stacks[col]) {
            stacks[col] = "";
          }
          if (stacks[col] !== undefined && stacks[col].length > 0) {
            if (stacks[col][0] === "0") {
              return go(C.ask_arg(MEM, term, 0), {...stacks,[col]:stacks[col].slice(1)}, seen, depth + 1);
            } else {
              return go(C.ask_arg(MEM, term, 1), {...stacks,[col]:stacks[col].slice(1)}, seen, depth + 1);
            }
          } else {
            let val0 = go(C.ask_arg(MEM, term, 0), stacks, seen, depth + 1);
            let val1 = go(C.ask_arg(MEM, term, 1), stacks, seen, depth + 1);
            return "<" + val0 + " " + val1 + ">"
          }
        }
        case C.DP0: {
          let col = Number(C.get_ext(term));
          return "" + go(C.ask_arg(MEM, term, 2), {...stacks,[col]:"0"+stacks[col]}, seen, depth + 1);
        }
        case C.DP1: {
          let col = Number(C.get_ext(term));
          return "" + go(C.ask_arg(MEM, term, 2), {...stacks,[col]:"1"+stacks[col]}, seen, depth + 1);
        }
        case C.OP2: {
          let oper = (function() {
            switch (C.get_ext(term)) {
              case C.ADD: return "+";
              case C.SUB: return "-";
              case C.MUL: return "*";
              case C.DIV: return "/";
              case C.MOD: return "%";
              case C.AND: return "&";
              case C.OR : return "|";
              case C.XOR: return "^";
              case C.SHL: return "<<";
              case C.SHR: return ">>";
              case C.LTN: return "<";
              case C.LTE: return "<=";
              case C.EQL: return "==";
              case C.GTE: return ">=";
              case C.GTN: return ">";
              case C.NEQ: return "!=";
            }
          })();
          let val0 = go(C.ask_arg(MEM, term, 0), stacks, seen, depth + 1);
          let val1 = go(C.ask_arg(MEM, term, 1), stacks, seen, depth + 1);
          return "(" + oper + " " + val0 + " " + val1 + ")"
        }
        case C.U32: {
          return "" + C.get_val(term);
        }
        case C.CT0: case C.CT1: case C.CT2: case C.CT3: case C.CT4: case C.CT5: case C.CT6: case C.CT7:
        case C.CT8: case C.CT9: case C.CTA: case C.CTB: case C.CTC: case C.CTD: case C.CTE: case C.CTF: case C.CTG: 
        case C.FN0: case C.FN1: case C.FN2: case C.FN3: case C.FN4: case C.FN5: case C.FN6: case C.FN7:
        case C.FN8: case C.FN9: case C.FNA: case C.FNB: case C.FNC: case C.FND: case C.FNE: case C.FNF: case C.FNG: {
          let func = C.get_ext(term);
          var arit = C.get_ari(term);
          let args = [];
          for (let i = 0; i < arit; ++i) {
            args.push(go(C.ask_arg(MEM, term, i), stacks, seen, depth + 1));
          }
          var name = table[String(func)] || ("$" + String(func));
          return "(" + name + args.map(x => " " + x).join("") + ")";
        }
        case C.VAR: {
          return names[String(term)] || "^"+String(C.get_loc(term,0)); // + "<" + C.show_lnk(C.ask_lnk(MEM, C.get_loc(term,0))) + ">";
        }
        case C.ARG: {
          return "!";
        }
        case C.ERA: {
          return "~";
        }
      }
      return "?(" + C.get_tag(term) + ")";
    }
  }
  name(term, 0);
  return go(term, {}, {}, 0);
}
