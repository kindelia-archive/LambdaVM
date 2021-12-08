export type MAP<T> = Record<string, T>;

// The LNK type is an union represented as a 53-bit uint.

// NIL 00 00 00 00 00 00 00
// DP0 02 CC CC PP PP PP PP
// DP1 03 CC CC PP PP PP PP
// VAR 04 00 00 PP PP PP PP
// ARG 05 00 00 PP PP PP PP
// ERA 06 00 00 ?? ?? ?? ??
// LAM 07 00 00 PP PP PP PP
// APP 08 00 00 PP PP PP PP
// PAR 09 00 00 PP PP PP PP
// CT0 0A FF FF PP PP PP PP
// CT1 0B FF FF PP PP PP PP
// CT2 0C FF FF PP PP PP PP
// CT3 0D FF FF PP PP PP PP
// CT4 0E FF FF PP PP PP PP
// CT5 0F FF FF PP PP PP PP
// CT6 10 FF FF PP PP PP PP
// CT7 11 FF FF PP PP PP PP
// CT8 12 FF FF PP PP PP PP
// CT9 13 FF FF PP PP PP PP
// CTA 14 FF FF PP PP PP PP
// CTB 15 FF FF PP PP PP PP
// CTC 16 FF FF PP PP PP PP
// CTD 17 FF FF PP PP PP PP
// CTE 18 FF FF PP PP PP PP
// CTF 19 FF FF PP PP PP PP
// CTG 1A FF FF PP PP PP PP
// OP2 1B OO OO PP PP PP PP
// U32 1C 00 00 VV VV VV VV
// F32 1D 00 00 VV VV VV VV
// OUT 1F 00 00 00 00 XX YY

// P = position
// C = color
// F = function
// O = operation
// V = value
// X = argument
// Y = field

export const VAL : number = 2 ** 0;
export const EXT : number = 2 ** 32;
export const TAG : number = 2 ** 48;

export const NIL : number = 0x00 * TAG
export const DP0 : number = 0x02 * TAG
export const DP1 : number = 0x03 * TAG
export const VAR : number = 0x04 * TAG
export const ARG : number = 0x05 * TAG
export const ERA : number = 0x06 * TAG
export const LAM : number = 0x07 * TAG
export const APP : number = 0x08 * TAG
export const PAR : number = 0x09 * TAG
export const CT0 : number = 0x0A * TAG
export const CT1 : number = 0x0B * TAG
export const CT2 : number = 0x0C * TAG
export const CT3 : number = 0x0D * TAG
export const CT4 : number = 0x0E * TAG
export const CT5 : number = 0x0F * TAG
export const CT6 : number = 0x10 * TAG
export const CT7 : number = 0x11 * TAG
export const CT8 : number = 0x12 * TAG
export const CT9 : number = 0x13 * TAG
export const CTA : number = 0x14 * TAG
export const CTB : number = 0x15 * TAG
export const CTC : number = 0x16 * TAG
export const CTD : number = 0x17 * TAG
export const CTE : number = 0x18 * TAG
export const CTF : number = 0x19 * TAG
export const CTG : number = 0x1A * TAG
export const OP2 : number = 0x1B * TAG
export const U32 : number = 0x1C * TAG
export const F32 : number = 0x1D * TAG
export const OUT : number = 0x1F * TAG

export const ADD : number = 0x00 * EXT
export const SUB : number = 0x01 * EXT
export const MUL : number = 0x02 * EXT
export const DIV : number = 0x03 * EXT
export const MOD : number = 0x04 * EXT
export const AND : number = 0x05 * EXT
export const OR  : number = 0x06 * EXT
export const XOR : number = 0x07 * EXT
export const SHL : number = 0x08 * EXT
export const SHR : number = 0x09 * EXT
export const LTN : number = 0x10 * EXT
export const LTE : number = 0x11 * EXT
export const EQL : number = 0x12 * EXT
export const GTE : number = 0x13 * EXT
export const GTN : number = 0x14 * EXT
export const NEQ : number = 0x15 * EXT

//GENERATED_CONSTRUCTOR_IDS_START//
//GENERATED_CONSTRUCTOR_IDS//
//GENERATED_CONSTRUCTOR_IDS_END//

export type Lnk = number // U52 in JS, U64 in C

export type Arr = {size: number, data: Uint32Array};
export type Mem = Arr;

export type Page = {
  match: Array<number>,
  rules: Array<{
    test: Array<number>, 
    clrs: Array<number>,
    cols: Array<Lnk>,
    root: Lnk,
    body: Array<Lnk>,
  }>
}

export type Book = {[fun:string]: Page};

var BOOK : Book = {};

export function add_dynbook(book: Book) {
  for (var key in book) {
    BOOK[key] = book[key];
  }
}

// Uint64Array
// -----------

//export function array_alloc(capacity: number) {
  //return {
    //size: 0,
    //data: new Float64Array(capacity),
  //}
