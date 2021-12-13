export type MAP<T> = Record<string, T>;




// The LNK type is an union represented as a 64-bit BigInt.

// NIL 00 00 00 00 00 00 00 00
//
// DP0 02 CC CC CC PP PP PP PP
// DP1 03 CC CC CC PP PP PP PP
// VAR 04 00 00 00 PP PP PP PP
// ARG 05 00 00 00 PP PP PP PP
// ERA 06 00 00 00 ?? ?? ?? ??
// LAM 07 00 00 00 PP PP PP PP
// APP 08 00 00 00 PP PP PP PP
// PAR 09 00 00 00 PP PP PP PP
//
// CT0 20 FF FF FF PP PP PP PP
// CT1 21 FF FF FF PP PP PP PP
// CT2 22 FF FF FF PP PP PP PP
// CT3 23 FF FF FF PP PP PP PP
// CT4 24 FF FF FF PP PP PP PP
// CT5 25 FF FF FF PP PP PP PP
// CT6 26 FF FF FF PP PP PP PP
// CT7 27 FF FF FF PP PP PP PP
// CT8 28 FF FF FF PP PP PP PP
// CT9 29 FF FF FF PP PP PP PP
// CTA 2A FF FF FF PP PP PP PP
// CTB 2B FF FF FF PP PP PP PP
// CTC 2C FF FF FF PP PP PP PP
// CTD 2D FF FF FF PP PP PP PP
// CTE 2E FF FF FF PP PP PP PP
// CTF 2F FF FF FF PP PP PP PP
// CTG 30 FF FF FF PP PP PP PP
//
// FN0 40 FF FF FF PP PP PP PP
// FN1 41 FF FF FF PP PP PP PP
// FN2 42 FF FF FF PP PP PP PP
// FN3 43 FF FF FF PP PP PP PP
// FN4 44 FF FF FF PP PP PP PP
// FN5 45 FF FF FF PP PP PP PP
// FN6 46 FF FF FF PP PP PP PP
// FN7 47 FF FF FF PP PP PP PP
// FN8 48 FF FF FF PP PP PP PP
// FN9 49 FF FF FF PP PP PP PP
// FNA 4A FF FF FF PP PP PP PP
// FNB 4B FF FF FF PP PP PP PP
// FNC 4C FF FF FF PP PP PP PP
// FND 4D FF FF FF PP PP PP PP
// FNE 4E FF FF FF PP PP PP PP
// FNF 4F FF FF FF PP PP PP PP
// FNG 50 FF FF FF PP PP PP PP
//
// OP2 60 OO OO OO PP PP PP PP
//
// U32 F0 00 00 00 VV VV VV VV
// F32 F1 00 00 00 VV VV VV VV
// OUT FF 00 00 00 00 00 XX YY

// P = position
// C = color
// F = function
// O = operation
// V = value
// X = argument
// Y = field

export const VAL : bigint = 2n ** 0n;
export const EXT : bigint = 2n ** 32n;
export const TAG : bigint = 2n ** 56n;

export const NIL : bigint = 0x00n * TAG
export const DP0 : bigint = 0x02n * TAG
export const DP1 : bigint = 0x03n * TAG
export const VAR : bigint = 0x04n * TAG
export const ARG : bigint = 0x05n * TAG
export const ERA : bigint = 0x06n * TAG
export const LAM : bigint = 0x07n * TAG
export const APP : bigint = 0x08n * TAG
export const PAR : bigint = 0x09n * TAG
export const CT0 : bigint = 0x20n * TAG
export const CT1 : bigint = 0x21n * TAG
export const CT2 : bigint = 0x22n * TAG
export const CT3 : bigint = 0x23n * TAG
export const CT4 : bigint = 0x24n * TAG
export const CT5 : bigint = 0x25n * TAG
export const CT6 : bigint = 0x26n * TAG
export const CT7 : bigint = 0x27n * TAG
export const CT8 : bigint = 0x28n * TAG
export const CT9 : bigint = 0x29n * TAG
export const CTA : bigint = 0x2An * TAG
export const CTB : bigint = 0x2Bn * TAG
export const CTC : bigint = 0x2Cn * TAG
export const CTD : bigint = 0x2Dn * TAG
export const CTE : bigint = 0x2En * TAG
export const CTF : bigint = 0x2Fn * TAG
export const CTG : bigint = 0x30n * TAG
export const FN0 : bigint = 0x40n * TAG
export const FN1 : bigint = 0x41n * TAG
export const FN2 : bigint = 0x42n * TAG
export const FN3 : bigint = 0x43n * TAG
export const FN4 : bigint = 0x44n * TAG
export const FN5 : bigint = 0x45n * TAG
export const FN6 : bigint = 0x46n * TAG
export const FN7 : bigint = 0x47n * TAG
export const FN8 : bigint = 0x48n * TAG
export const FN9 : bigint = 0x49n * TAG
export const FNA : bigint = 0x4An * TAG
export const FNB : bigint = 0x4Bn * TAG
export const FNC : bigint = 0x4Cn * TAG
export const FND : bigint = 0x4Dn * TAG
export const FNE : bigint = 0x4En * TAG
export const FNF : bigint = 0x4Fn * TAG
export const FNG : bigint = 0x50n * TAG
export const OP2 : bigint = 0x60n * TAG
export const U32 : bigint = 0xF0n * TAG
export const F32 : bigint = 0xF1n * TAG
export const OUT : bigint = 0xFFn * TAG

