export type MAP<T> = Record<string, T>;

// The LNK type is an union represented as a 64-bit BigInt.
// struct Lnk {
//   u64 tag: 4;
//   u64 ari: 4;
//   u64 ext: 24;
//   u64 pos: 32;
// }
// DP0 00 CC CC CC PP PP PP PP (c = col, p = pos)
// DP1 10 CC CC CC PP PP PP PP (c = col, p = pos)
// VAR 20 00 00 00 PP PP PP PP (p = pos)
// ARG 30 00 00 00 PP PP PP PP (p = pos) 
// ERA 40 00 00 00 00 00 00 00
// LAM 50 00 00 00 PP PP PP PP (p = pos)
// APP 60 00 00 00 PP PP PP PP (p = pos)
// PAR 70 00 00 00 PP PP PP PP (p = pos)
// CTR 8A FF FF FF PP PP PP PP (a = ari, f = fun, p = pos)
// CAL 9A FF FF FF PP PP PP PP (a = ari, f = fun, p = pos)
// OP2 A0 OO OO OO PP PP PP PP (o = ope, p = pos)
// U32 B0 00 00 00 VV VV VV VV (v = val)
// F32 C0 00 00 00 VV VV VV VV (v = val)
// U64 D0 00 00 00 PP PP PP PP (p = pos)
// F64 E0 00 00 00 PP PP PP PP (p = pos)

export const VAL : bigint = 2n ** 0n;
export const EXT : bigint = 2n ** 32n;
export const ARI : bigint = 2n ** 56n;
export const TAG : bigint = 2n ** 60n;

export const DP0 : bigint = 0x0n;
export const DP1 : bigint = 0x1n;
export const VAR : bigint = 0x2n;
export const ARG : bigint = 0x3n;
export const ERA : bigint = 0x4n;
export const LAM : bigint = 0x5n;
export const APP : bigint = 0x6n;
export const PAR : bigint = 0x7n;
export const CTR : bigint = 0x8n;
export const FUN : bigint = 0x9n;
export const OP2 : bigint = 0xAn;
export const U32 : bigint = 0xBn;
export const F32 : bigint = 0xCn;
export const OUT : bigint = 0xEn;
export const NIL : bigint = 0xFn;

export const ADD : bigint = 0x0n;
export const SUB : bigint = 0x1n;
export const MUL : bigint = 0x2n;
export const DIV : bigint = 0x3n;
export const MOD : bigint = 0x4n;
export const AND : bigint = 0x5n;
export const OR  : bigint = 0x6n;
export const XOR : bigint = 0x7n;
export const SHL : bigint = 0x8n;
export const SHR : bigint = 0x9n;
export const LTN : bigint = 0xAn;
export const LTE : bigint = 0xBn;
export const EQL : bigint = 0xCn;
export const GTE : bigint = 0xDn;
export const GTN : bigint = 0xEn;
export const NEQ : bigint = 0xFn;

//GENERATED_CONSTRUCTOR_IDS_START//
//GENERATED_CONSTRUCTOR_IDS//
//GENERATED_CONSTRUCTOR_IDS_END//

var DYNAMIC : number = 0;

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
  return (VAR * TAG) | pos;
}

export function Dp0(col: bigint, pos: bigint) : Lnk {
  return (DP0 * TAG) | (col * EXT) | pos;
}

export function Dp1(col: bigint, pos: bigint) : Lnk {
  return (DP1 * TAG) | (col * EXT) | pos;
}

export function Arg(pos: bigint) : Lnk {
  return (ARG * TAG) | pos;
}

export function Era() : Lnk {
  return (ERA * TAG);
}

export function Lam(pos: bigint) : Lnk {
  return (LAM * TAG) | pos;
}

export function App(pos: bigint) : Lnk {
  return (APP * TAG) | pos;
}

export function Par(col: bigint, pos: bigint) : Lnk {
  return (PAR * TAG) | (col * EXT) | pos;
}

export function Op2(ope: bigint, pos: bigint) : Lnk {
  return (OP2 * TAG) | (ope * EXT) | pos;
}

export function U_32(val: bigint) : Lnk {
  return (U32 * TAG) | val;
}

export function Nil() : Lnk {
  return (NIL * TAG);
}

export function Ctr(ari: number, fun: bigint, pos: bigint) : Lnk {
  return (CTR * TAG) + (BigInt(ari) * ARI) | (fun * EXT) | pos;
}

export function Cal(ari: number, fun: bigint, pos: bigint) : Lnk {
  return (FUN * TAG) + (BigInt(ari) * ARI) | (fun * EXT) | pos;
}

export function Out(arg: bigint, fld: bigint) : Lnk {
  return (OUT * TAG) + (arg << 8n) + fld;
}

export function get_tag(lnk: Lnk) : bigint {
  return (lnk / TAG);
}