//}

//export function array_write(arr: Arr, idx: number, val: number) {
  //arr.data[idx] = val;
//}

//export function array_read(arr: Arr, idx: number) : number {
  //return arr.data[idx];
//}

export function array_alloc(capacity: number) {
  return {
    size: 0,
    data: new Uint32Array(capacity * 2),
  }
}

export function array_write(arr: Arr, idx: number, val: number) {
  if (val >= 0) {
    arr.data[idx * 2 + 1] = (val / 0x100000000) >>> 0;
    arr.data[idx * 2 + 0] = val >>> 0;
  } else {
    arr.data[idx * 2 + 1] = (((-val) / 0x100000000) >>> 0) | 0x80000000;
    arr.data[idx * 2 + 0] = (-val) >>> 0;
  }
}

export function array_read(arr: Arr, idx: number) : number {
  var a = arr.data[idx * 2 + 0];
  var b = arr.data[idx * 2 + 1];
  if (b & 0x80000000) {
    return -(((b & 0x7FFFFFF) * 0x100000000) + a);
  } else {
    return ((b * 0x100000000) + a);
  }
}

export function array_push(arr: Arr, value: number) {
  array_write(arr, arr.size++, value);
}

export function array_pop(arr: Arr) : number | null {
  if (arr.size > 0) {
    return array_read(arr, --arr.size);
  } else {
    return null;
  }
}

// Memory
// ------

export var GAS : number = 0;

//export var NEW_COL : number = 0;
//export var NEW_FUN : number = 0;

export function Var(pos: number) : Lnk {
  return VAR + pos;
}

export function Dp0(col: number, pos: number) : Lnk {
  return DP0 + col + pos;
}

export function Dp1(col: number, pos: number) : Lnk {
  return DP1 + col + pos;
}

export function Arg(pos: number) : Lnk {
  return ARG + pos;
}

export function Era() : Lnk {
  return ERA;
}

export function Lam(pos: number) : Lnk {
  return LAM + pos;
}

export function App(pos: number) : Lnk {
  return APP + pos;
}

export function Par(col: number, pos: number) : Lnk {
  return PAR + col + pos;
}

export function Op2(ope: number, pos: number) : Lnk {
  return OP2 + ope + pos;
}

export function U_32(val: number) : Lnk {
  return U32 + val;
}

export function Nil() : Lnk {
  return NIL;
}

export function Ct0(fun: number, pos: number) : Lnk {
  return CT0 + fun + pos;
}

export function Ct1(fun: number, pos: number) : Lnk {
  return CT1 + fun + pos;
}

export function Ct2(fun: number, pos: number) : Lnk {
  return CT2 + fun + pos;
}

export function Ct3(fun: number, pos: number) : Lnk {
  return CT3 + fun + pos;
}

export function Ct4(fun: number, pos: number) : Lnk {
  return CT4 + fun + pos;
}

export function Ct5(fun: number, pos: number) : Lnk {
  return CT5 + fun + pos;
}

export function Ct6(fun: number, pos: number) : Lnk {
  return CT6 + fun + pos;
}

export function Ct7(fun: number, pos: number) : Lnk {
  return CT7 + fun + pos;
}

export function Ct8(fun: number, pos: number) : Lnk {
  return CT8 + fun + pos;
}

export function Ct9(fun: number, pos: number) : Lnk {
  return CT9 + fun + pos;
}

export function CtA(fun: number, pos: number) : Lnk {
  return CTA + fun + pos;
}

export function CtB(fun: number, pos: number) : Lnk {
  return CTB + fun + pos;
}

export function CtC(fun: number, pos: number) : Lnk {
  return CTC + fun + pos;
}

export function CtD(fun: number, pos: number) : Lnk {
  return CTD + fun + pos;
}

export function CtE(fun: number, pos: number) : Lnk {
  return CTE + fun + pos;
}

export function CtF(fun: number, pos: number) : Lnk {
  return CTF + fun + pos;
}

export function CtG(fun: number, pos: number) : Lnk {
  return CTG + fun + pos;
}

export function Out(arg: number, fld: number) : Lnk {
  return OUT + (arg << 8) + fld;
}

export function Ctr(ari: number, fun: number, pos: number) : Lnk {
  switch (ari) {
    case 0x00: return Ct0(fun, pos);
    case 0x01: return Ct1(fun, pos);
    case 0x02: return Ct2(fun, pos);
    case 0x03: return Ct3(fun, pos);
    case 0x04: return Ct4(fun, pos);
    case 0x05: return Ct5(fun, pos);
    case 0x06: return Ct6(fun, pos);
    case 0x07: return Ct7(fun, pos);
    case 0x08: return Ct8(fun, pos);
    case 0x09: return Ct9(fun, pos);
    case 0x0A: return CtA(fun, pos);
    case 0x0B: return CtB(fun, pos);
    case 0x0C: return CtC(fun, pos);
    case 0x0D: return CtD(fun, pos);
    case 0x0E: return CtE(fun, pos);
    case 0x0F: return CtF(fun, pos);
    case 0x10: return CtG(fun, pos);
  }
  return 0;
}