export const ADD : bigint = 0x00n * EXT
export const SUB : bigint = 0x01n * EXT
export const MUL : bigint = 0x02n * EXT
export const DIV : bigint = 0x03n * EXT
export const MOD : bigint = 0x04n * EXT
export const AND : bigint = 0x05n * EXT
export const OR  : bigint = 0x06n * EXT
export const XOR : bigint = 0x07n * EXT
export const SHL : bigint = 0x08n * EXT
export const SHR : bigint = 0x09n * EXT
export const LTN : bigint = 0x10n * EXT
export const LTE : bigint = 0x11n * EXT
export const EQL : bigint = 0x12n * EXT
export const GTE : bigint = 0x13n * EXT
export const GTN : bigint = 0x14n * EXT
export const NEQ : bigint = 0x15n * EXT

//GENERATED_CONSTRUCTOR_IDS_START//
//GENERATED_CONSTRUCTOR_IDS//
//GENERATED_CONSTRUCTOR_IDS_END//

export type Lnk = bigint // U52 in JS, U64 in C

export type Arr = {size: number, data: BigUint64Array};
export type Mem = Arr;

export type Page = {
  match: Array<number>,
  rules: Array<{
    test: Array<Lnk>, 
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

export function array_alloc(capacity: number) {
  return {
    size: 0,
    data: new BigUint64Array(capacity),
  }
}

export function array_write(arr: Arr, idx: bigint, val: Lnk) {
  arr.data[Number(idx)] = val;
}

export function array_read(arr: Arr, idx: bigint) : bigint {
  return arr.data[Number(idx)];
}

export function array_push(arr: Arr, value: bigint) {
  array_write(arr, BigInt(arr.size++), value);
}

export function array_pop(arr: Arr) : bigint | null {
  if (arr.size > 0) {
    return array_read(arr, BigInt(--arr.size));
  } else {
    return null;
  }
}

// Memory
// ------

export var GAS : number = 0;

export function Var(pos: bigint) : Lnk {
  return VAR | pos;
}

export function Dp0(col: bigint, pos: bigint) : Lnk {
  return DP0 | col | pos;
}

export function Dp1(col: bigint, pos: bigint) : Lnk {
  return DP1 | col | pos;
}

export function Arg(pos: bigint) : Lnk {
  return ARG | pos;
}

export function Era() : Lnk {
  return ERA;
}

export function Lam(pos: bigint) : Lnk {
  return LAM | pos;
}

export function App(pos: bigint) : Lnk {
  return APP | pos;
}

export function Par(col: bigint, pos: bigint) : Lnk {
  return PAR | col | pos;
}

export function Op2(ope: bigint, pos: bigint) : Lnk {
  return OP2 | ope | pos;
}

export function U_32(val: bigint) : Lnk {
  return U32 | val;
}

export function Nil() : Lnk {
  return NIL;
}

export function Ctr(ari: number, fun: bigint, pos: bigint) : Lnk {
  return (CT0 + BigInt(ari) * TAG) | fun | pos;
}

export function Cal(ari: number, fun: bigint, pos: bigint) : Lnk {
  return (FN0 + BigInt(ari) * TAG) | fun | pos;
}

export function Out(arg: bigint, fld: bigint) : Lnk {
  return OUT + (arg << 8n) + fld;
}

export function get_tag(lnk: Lnk) : bigint {
  return lnk & 0xFF00000000000000n;
}

export function get_ext(lnk: Lnk) : bigint {
  return lnk & 0x00FFFFFF00000000n;
}

export function get_val(lnk: Lnk) : bigint {
  return lnk & 0x00000000FFFFFFFFn;
}

export function get_ari(lnk: Lnk) : number {
  if (lnk >= CT0 && lnk <= CTG) {
    return Number((get_tag(lnk) - CT0) / TAG);
  }
  if (lnk >= FN0 && lnk <= FNG) {
    return Number((get_tag(lnk) - FN0) / TAG);
  }
  return 0;
}

export function get_loc(lnk: Lnk, arg: number) : bigint {
  return get_val(lnk) + BigInt(arg);
}

export function ask_arg(mem: Mem, term: Lnk, arg: number) : Lnk {
  return array_read(mem, get_loc(term, arg));
}

export function ask_lnk(mem: Mem, loc: bigint) : Lnk {
  return array_read(mem, loc);
}

export function ask_gas() : number {
  return GAS;
}

export function link(mem: Mem, loc: bigint, lnk: Lnk) : Lnk {
  array_write(mem, loc, lnk);
  if (get_tag(lnk) <= VAR) {
    array_write(mem, get_loc(lnk, get_tag(lnk) === DP1 ? 1 : 0), Arg(loc));
  }
  return lnk;
}

export function alloc(mem: Mem, size: number) : bigint {
  if (size === 0) {
    return 0n;
  } else {
    var loc = mem.size;
    mem.size += size;
    return BigInt(loc);
  }
}

export function clear(mem: Mem, loc: bigint, size: number) {
  // TODO
}

// ~~~

export function init(capacity: number = 2 ** 28) {
  var mem = array_alloc(capacity);
  array_push(mem, 0n);
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
    case CT0: case CT1: case CT2: case CT3: case CT4: case CT5: case CT6: case CT7:
    case CT8: case CT9: case CTA: case CTB: case CTC: case CTD: case CTE: case CTF: case CTG:
    case FN0: case FN1: case FN2: case FN3: case FN4: case FN5: case FN6: case FN7:
    case FN8: case FN9: case FNA: case FNB: case FNC: case FND: case FNE: case FNF: case FNG: {
      var arity = get_ari(term);
      for (var i = 0; i < arity; ++i) {
        collect(mem, ask_arg(mem,term,i));
      }
      clear(mem, get_loc(term,0), arity);
      break;
    }
  }
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
export function app_lam(mem: Mem, host: bigint, term: Lnk, arg0: Lnk): Lnk {
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
function app_par(mem: Mem, host: bigint, term: Lnk, arg0: Lnk): Lnk {
  //console.log("[app-par] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var app0 = get_loc(term, 0);
  var app1 = get_loc(arg0, 0);
  var let0 = alloc(mem, 3);
  var par0 = alloc(mem, 2);
  link(mem, let0+2n, ask_arg(mem, term, 1));
  link(mem, app0+1n, Dp0(get_ext(arg0), let0));
  link(mem, app0+0n, ask_arg(mem, arg0, 0));
  link(mem, app1+0n, ask_arg(mem, arg0, 1));
  link(mem, app1+1n, Dp1(get_ext(arg0), let0));
  link(mem, par0+0n, App(app0));
  link(mem, par0+1n, App(app1));
  var done = Par(get_ext(arg0), par0);
  link(mem, host, done);
  return done;
}

// (+ a b)
// --------- OP2-U32
// add(a, b)
function op2_u32_u32(mem: Mem, host: bigint, term: Lnk, arg0: Lnk, arg1: Lnk): Lnk {
  //console.log("[op2-u32-u32] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var a = get_val(arg0);
  var b = get_val(arg1);
  var c = 0n;
  switch (get_ext(term)) {
    case ADD: c = (a +  b) & 0xFFFFFFFFn; break;
    case SUB: c = (a -  b) & 0xFFFFFFFFn; break;
    case MUL: c = (a *  b) & 0xFFFFFFFFn; break;
    case DIV: c = (a /  b) & 0xFFFFFFFFn; break;
    case MOD: c = (a %  b) & 0xFFFFFFFFn; break;
    case AND: c = (a &  b) & 0xFFFFFFFFn; break;
    case OR : c = (a |  b) & 0xFFFFFFFFn; break;
    case XOR: c = (a ^  b) & 0xFFFFFFFFn; break;
    case SHL: c = (a << b) & 0xFFFFFFFFn; break;
    case SHR: c = (a >> b) & 0xFFFFFFFFn; break;
    case LTN: c = (a <  b) ? 1n : 0n; break;
    case LTE: c = (a <= b) ? 1n : 0n; break;
    case EQL: c = (a == b) ? 1n : 0n; break;
    case GTE: c = (a >= b) ? 1n : 0n; break;
    case GTN: c = (a >  b) ? 1n : 0n; break;
    case NEQ: c = (a != b) ? 1n : 0n; break;
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
function op2_par_0(mem: Mem, host: bigint, term: Lnk, arg0: Lnk, arg1: Lnk): Lnk {
  //console.log("[op2-par-0] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var op20 = get_loc(term, 0);
  var op21 = get_loc(arg0, 0);
  var let0 = alloc(mem, 3);
  var par0 = alloc(mem, 2);
  link(mem, let0+2n, arg1);
  link(mem, op20+1n, Dp0(get_ext(arg0), let0));
  link(mem, op20+0n, ask_arg(mem, arg0, 0));
  link(mem, op21+0n, ask_arg(mem, arg0, 1));
  link(mem, op21+1n, Dp1(get_ext(arg0), let0));
  link(mem, par0+0n, Op2(get_ext(term), op20));
  link(mem, par0+1n, Op2(get_ext(term), op21));
  var done = Par(get_ext(arg0), par0);
  link(mem, host, done);
  return done;
}

// (+ a &A<b0 b1>)
// --------------- OP2-PAR-1
// !A<a0 a1> = a
// &A<(+ a0 a1) (+ b0 b1)>
function op2_par_1(mem: Mem, host: bigint, term: Lnk, arg0: Lnk, arg1: Lnk): Lnk {
  //console.log("[op2-par-1] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var op20 = get_loc(term, 0);
  var op21 = get_loc(arg1, 0);
  var let0 = alloc(mem, 3);
  var par0 = alloc(mem, 2);
  link(mem, let0+2n, arg0);
  link(mem, op20+1n, Dp0(get_ext(arg1), let0));
  link(mem, op20+0n, ask_arg(mem, arg1, 0));
  link(mem, op21+0n, ask_arg(mem, arg1, 1));
  link(mem, op21+1n, Dp1(get_ext(arg1), let0));
  link(mem, par0+0n, Op2(get_ext(term), op20));
  link(mem, par0+1n, Op2(get_ext(term), op21));
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
function let_lam(mem: Mem, host: bigint, term: Lnk, arg0: Lnk): Lnk {
  //console.log("[let-lam] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var let0 = get_loc(term, 0);
  var par0 = get_loc(arg0, 0);
  var lam0 = alloc(mem, 2);
  var lam1 = alloc(mem, 2);
  link(mem, let0+2n, ask_arg(mem, arg0, 1));
  link(mem, par0+1n, Var(lam1));
  var arg0_arg_0 = ask_arg(mem, arg0, 0);
  link(mem, par0+0n, Var(lam0));
  subst(mem, arg0_arg_0, Par(get_ext(term), par0));
  var term_arg_0 = ask_arg(mem,term,0);
  link(mem, lam0+1n, Dp0(get_ext(term), let0));
  subst(mem, term_arg_0, Lam(lam0));
  var term_arg_1 = ask_arg(mem,term,1);                      
  link(mem, lam1+1n, Dp1(get_ext(term), let0));
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
function let_par_eq(mem: Mem, host: bigint, term: Lnk, arg0: Lnk): Lnk {
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
function let_par_df(mem: Mem, host: bigint, term: Lnk, arg0: Lnk): Lnk {
  //console.log("[let-par-df] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var par0 = alloc(mem, 2);
  var let0 = get_loc(term,0);
  var par1 = get_loc(arg0,0);
  var let1 = alloc(mem, 3);
  link(mem, let0+2n, ask_arg(mem,arg0,0));
  link(mem, let1+2n, ask_arg(mem,arg0,1));
  var term_arg_0 = ask_arg(mem,term,0);
  var term_arg_1 = ask_arg(mem,term,1);
  link(mem, par1+0n, Dp1(get_ext(term),let0));
  link(mem, par1+1n, Dp1(get_ext(term),let1));
  link(mem, par0+0n, Dp0(get_ext(term),let0));
  link(mem, par0+1n, Dp0(get_ext(term),let1));
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
function let_u32(mem: Mem, host: bigint, term: Lnk, arg0: Lnk): Lnk {
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
function let_ctr(mem: Mem, host: bigint, term: Lnk, arg0: Lnk): Lnk {
  //console.log("[let-ctr] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  let func = get_ext(arg0);
  let arit = get_ari(arg0);
  if (arit === 0) {
    subst(mem, ask_arg(mem,term,0), Ctr(0, func, 0n));
    subst(mem, ask_arg(mem,term,1), Ctr(0, func, 0n));
    clear(mem, get_loc(term,0), 3);
    var done = link(mem, host, Ctr(0, func, 0n));
    return done;
  } else {
    let ctr0 = get_loc(arg0,0);
    let ctr1 = alloc(mem, arit);
    var term_arg_0 = ask_arg(mem,term,0);
    var term_arg_1 = ask_arg(mem,term,1);
    for (let i = 0; i < arit; ++i) {
      let leti = i === 0 ? get_loc(term,0) : alloc(mem, 3);
      var arg0_arg_i = ask_arg(mem, arg0, i);
      link(mem, ctr0+BigInt(i), Dp0(get_ext(term), leti));
      link(mem, ctr1+BigInt(i), Dp1(get_ext(term), leti));
      link(mem, leti+2n, arg0_arg_i);
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
  host: bigint,
  clrs: Array<number>,
  cols: Array<Lnk>,
  root: Lnk,
  body: Array<Lnk>,
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
      var arg = Number((lnk >> 8n) & 0xFFn);
      var fld = Number((lnk >> 0n) & 0xFFn);
      var out = fld === 0xFF ? args[arg] : ask_arg(mem, args[arg], fld);
      link(mem, aloc + BigInt(i), out);
    } else {
      array_write(mem, aloc + BigInt(i), lnk + (get_tag(lnk) < U32 ? aloc : 0n));
    }
  }
  //console.log("---", debug_show(mem,ask_lnk(mem,0),{}));
  if (get_tag(root) == OUT) {
    var root_arg = Number((root >> 8n) & 0xFFn);
    var root_fld = Number((root >> 0n) & 0xFFn);
    var root_lnk = root_fld === 0xFF ? args[root_arg] : ask_arg(mem, args[root_arg], root_fld);
    //console.log("-- root", root_arg, root_fld, root_fld === 0xFF, debug_show_lnk(root_lnk));
  } else {
    var root_lnk = root + (get_tag(root) < U32 ? aloc : 0n);
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

export function reduce(mem: Mem, host: bigint) : Lnk {
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
        if (get_tag(arg0) >= CT0 && get_tag(arg0) <= CTF) {
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
      case FN0: case FN1: case FN2: case FN3: case FN4: case FN5: case FN6: case FN7:
      case FN8: case FN9: case FNA: case FNB: case FNC: case FND: case FNE: case FNF: case FNG: {
        var fun = get_ext(term);
        //console.log("\ncall", fun/EXT);
        
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
        
        var page = BOOK[String(fun/EXT)];
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
        break;
      }
    }
    return term;
  }
}

function normal_go(mem: Mem, host: bigint, seen: MAP<boolean>) : Lnk {
  var term = ask_lnk(mem, host);
  if (seen[String(host)]) {
    return term;
  } else {
    term = reduce(mem, host);
    seen[String(host)] = true;
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
      case CT0: case CT1: case CT2: case CT3: case CT4: case CT5: case CT6: case CT7:
      case CT8: case CT9: case CTA: case CTB: case CTC: case CTD: case CTE: case CTF: case CTG:
      case FN0: case FN1: case FN2: case FN3: case FN4: case FN5: case FN6: case FN7:
      case FN8: case FN9: case FNA: case FNB: case FNC: case FND: case FNE: case FNF: case FNG: {
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

export function normal(mem: Mem, host: bigint) : number {
  GAS = 0;
  normal_go(mem, host, {});
  return GAS;
}