export function get_ari(lnk: Lnk) : number {
  return Number((lnk / ARI) & 0xFn);
}

export function get_ext(lnk: Lnk) : bigint {
  return (lnk / EXT) & 0xFFFFFFn;
}

export function get_val(lnk: Lnk) : bigint {
  return lnk & 0xFFFFFFFFn;
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

export function init(capacity: number = 2 ** 29) {
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
    case CTR: case FUN: {
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
// &A<(+ a0 b0) (+ a1 b1)>
function op2_par_1(mem: Mem, host: bigint, term: Lnk, arg0: Lnk, arg1: Lnk): Lnk {
  //console.log("[op2-par-1] " + get_loc(term,0) + " " + get_loc(arg0,0));
  ++GAS;
  var op20 = get_loc(term, 0);
  var op21 = get_loc(arg1, 0);
  var let0 = alloc(mem, 3);
  var par0 = alloc(mem, 2);
  link(mem, let0+2n, arg0);
  link(mem, op20+0n, Dp0(get_ext(arg1), let0));
  link(mem, op20+1n, ask_arg(mem, arg1, 0));
  link(mem, op21+1n, ask_arg(mem, arg1, 1));
  link(mem, op21+0n, Dp1(get_ext(arg1), let0));
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

// (F &A<a0 a1> b c ...)
// --------------- CAL-PAR
// !A<b0 b1> = b
// !A<c0 c1> = c
// ...
// &A<(F a0 b0 c0 ...) (F a1 b1 c1 ...)>
function cal_par(mem: Mem, host: bigint, term: Lnk, argn: Lnk, n: number): Lnk {
  ++GAS;
  let arit = get_ari(term);
  let func = get_ext(term);
  let fun0 = get_loc(term, 0);
  let fun1 = alloc(mem, arit);
  let par0 = get_loc(argn, 0);
  for (var i = 0; i < arit; ++i) {
    if (i !== n) {
      let leti = alloc(mem, 3);
      let argi = ask_arg(mem, term, i);
      link(mem, fun0+BigInt(i), Dp0(get_ext(argn), leti));
      link(mem, fun1+BigInt(i), Dp1(get_ext(argn), leti));
      link(mem, leti+2n, argi);
    } else {
      link(mem, fun0+BigInt(i), ask_arg(mem, argn, 0));
      link(mem, fun1+BigInt(i), ask_arg(mem, argn, 1));
    }
  }
  link(mem, par0+0n, Cal(arit, func, fun0));
  link(mem, par0+1n, Cal(arit, func, fun1));
  let done = Par(get_ext(argn), par0);
  link(mem, host, done);
  return done;
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
    //console.log("reduce " + D.debug_show_lnk(term));
    //console.log("reduce");
    //console.log("- main: " + debug_show(mem,ask_lnk(mem,0n),{}));
    //console.log("- term: " + D.debug_show(mem,ask_lnk(mem,host),{}));
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
          return let_u32(mem, host, term, arg0);
        }
        if (get_tag(arg0) === CTR) {
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
      case FUN: {
        var fun = get_ext(term);
        var ari = get_ari(term);
        //console.log("\ncall", fun/EXT);

        // Static rules
        // ------------
        
        if (!DYNAMIC) {
          switch (fun)
          //GENERATED_REWRITE_RULES_START//
          {
//GENERATED_REWRITE_RULES//
          }
          //GENERATED_REWRITE_RULES_END//
        }
        
        // Dynamic rules
        // -------------
        
        if (DYNAMIC) {
          var page = BOOK[String(fun)];
          if (page) {
            //console.log("- got entry...");
            var args = [];
            for (var i = 0; i < page.match.length; ++i) {
              if (page.match[i] > 0) {
                args[i] = reduce(mem, get_loc(term, i));
                if (get_tag(args[i]) === PAR) {
                  return cal_par(mem, host, term, args[i], i);
                }
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
                if (get_tag(value) === CTR && !(get_tag(args[j]) === CTR && get_ext(args[j]) === get_ext(value))) {
                  //console.log("-- fail (ctr doesn't match)", get_tag(args[j])/TAG);
                  continue try_rule;
                }
                if (get_tag(value) === U32 && !(get_tag(args[j]) === U32 && get_val(args[j]) === get_val(value))) {
                  //console.log("-- fail (num doesn't match)");
                  continue try_rule;
                }
                //console.log("-- okay");
              }
              //console.log("- matched", rule);
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

function normal_go(mem: Mem, host: bigint, seen: MAP<boolean>) : Lnk {
  //console.log("normal");
  //console.log("- main: " + D.debug_show(mem,ask_lnk(mem,0n),{}));
  //console.log("- term: " + D.debug_show(mem,ask_lnk(mem,host),{}));
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
      case CTR: case FUN: {
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
  //GENERATED_DYNAMIC_FLAG//
  GAS = 0;
  normal_go(mem, host, {});
  return GAS;
}

// Uncomment to test without Deno FFI
//int main() {
  //Mem mem;
  //mem.size = 1;
  //mem.data = (u64*)malloc(2 * 134217728 * sizeof(u64)); // 2gb
  //mem.data[0] = Cal(0, $MAIN, 0);
  //printf("Reducing...\n");
  //normal_ffi((u8*)mem.data, mem.size, 0);
  //printf("Done!\n");
  //free(&mem.data);
  //printf("rwt: %d\n", get_gas());
//}
//

// Debug
// -----

export function debug_show_lnk(x: Lnk): String {
  var tag = get_tag(x);
  var ext = (get_ext(x)).toString(16);
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
      case CTR: return "CTR";
      case FUN: return "FUN";
      case OP2: return "OP2";
      case U32: return "U32";
      case F32: return "F32";
      case OUT: return "OUT";
      case NIL: return "NIL";
      default: return (tag).toString(16);
    }
  })();
  return ini+":"+ext+":"+val;
}

export function debug_show(mem: Mem, term: Lnk, table: {[str:string]:string}) : string {
  var lets : {[key:string]:bigint} = {};
  var kinds : {[key:string]:bigint} = {};
  var names : {[key:string]:string} = {};
  var count = 0;
  function find_lets(term: Lnk) {
    switch (get_tag(term)) {
      case LAM: {
        names[String(get_loc(term,0))] = String(++count);
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
        if (!lets[String(get_loc(term,0))]) {
          names[String(get_loc(term,0))] = String(++count);
          kinds[String(get_loc(term,0))] = get_ext(term);
          lets[String(get_loc(term,0))] = get_loc(term,0);
          find_lets(ask_arg(mem, term, 2));
        }
        break;
      }
      case DP1: {
        if (!lets[String(get_loc(term,0))]) {
          names[String(get_loc(term,0))] = String(++count);
          kinds[String(get_loc(term,0))] = get_ext(term);
          lets[String(get_loc(term,0))] = get_loc(term,0);
          find_lets(ask_arg(mem, term, 2));
        }
        break;
      }
      case OP2: {
        find_lets(ask_arg(mem, term, 0));
        find_lets(ask_arg(mem, term, 1));
        break;
      }
      case CTR: case FUN: {
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
        return "a" + (names[String(get_loc(term,0))] || "?");
      }
      case DP1: {
        return "b" + (names[String(get_loc(term,0))] || "?");
      }
      case VAR: {
        return "x" + (names[String(get_loc(term,0))] || "?");
      }
      case LAM: {
        var name = "x" + (names[String(get_loc(term,0))] || "?");
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
        return "&" + (kind) + "<" + func + " " + argm + ">";
      }
      case OP2: {
        let oper = get_ext(term);
        let val0 = go(ask_arg(mem, term, 0));
        let val1 = go(ask_arg(mem, term, 1));
        var symb = "?";
        switch (oper) {
          case 0x00n: symb = "+"; break;
          case 0x01n: symb = "-"; break;
          case 0x02n: symb = "*"; break;
          case 0x03n: symb = "/"; break;
          case 0x04n: symb = "%"; break;
          case 0x05n: symb = "&"; break;
          case 0x06n: symb = "|"; break;
          case 0x07n: symb = "^"; break;
          case 0x08n: symb = "<<"; break;
          case 0x09n: symb = ">>"; break;
          case 0x10n: symb = "<"; break;
          case 0x11n: symb = "<="; break;
          case 0x12n: symb = "="; break;
          case 0x13n: symb = ">="; break;
          case 0x14n: symb = ">"; break;
          case 0x15n: symb = "!="; break;
        }
        return "(" + symb + " " + val0 + " " + val1 + ")";
      }
      case U32: {
        return "" + get_val(term);
      }
      case CTR: case FUN: {
        let func = get_ext(term);
        let arit = get_ari(term);
        let args = [];
        for (let i = 0; i < arit; ++i) {
          args.push(go(ask_arg(mem, term, i)));
        }
        if (table && table[String(func)]) {
          return "(" + (table[String(func)]||"?") + args.map(x => " " + x).join("") + ")";
        } else {
          var c = get_tag(term) < FUN ? "C" : "F";
          return "(" + c + (func) + args.map(x => " " + x).join("") + ")";
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
    var name = names[String(pos)] || "?";
    var nam0 = ask_lnk(mem, pos+0n) === Era() ? "*" : "a"+name;
    var nam1 = ask_lnk(mem, pos+1n) === Era() ? "*" : "b"+name;
    text += " !" + kind + "<"+nam0+" "+nam1+"> = " + go(ask_lnk(mem, pos + 2n)) + ";";
  }
  //text += go(term);
  return text;
}