export function Cal(ari: number, fun: number, pos: number) : Lnk {
  return -(Ctr(ari, fun, pos));
}

export function get_tag(lnk: Lnk) : number {
  return (Math.floor(Math.abs(lnk) / TAG) & 0x1F) * TAG;
}

export function get_ext(lnk: Lnk) : number {
  return (Math.floor(Math.abs(lnk) / EXT) & 0xFFFF) * EXT;
}

export function get_val(lnk: Lnk) : number {
  return Math.floor(Math.abs(lnk)) >>> 0;
}

export function is_cal(lnk: Lnk) : number {
  return lnk >= 0 ? 0 : 1;
}

export function get_ari(lnk: Lnk) : number {
  return (get_tag(lnk) - CT0) / TAG;
}

export function get_loc(lnk: Lnk, arg: number) : number {
  return get_val(lnk) + arg;
}

export function ask_arg(mem: Mem, term: Lnk, arg: number) : Lnk {
  return array_read(mem, get_loc(term,arg));
}

export function ask_lnk(mem: Mem, loc: number) : Lnk {
  return array_read(mem, loc);
}

export function ask_gas() : number {
  return GAS;
}

export function link(mem: Mem, loc: number, lnk: Lnk) : Lnk {
  var tag = get_tag(lnk);
  array_write(mem, loc, lnk);
  if (tag <= VAR) {
    array_write(mem, get_loc(lnk, (tag / TAG) & 1), Arg(loc));
  }
  return lnk;
}

export function alloc(mem: Mem, size: number) : number {
  if (size === 0) {
    return 0;
  } else {
    var loc = mem.size;
    mem.size += size;
    return loc;
  }
}

export function clear(mem: Mem, loc: number, size: number) {
  // TODO
}

// ~~~

export function init(capacity: number = 2 ** 29) {
  var mem = array_alloc(capacity);
  array_push(mem, 0);
  return mem;
}

// Garbage Collection
// ------------------

export function collect(mem: Mem, term: Lnk) {
  switch (get_tag(term)) {
    case DP0: {
      link(mem, get_loc(term,0), Era());
      //reduce(mem, get_loc(ask_arg(mem,term,1),0));
      break;
    }
    case DP1: {
      link(mem, get_loc(term,0), Era());
      //reduce(mem, get_loc(ask_arg(mem,term,0),0));
      break;
    }
    case VAR: {
      link(mem, get_loc(term,0), Era());
      break;
    }
    case LAM: {
      if (get_tag(ask_arg(mem,term,0)) != ERA) {
        link(mem, get_loc(ask_arg(mem,term,0),0), Era());
      }
      collect(mem, ask_arg(mem,term,1));
      clear(mem, get_loc(term,0), 2);
      break;
    }
    case APP: {
      collect(mem, ask_arg(mem,term,0));
      collect(mem, ask_arg(mem,term,1));
      clear(mem, get_loc(term,0), 2);
      break;
    }
    case PAR: {
      collect(mem, ask_arg(mem,term,0));
      collect(mem, ask_arg(mem,term,1));
      clear(mem, get_loc(term,0), 2);
      break;
    }
    case OP2: {
      collect(mem, ask_arg(mem,term,0));
      collect(mem, ask_arg(mem,term,1));
      break;
    }
    case U32: {
      break;
    }
    case CT0: case CT1: case CT2: case CT3:
    case CT4: case CT5: case CT6: case CT7:
    case CT8: case CT9: case CTA: case CTB:
    case CTC: case CTD: case CTE: case CTF: {
      var arity = get_ari(term);
      for (var i = 0; i < arity; ++i) {
        collect(mem, ask_arg(mem,term,i));
      }
      clear(mem, get_loc(term,0), arity);
      break;
    }
  }
}

// Debug
// -----

export function debug_show_lnk(x: Lnk): String {
  var tag = get_tag(x);
  var ext = (get_ext(x)/EXT).toString(16);
  var val = get_val(x).toString(16);
  var ini = (function() {
    switch (tag) {
      case DP0: return "DP0";
      case DP1: return "DP1";
      case VAR: return "VAR";
      case ARG: return "ARG";
      case ERA: return "ERA";
      case LAM: return "LAM";
      case APP: return "APP";
      case PAR: return "PAR";
      case CT0: return "CT0";
      case CT1: return "CT1";
      case CT2: return "CT2";
      case CT3: return "CT3";
      case CT4: return "CT4";
      case CT5: return "CT5";
      case CT6: return "CT6";
      case CT7: return "CT7";
      case CT8: return "CT8";
      case CT9: return "CT9";
      case CTA: return "CTA";
      case CTB: return "CTB";
      case CTC: return "CTC";
      case CTD: return "CTD";
      case CTE: return "CTE";
      case CTF: return "CTF";
      case CTG: return "CTG";
      case OP2: return "OP2";
      case U32: return "U32";
      case F32: return "F32";
      case OUT: return "OUT";
      case NIL: return "NIL";
      default: return (tag/TAG).toString(16);
    }
  })();
  return ini+":"+ext+":"+val;
}

export function debug_show(mem: Mem, term: Lnk, table: {[str:string]:string}) : string {
  var lets : {[key:string]:number} = {};
  var kinds : {[key:string]:number} = {};
  var names : {[key:string]:string} = {};
  var count = 0;
  function find_lets(term: Lnk) {
    switch (get_tag(term)) {
      case LAM: {
        names[get_loc(term,0)] = String(++count);
        find_lets(ask_arg(mem, term, 1));
        break;
      }
      case APP: {
        find_lets(ask_arg(mem, term, 0));
        find_lets(ask_arg(mem, term, 1));
        break;
      }
      case PAR: {
        find_lets(ask_arg(mem, term, 0));
        find_lets(ask_arg(mem, term, 1));
        break;
      }
      case DP0: {
        if (!lets[get_loc(term,0)]) {
          names[get_loc(term,0)] = String(++count);
          kinds[get_loc(term,0)] = get_ext(term) / EXT;
          lets[get_loc(term,0)] = get_loc(term,0);
          find_lets(ask_arg(mem, term, 2));
        }
        break;
      }
      case DP1: {
        if (!lets[get_loc(term,0)]) {
          names[get_loc(term,0)] = String(++count);
          kinds[get_loc(term,0)] = get_ext(term) / EXT;
          lets[get_loc(term,0)] = get_loc(term,0);
          find_lets(ask_arg(mem, term, 2));
        }
        break;
      }
      case OP2: {
        find_lets(ask_arg(mem, term, 0));
        find_lets(ask_arg(mem, term, 1));
        break;
      }
      case CT0: case CT1: case CT2: case CT3:
      case CT4: case CT5: case CT6: case CT7:
      case CT8: case CT9: case CTA: case CTB:
      case CTC: case CTD: case CTE: case CTF: {
        var arity = get_ari(term);
        for (var i = 0; i < arity; ++i) {
          find_lets(ask_arg(mem, term,i));
        }
        break;
      }
    }
  }
  function go(term: Lnk) : string {
    switch (get_tag(term)) {
      case DP0: {
        return "a" + (names[get_loc(term,0)] || "?");
      }
      case DP1: {
        return "b" + (names[get_loc(term,0)] || "?");
      }
      case VAR: {
        return "x" + (names[get_loc(term,0)] || "?");
      }
      case LAM: {
        var name = "x" + (names[get_loc(term,0)] || "?");
        return "λ" + name + " " + go(ask_arg(mem, term, 1));
      }
      case APP: {
        let func = go(ask_arg(mem, term, 0));
        let argm = go(ask_arg(mem, term, 1));
        return "(" + func + " " + argm + ")";
      }
      case PAR: {
        let kind = get_ext(term);
        let func = go(ask_arg(mem, term, 0));
        let argm = go(ask_arg(mem, term, 1));
        return "&" + kind + "<" + func + " " + argm + ">";
      }
      case OP2: {
        let oper = get_ext(term);
        let val0 = go(ask_arg(mem, term, 0));
        let val1 = go(ask_arg(mem, term, 1));
        var symb = "";
        switch (oper) {
          case 0x00: symb = "+"; break;
          case 0x01: symb = "-"; break;
          case 0x02: symb = "*"; break;
          case 0x03: symb = "/"; break;
          case 0x04: symb = "%"; break;
          case 0x05: symb = "&"; break;
          case 0x06: symb = "|"; break;
          case 0x07: symb = "^"; break;
          case 0x08: symb = "<<"; break;
          case 0x09: symb = ">>"; break;
          case 0x10: symb = "<"; break;
          case 0x11: symb = "<="; break;
          case 0x12: symb = "="; break;
          case 0x13: symb = ">="; break;
          case 0x14: symb = ">"; break;
          case 0x15: symb = "!="; break;
        }
        return "(" + symb + " " + val0 + " " + val1 + ")";
      }
      case U32: {
        return "" + get_val(term);
      }
      case CT0: case CT1: case CT2: case CT3:
      case CT4: case CT5: case CT6: case CT7:
      case CT8: case CT9: case CTA: case CTB:
      case CTC: case CTD: case CTE: case CTF: {
        let func = get_ext(term);
        let arit = get_ari(term);
        let args = [];
        for (let i = 0; i < arit; ++i) {
          args.push(go(ask_arg(mem, term, i)));
        }
        if (table && table[func]) {
          return "(" + table[func] + args.map(x => " " + x).join("") + ")";
        } else {
          return "(F" + (func / EXT) + args.map(x => " " + x).join("") + ")";
        }
      }
    }
    return "<?" + term + ">";
  }
  find_lets(term);
  var text = go(term);
  for (var key of Object.keys(lets).reverse()) {
    var pos  = lets[key];
    var kind = kinds[key] || 0;
    var name = names[pos] || "?";
    var nam0 = ask_lnk(mem, pos+0) === Era() ? "*" : "a"+name;
    var nam1 = ask_lnk(mem, pos+1) === Era() ? "*" : "b"+name;
    text += " !" + kind + "<"+nam0+" "+nam1+"> = " + go(ask_lnk(mem, pos + 2)) + ";";
  }
  //text += go(term);
  return text;
}

// Reduction
// ---------

export function subst(mem: Mem, lnk: Lnk, val: Lnk) {
  if (get_tag(lnk) !== ERA) {
    link(mem, get_loc(lnk,0), val);
  } else {
    collect(mem, val);
  }
}

// (λx:b a)
// --------- APP-LAM
// x <- a
export function app_lam(mem: Mem, host: number, term: Lnk, arg0: Lnk): Lnk {
  //console.log("[app-lam] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  subst(mem, ask_arg(mem, arg0, 0), ask_arg(mem, term, 1));
  var done = link(mem, host, ask_arg(mem, arg0, 1));
  clear(mem, get_loc(term,0), 2);
  clear(mem, get_loc(arg0,0), 2);
  return done;
}

// (&A<a b> c)
// ----------------- APP-PAR
// !A<x0 x1> = c
// &A<(a x0) (b x1)>
function app_par(mem: Mem, host: number, term: Lnk, arg0: Lnk): Lnk {
  //console.log("[app-par] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var app0 = get_loc(term, 0);
  var app1 = get_loc(arg0, 0);
  var let0 = alloc(mem, 3);
  var par0 = alloc(mem, 2);
  link(mem, let0+2, ask_arg(mem, term, 1));
  link(mem, app0+1, Dp0(get_ext(arg0), let0));
  link(mem, app0+0, ask_arg(mem, arg0, 0));
  link(mem, app1+0, ask_arg(mem, arg0, 1));
  link(mem, app1+1, Dp1(get_ext(arg0), let0));
  link(mem, par0+0, App(app0));
  link(mem, par0+1, App(app1));
  var done = Par(get_ext(arg0), par0);
  link(mem, host, done);
  return done;
}

// (+ a b)
// --------- OP2-U32
// add(a, b)
function op2_u32_u32(mem: Mem, host: number, term: Lnk, arg0: Lnk, arg1: Lnk): Lnk {
  //console.log("[op2-u32-u32] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var a = get_val(arg0);
  var b = get_val(arg1);
  var c = 0;
  switch (get_ext(term)) {
    case ADD: c = (a +   b) >>> 0;   break;
    case SUB: c = (a -   b) >>> 0;   break;
    case MUL: c = (a *   b) >>> 0;   break;
    case DIV: c = (a /   b) >>> 0;   break;
    case MOD: c = (a %   b) >>> 0;   break;
    case AND: c = (a &   b) >>> 0;   break;
    case OR : c = (a |   b) >>> 0;   break;
    case XOR: c = (a ^   b) >>> 0;   break;
    case SHL: c = (a <<  b) >>> 0;   break;
    case SHR: c = (a >>> b) >>> 0;   break;
    case LTN: c = (a <   b) ? 1 : 0; break;
    case LTE: c = (a <=  b) ? 1 : 0; break;
    case EQL: c = (a === b) ? 1 : 0; break;
    case GTE: c = (a >=  b) ? 1 : 0; break;
    case GTN: c = (a >   b) ? 1 : 0; break;
    case NEQ: c = (a !== b) ? 1 : 0; break;
  }
  var done = U_32(c);
  clear(mem, get_loc(term,0), 2);
  link(mem, host, done);
  return done;
}

// (+ &A<a0 a1> b)
// --------------- OP2-PAR-0
// !A<b0 b1> = b
// &A<(+ a0 b0) (+ a1 b1)>
function op2_par_0(mem: Mem, host: number, term: Lnk, arg0: Lnk, arg1: Lnk): Lnk {
  //console.log("[op2-par-0] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var op20 = get_loc(term, 0);
  var op21 = get_loc(arg0, 0);
  var let0 = alloc(mem, 3);
  var par0 = alloc(mem, 2);
  link(mem, let0+2, arg1);
  link(mem, op20+1, Dp0(get_ext(arg0), let0));
  link(mem, op20+0, ask_arg(mem, arg0, 0));
  link(mem, op21+0, ask_arg(mem, arg0, 1));
  link(mem, op21+1, Dp1(get_ext(arg0), let0));
  link(mem, par0+0, Op2(get_ext(term), op20));
  link(mem, par0+1, Op2(get_ext(term), op21));
  var done = Par(get_ext(arg0), par0);
  link(mem, host, done);
  return done;
}

// (+ a &A<b0 b1>)
// --------------- OP2-PAR-1
// !A<a0 a1> = a
// &A<(+ a0 a1) (+ b0 b1)>
function op2_par_1(mem: Mem, host: number, term: Lnk, arg0: Lnk, arg1: Lnk): Lnk {
  //console.log("[op2-par-1] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var op20 = get_loc(term, 0);
  var op21 = get_loc(arg1, 0);
  var let0 = alloc(mem, 3);
  var par0 = alloc(mem, 2);
  link(mem, let0+2, arg0);
  link(mem, op20+1, Dp0(get_ext(arg1), let0));
  link(mem, op20+0, ask_arg(mem, arg1, 0));
  link(mem, op21+0, ask_arg(mem, arg1, 1));
  link(mem, op21+1, Dp1(get_ext(arg1), let0));
  link(mem, par0+0, Op2(get_ext(term), op20));
  link(mem, par0+1, Op2(get_ext(term), op21));
  var done = Par(get_ext(arg1), par0);
  link(mem, host, done);
  return done;
}

// !A<r s> = λx f
// --------------- LET-LAM
// !A<f0 f1> = f
// r <- λx0: f0
// s <- λx1: f1
// x <- &A<x0 x1>
// ~
function let_lam(mem: Mem, host: number, term: Lnk, arg0: Lnk): Lnk {
  //console.log("[let-lam] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var let0 = get_loc(term, 0);
  var par0 = get_loc(arg0, 0);
  var lam0 = alloc(mem, 2);
  var lam1 = alloc(mem, 2);
  link(mem, let0+2, ask_arg(mem, arg0, 1));
  link(mem, par0+1, Var(lam1));
  var arg0_arg_0 = ask_arg(mem, arg0, 0);
  link(mem, par0+0, Var(lam0));
  subst(mem, arg0_arg_0, Par(get_ext(term), par0));
  var term_arg_0 = ask_arg(mem,term,0);
  link(mem, lam0+1, Dp0(get_ext(term), let0));
  subst(mem, term_arg_0, Lam(lam0));
  var term_arg_1 = ask_arg(mem,term,1);                      
  link(mem, lam1+1, Dp1(get_ext(term), let0));
  subst(mem, term_arg_1, Lam(lam1));
  var done = Lam(get_tag(term) == DP0 ? lam0 : lam1);
  link(mem, host, done);
  return done;
}

// !A<x y> = !A<a b>
// ----------------- LET-PAR-EQ
// x <- a
// y <- b
// ~
function let_par_eq(mem: Mem, host: number, term: Lnk, arg0: Lnk): Lnk {
  //console.log("[let-par-eq] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  subst(mem, ask_arg(mem,term,0), ask_arg(mem,arg0,0));
  subst(mem, ask_arg(mem,term,1), ask_arg(mem,arg0,1));
  var done = link(mem, host, ask_arg(mem, arg0, get_tag(term) === DP0 ? 0 : 1));
  clear(mem, get_loc(term,0), 3);
  clear(mem, get_loc(arg0,0), 2);
  return done;
}

// !A<x y> = !B<a b>
// ----------------- LET-PAR-DF
// x <- !B<xA xB>
// y <- !B<yA yB>
// !A<xA yA> = a
// !A<xB yB> = b
// ~
function let_par_df(mem: Mem, host: number, term: Lnk, arg0: Lnk): Lnk {
  //console.log("[let-par-df] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var par0 = alloc(mem, 2);
  var let0 = get_loc(term,0);
  var par1 = get_loc(arg0,0);
  var let1 = alloc(mem, 3);
  link(mem, let0+2, ask_arg(mem,arg0,0));
  link(mem, let1+2, ask_arg(mem,arg0,1));
  var term_arg_0 = ask_arg(mem,term,0);
  var term_arg_1 = ask_arg(mem,term,1);
  link(mem, par1+0, Dp1(get_ext(term),let0));
  link(mem, par1+1, Dp1(get_ext(term),let1));
  link(mem, par0+0, Dp0(get_ext(term),let0));
  link(mem, par0+1, Dp0(get_ext(term),let1));
  subst(mem, term_arg_0, Par(get_ext(arg0),par0));
  subst(mem, term_arg_1, Par(get_ext(arg0),par1));
  var done = Par(get_ext(arg0), get_tag(term) === DP0 ? par0 : par1);
  link(mem, host, done);
  return done;
}

// !A<x y> = N
// ------------
// x <- N
// y <- N
// ~
function let_u32(mem: Mem, host: number, term: Lnk, arg0: Lnk): Lnk {
  ++GAS;
  //console.log("[let-u32] " + get_loc(term,0) + " " + get_loc(arg0,0));
  subst(mem, ask_arg(mem,term,0), arg0);
  subst(mem, ask_arg(mem,term,1), arg0);
  var done = arg0;
  link(mem, host, arg0);
  return done;
}

// !A<x y> = $V:L{a b c ...}
// ------------------------- LET-CTR
// !A<a0 a1> = a
// !A<b0 b1> = b
// !A<c0 c1> = c
// ...
// x <- $V:L{a0 b0 c0 ...}
// y <- $V:L{a1 b1 c1 ...}
// ~
function let_ctr(mem: Mem, host: number, term: Lnk, arg0: Lnk): Lnk {
  //console.log("[let-ctr] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  let func = get_ext(arg0);
  let arit = get_ari(arg0);
  if (arit === 0) {
    subst(mem, ask_arg(mem,term,0), Ct0(func, 0));
    subst(mem, ask_arg(mem,term,1), Ct0(func, 0));
    clear(mem, get_loc(term,0), 3);
    var done = link(mem, host, Ct0(func, 0));
    return done;
  } else {
    let ctr0 = get_loc(arg0,0);
    let ctr1 = alloc(mem, arit);
    var term_arg_0 = ask_arg(mem,term,0);
    var term_arg_1 = ask_arg(mem,term,1);
    for (let i = 0; i < arit; ++i) {
      let leti = i === 0 ? get_loc(term,0) : alloc(mem, 3);
      var arg0_arg_i = ask_arg(mem, arg0, i);
      link(mem, ctr0+i, Dp0(get_ext(term), leti));
      link(mem, ctr1+i, Dp1(get_ext(term), leti));
      link(mem, leti+2, arg0_arg_i);
    }
    subst(mem, term_arg_0, Ctr(arit, func, ctr0));
    subst(mem, term_arg_1, Ctr(arit, func, ctr1));
    var done = Ctr(arit, func, get_tag(term) === DP0 ? ctr0 : ctr1);
    link(mem, host, done);
    return done;
  }
}

function cal_ctrs(
  mem: Mem,
  host: number,
  clrs: Array<number>,
  cols: Array<Lnk>,
  root: Lnk,
  body: Array<number>,
  term: Lnk,
  args: Array<Lnk>,
): Lnk {
  ++GAS;
  //console.log("[cal-ctrs] " + get_loc(term,0));
  var data = mem.data;
  var size = body.length;
  var aloc = alloc(mem, size);
  //console.log("-- size="+size, "aloc="+aloc);
  //console.log("-- R: " + debug_show_lnk(root));
  for (var i = 0; i < size; ++i) {
    var lnk = body[i];
    //console.log("-- " + i.toString(16) + ": " + debug_show_lnk(lnk));
    if (get_tag(lnk) == OUT) {
      var arg = (lnk >>> 8) & 0xFF;
      var fld = (lnk >>> 0) & 0xFF;
      var out = fld === 0xFF ? args[arg] : ask_arg(mem, args[arg], fld);
      link(mem, aloc + i, out);
    } else {
      array_write(mem, aloc + i, lnk + (get_tag(lnk) < U32 ? aloc * (lnk >= 0 ? 1 : -1) : 0));
    }
  }
  //console.log("---", debug_show(mem,ask_lnk(mem,0),{}));
  if (get_tag(root) == OUT) {
    var root_arg = (root >>> 8) & 0xFF;
    var root_fld = (root >>> 0) & 0xFF;
    var root_lnk = root_fld === 0xFF ? args[root_arg] : ask_arg(mem, args[root_arg], root_fld);
    //console.log("-- root", root_arg, root_fld, root_fld === 0xFF, debug_show_lnk(root_lnk));
  } else {
    var root_lnk = root + (get_tag(root) < U32 ? aloc * (root >= 0 ? 1 : -1) : 0);
  }
  var done = root_lnk;
  link(mem, host, done);
  clear(mem, get_loc(term, 0), args.length);
  for (var i = 0; i < clrs.length; ++i) {
    var clr = clrs[i];
    if (clr > 0) {
      clear(mem, get_loc(args[i],0), clr);
    }
  }
  for (var i = 0; i < cols.length; ++i) {
    collect(mem, cols[i]);
  }
  //console.log("===", debug_show(mem,ask_lnk(mem,0),{}));
  return done;
}

export function reduce(mem: Mem, host: number) : Lnk {
  main: while (true) {
    var term = ask_lnk(mem, host);
    //console.log("reduce " + get_tag(term)/TAG + ":" + get_ext(term)/EXT + ":" + get_val(term));
    //console.log("reduce", debug_show(mem,ask_lnk(mem,0),{}));
    //console.log((function() { var lnks = []; for (var i = 0; i < 26; ++i) { lnks.push(ask_lnk(mem, i)); } return lnks.map(debug_show_lnk).join("|"); })());
    switch (get_tag(term)) {
      case APP: {
        let arg0 = reduce(mem, get_loc(term,0));
        if (get_tag(arg0) === LAM) {
          app_lam(mem, host, term, arg0);
          continue;
        }
        if (get_tag(arg0) === PAR) {
          return app_par(mem, host, term, arg0);
        }
        break;
      }
      case DP0:
      case DP1: {
        let arg0 = reduce(mem, get_loc(term,2));
        if (get_tag(arg0) === LAM) {
          let_lam(mem, host, term, arg0);
          continue;
        }
        if (get_tag(arg0) === PAR) {
          if (get_ext(term) === get_ext(arg0)) {
            let_par_eq(mem, host, term, arg0);
            continue;
          } else {
            return let_par_df(mem, host, term, arg0);
          }
        }
        if (get_tag(arg0) === U32) {
          let_u32(mem, host, term, arg0);
          continue;
        }
        if (get_tag(arg0) >= CT0 && get_tag(arg0) <= CTF && !is_cal(term)) {
          return let_ctr(mem, host, term, arg0);
        }
        break;
      }
      case OP2: {
        var arg0 = reduce(mem, get_loc(term,0));
        var arg1 = reduce(mem, get_loc(term,1));
        if (get_tag(arg0) === U32 && get_tag(arg1) === U32) {
          return op2_u32_u32(mem, host, term, arg0, arg1);
        }
        if (get_tag(arg0) == PAR) {
          return op2_par_0(mem, host, term, arg0, arg1);
        }
        if (get_tag(arg1) == PAR) {
          return op2_par_1(mem, host, term, arg0, arg1);
        }
        break;
      }
      case CT0: case CT1: case CT2: case CT3:
      case CT4: case CT5: case CT6: case CT7:
      case CT8: case CT9: case CTA: case CTB:
      case CTC: case CTD: case CTE: case CTF: {
        if (is_cal(term)) {
          var fun = get_ext(term);
          //console.log("\ncall", fun);
          
          // Static rules
          // ------------
          
          switch (fun)
          //GENERATED_REWRITE_RULES_START//
          {
//GENERATED_REWRITE_RULES//
          }
          //GENERATED_REWRITE_RULES_END//
          
          // Dynamic rules
          // -------------
          
          var page = BOOK[fun/EXT];
          if (page) {
            //console.log("- got entry...");
            var args = [];
            for (var i = 0; i < page.match.length; ++i) {
              if (page.match[i] > 0) {
                args[i] = reduce(mem, get_loc(term, i));
              } else {
                args[i] = ask_lnk(mem, get_loc(term, i));
              }
            }
            //console.log("- collected " + args.length + " args...");
            try_rule: for (var rule of page.rules) {
              //console.log("- testing rule with arity " + rule.test.length);
              for (var j = 0; j < rule.test.length; ++j) {
                var value = rule.test[j];
                //console.log("-- testing argument " + j + " " + value.toString(16));
                if (get_tag(value) === CT0 && get_ext(args[j]) !== get_ext(value)) {
                  //console.log("-- fail (ctr doesn't match)", get_tag(args[j])/TAG);
                  continue try_rule;
                }
                if (get_tag(value) === U32 && get_val(args[j]) !== get_val(value)) {
                  //console.log("-- fail (num doesn't match)");
                  continue try_rule;
                }
              }
              cal_ctrs(mem, host, rule.clrs, rule.cols, rule.root, rule.body, term, args);
              continue main;
            }
          }
        }
        break;
      }
    }
    return term;
  }
}

export function normal(mem: Mem, host: number) : number {
  GAS = 0;
  normal_go(mem, host, {});
  return GAS;
}

function normal_go(mem: Mem, host: number, seen: MAP<boolean>) : Lnk {
  var term = ask_lnk(mem, host);
  if (seen[host]) {
    return term;
  } else {
    term = reduce(mem, host);
    seen[host] = true;
    switch (get_tag(term)) {
      case LAM: {
        link(mem, get_loc(term,1), normal_go(mem, get_loc(term,1), seen));
        return term;
      }
      case APP: {
        link(mem, get_loc(term,0), normal_go(mem, get_loc(term,0), seen));
        link(mem, get_loc(term,1), normal_go(mem, get_loc(term,1), seen));
        return term;
      }
      case PAR: {
        link(mem, get_loc(term,0), normal_go(mem, get_loc(term,0), seen));
        link(mem, get_loc(term,1), normal_go(mem, get_loc(term,1), seen));
        return term;
      }
      case DP0: {
        link(mem, get_loc(term,2), normal_go(mem, get_loc(term,2), seen));
        return term;
      }
      case DP1: {
        link(mem, get_loc(term,2), normal_go(mem, get_loc(term,2), seen));
        return term;
      }
      case CT0: case CT1: case CT2: case CT3:
      case CT4: case CT5: case CT6: case CT7:
      case CT8: case CT9: case CTA: case CTB:
      case CTC: case CTD: case CTE: case CTF: {
        var arity = get_ari(term);
        for (var i = 0; i < arity; ++i) {
          link(mem, get_loc(term,i), normal_go(mem, get_loc(term,i), seen));
        }
        return term;
      }
      default: {
        return term;
      }
    }
  }
}
