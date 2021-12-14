#include <stdlib.h>
#include <stdio.h>
#include <pthread.h>
#include <string.h>

// Types
// -----

typedef unsigned char u8;
typedef unsigned int u32;
typedef unsigned long long int u64;

const u64 VAL = 1;
const u64 EXT = 0x100000000; 
const u64 TAG = 0x100000000000000;

const u64 NIL = 0x00 * TAG;
const u64 DP0 = 0x02 * TAG;
const u64 DP1 = 0x03 * TAG;
const u64 VAR = 0x04 * TAG;
const u64 ARG = 0x05 * TAG;
const u64 ERA = 0x06 * TAG;
const u64 LAM = 0x07 * TAG;
const u64 APP = 0x08 * TAG;
const u64 PAR = 0x09 * TAG;
const u64 CT0 = 0x20 * TAG;
const u64 CT1 = 0x21 * TAG;
const u64 CT2 = 0x22 * TAG;
const u64 CT3 = 0x23 * TAG;
const u64 CT4 = 0x24 * TAG;
const u64 CT5 = 0x25 * TAG;
const u64 CT6 = 0x26 * TAG;
const u64 CT7 = 0x27 * TAG;
const u64 CT8 = 0x28 * TAG;
const u64 CT9 = 0x29 * TAG;
const u64 CTA = 0x2A * TAG;
const u64 CTB = 0x2B * TAG;
const u64 CTC = 0x2C * TAG;
const u64 CTD = 0x2D * TAG;
const u64 CTE = 0x2E * TAG;
const u64 CTF = 0x2F * TAG;
const u64 CTG = 0x30 * TAG;
const u64 FN0 = 0x40 * TAG;
const u64 FN1 = 0x41 * TAG;
const u64 FN2 = 0x42 * TAG;
const u64 FN3 = 0x43 * TAG;
const u64 FN4 = 0x44 * TAG;
const u64 FN5 = 0x45 * TAG;
const u64 FN6 = 0x46 * TAG;
const u64 FN7 = 0x47 * TAG;
const u64 FN8 = 0x48 * TAG;
const u64 FN9 = 0x49 * TAG;
const u64 FNA = 0x4A * TAG;
const u64 FNB = 0x4B * TAG;
const u64 FNC = 0x4C * TAG;
const u64 FND = 0x4D * TAG;
const u64 FNE = 0x4E * TAG;
const u64 FNF = 0x4F * TAG;
const u64 FNG = 0x50 * TAG;
const u64 OP2 = 0x60 * TAG;
const u64 U32 = 0xF0 * TAG;
const u64 F32 = 0xF1 * TAG;
const u64 OUT = 0xFF * TAG;

const u64 ADD = 0x00 * EXT;
const u64 SUB = 0x01 * EXT;
const u64 MUL = 0x02 * EXT;
const u64 DIV = 0x03 * EXT;
const u64 MOD = 0x04 * EXT;
const u64 AND = 0x05 * EXT;
const u64 OR  = 0x06 * EXT;
const u64 XOR = 0x07 * EXT;
const u64 SHL = 0x08 * EXT;
const u64 SHR = 0x09 * EXT;
const u64 LTN = 0x10 * EXT;
const u64 LTE = 0x11 * EXT;
const u64 EQL = 0x12 * EXT;
const u64 GTE = 0x13 * EXT;
const u64 GTN = 0x14 * EXT;
const u64 NEQ = 0x15 * EXT;

//GENERATED_CONSTRUCTOR_IDS_START//
//GENERATED_CONSTRUCTOR_IDS//
//GENERATED_CONSTRUCTOR_IDS_END//

typedef u64 Lnk;

typedef struct {
  u64 size;
  u64* data;
} Arr;

typedef Arr Mem;

typedef struct {
  Arr test;
  Arr clrs;
  Arr cols;
  Lnk root;
  Arr body;
} Rule;

typedef struct {
  u64 valid;
  Arr match;
  u64 count;
  Rule* rules;
} Page;

typedef Page** Book;

typedef struct {
  pthread_t thread;
  Mem* mem;
  u64 gas;
  u64 host;
} Worker;

const u64 BOOK_SIZE = 65536;
Page BOOK[BOOK_SIZE];

// Workers
// -------

const u64 MAX_WORKERS = 8;
u64 CAN_SPAWN_WORKERS = 1;
Worker workers[MAX_WORKERS];

// Array
// -----

void array_write(Arr* arr, u64 idx, u64 value) {
  arr->data[idx] = value;
}

u64 array_read(Arr* arr, u64 idx) {
  return arr->data[idx];
}

void array_push(Arr* arr, u64 value) {
  array_write(arr, arr->size++, value);
}

u64 array_pop(Arr* arr) {
  if (arr->size > 0) {
    return array_read(arr, --arr->size);
  } else {
    return -1;
  }
}

// Memory
// ------

u32 get_gas() {
  u32 total = 0;
  for (u64 t = 0; t < MAX_WORKERS; ++t) {
    total += workers[t].gas;
  }
  return total;
}

void inc_gas(u64 tid) {
  workers[tid].gas++;
}

Lnk Var(u64 pos) {
  return VAR | pos;
}

Lnk Dp0(u64 col, u64 pos) {
  return DP0 | col | pos;
}

Lnk Dp1(u64 col, u64 pos) {
  return DP1 | col | pos;
}

Lnk Arg(u64 pos) {
  return ARG | pos;
}

Lnk Era() {
  return ERA;
}

Lnk Lam(u64 pos) {
  return LAM | pos;
}

Lnk App(u64 pos) {
  return APP | pos;
}

Lnk Par(u64 col, u64 pos) {
  return PAR | col | pos;
}

Lnk Op2(u64 ope, u64 pos) {
  return OP2 | ope | pos;
}

Lnk U_32(u64 val) {
  return U32 | val;
}

Lnk Nil() {
  return NIL;
}

Lnk Ctr(u64 ari, u64 fun, u64 pos) {
  return (CT0 + ari * TAG) | fun | pos;
}

Lnk Cal(u64 ari, u64 fun, u64 pos) { 
  return (FN0 + ari * TAG) | fun | pos;
}

Lnk Out(u64 arg, u64 fld) {
  return OUT | (arg << 8) | fld;
}

u64 get_tag(Lnk lnk) {
  return lnk & 0xFF00000000000000;
}

u64 get_ext(Lnk lnk) {
  return lnk & 0x00FFFFFF00000000;
}

u64 get_val(Lnk lnk) {
  return lnk & 0x00000000FFFFFFFF;
}

u64 get_ari(Lnk lnk) {
  if (lnk >= CT0 && lnk <= CTG) {
    return (get_tag(lnk) - CT0) / TAG;
  }
  if (lnk >= FN0 && lnk <= FNG) {
    return (get_tag(lnk) - FN0) / TAG;
  }
  return 0;
}

u64 get_loc(Lnk lnk, u64 arg) {
  return get_val(lnk) + arg;
}

Lnk ask_arg(Mem* mem, Lnk term, u64 arg) {
  return array_read(mem, get_loc(term, arg));
}

Lnk ask_lnk(Mem* mem, u64 loc) {
  return array_read(mem, loc);
}

u64 link(Mem* mem, u64 loc, Lnk lnk) {
  array_write(mem, loc, lnk);
  if (get_tag(lnk) <= VAR) {
    array_write(mem, get_loc(lnk, get_tag(lnk) == DP1 ? 1 : 0), Arg(loc));
  }
  return lnk;
}

u64 alloc(Mem* mem, u64 size) {
  if (size == 0) {
    return 0;
  } else {
    return __atomic_fetch_add(&mem->size, size, __ATOMIC_RELAXED);
  }
}

void clear(Mem* mem, u64 loc, u64 size) {
  // TODO
}

// Debug
// -----

void debug_print_lnk(Lnk x) {
  u64 tag = get_tag(x);
  u64 ext = get_ext(x) / EXT;
  u64 val = get_val(x);
  switch (tag) {
    case DP0: printf("DP0"); break;
    case DP1: printf("DP1"); break;
    case VAR: printf("VAR"); break;
    case ARG: printf("ARG"); break;
    case ERA: printf("ERA"); break;
    case LAM: printf("LAM"); break;
    case APP: printf("APP"); break;
    case PAR: printf("PAR"); break;
    case CT0: printf("CT0"); break;
    case CT1: printf("CT1"); break;
    case CT2: printf("CT2"); break;
    case CT3: printf("CT3"); break;
    case CT4: printf("CT4"); break;
    case CT5: printf("CT5"); break;
    case CT6: printf("CT6"); break;
    case CT7: printf("CT7"); break;
    case CT8: printf("CT8"); break;
    case CT9: printf("CT9"); break;
    case CTA: printf("CTA"); break;
    case CTB: printf("CTB"); break;
    case CTC: printf("CTC"); break;
    case CTD: printf("CTD"); break;
    case CTE: printf("CTE"); break;
    case CTF: printf("CTF"); break;
    case CTG: printf("CTG"); break;
    case FN0: printf("FN0"); break;
    case FN1: printf("FN1"); break;
    case FN2: printf("FN2"); break;
    case FN3: printf("FN3"); break;
    case FN4: printf("FN4"); break;
    case FN5: printf("FN5"); break;
    case FN6: printf("FN6"); break;
    case FN7: printf("FN7"); break;
    case FN8: printf("FN8"); break;
    case FN9: printf("FN9"); break;
    case FNA: printf("FNA"); break;
    case FNB: printf("FNB"); break;
    case FNC: printf("FNC"); break;
    case FND: printf("FND"); break;
    case FNE: printf("FNE"); break;
    case FNF: printf("FNF"); break;
    case FNG: printf("FNG"); break;
    case OP2: printf("OP2"); break;
    case U32: printf("U32"); break;
    case F32: printf("F32"); break;
    case OUT: printf("OUT"); break;
    case NIL: printf("NIL"); break;
    default : printf("???"); break;
  }
  printf(":%llx:%llx", ext, val);
}

// Garbage Collection
// ------------------

//Lnk reduce(u64 tid, Mem* mem, u64 host);

void collect(Mem* mem, Lnk term) {
  return;
  switch (get_tag(term)) {
    case DP0: {
      link(mem, get_loc(term,0), Era());
      //reduce(mem, get_loc(ask_arg(mem,term,1),0));
      break;
    }
    case DP1: {
      link(mem, get_loc(term,1), Era());
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
      u64 arity = get_ari(term);
      for (u64 i = 0; i < arity; ++i) {
        collect(mem, ask_arg(mem,term,i));
      }
      clear(mem, get_loc(term,0), arity);
      break;
    }
  }
}

// Reduction
// ---------

void subst(Mem* mem, Lnk lnk, Lnk val) {
  if (get_tag(lnk) != ERA) {
    link(mem, get_loc(lnk,0), val);
  } else {
    collect(mem, val);
  }
}

Lnk app_lam(u64 tid, Mem* mem, u64 host, Lnk term, Lnk arg0) {
  inc_gas(tid);
  subst(mem, ask_arg(mem, arg0, 0), ask_arg(mem, term, 1));
  u64 done = link(mem, host, ask_arg(mem, arg0, 1));
  clear(mem, get_loc(term,0), 2);
  clear(mem, get_loc(arg0,0), 2);
  return done;
}

Lnk app_par(u64 tid, Mem* mem, u64 host, Lnk term, Lnk arg0) {
  inc_gas(tid);
  u64 app0 = get_loc(term, 0);
  u64 app1 = get_loc(arg0, 0);
  u64 let0 = alloc(mem, 3);
  u64 par0 = alloc(mem, 2);
  link(mem, let0+2, ask_arg(mem, term, 1));
  link(mem, app0+1, Dp0(get_ext(arg0), let0));
  link(mem, app0+0, ask_arg(mem, arg0, 0));
  link(mem, app1+0, ask_arg(mem, arg0, 1));
  link(mem, app1+1, Dp1(get_ext(arg0), let0));
  link(mem, par0+0, App(app0));
  link(mem, par0+1, App(app1));
  u64 done = Par(get_ext(arg0), par0);
  link(mem, host, done);
  return done;
}

Lnk op2_u32_u32(u64 tid, Mem* mem, u64 host, Lnk term, Lnk arg0, Lnk arg1) {
  inc_gas(tid);
  u64 a = get_val(arg0);
  u64 b = get_val(arg1);
  u64 c = 0;
  switch (get_ext(term)) {
    case ADD: c = (a +  b) & 0xFFFFFFFF; break;
    case SUB: c = (a -  b) & 0xFFFFFFFF; break;
    case MUL: c = (a *  b) & 0xFFFFFFFF; break;
    case DIV: c = (a /  b) & 0xFFFFFFFF; break;
    case MOD: c = (a %  b) & 0xFFFFFFFF; break;
    case AND: c = (a &  b) & 0xFFFFFFFF; break;
    case OR : c = (a |  b) & 0xFFFFFFFF; break;
    case XOR: c = (a ^  b) & 0xFFFFFFFF; break;
    case SHL: c = (a << b) & 0xFFFFFFFF; break;
    case SHR: c = (a >> b) & 0xFFFFFFFF; break;
    case LTN: c = (a <  b) ? 1 : 0;      break;
    case LTE: c = (a <= b) ? 1 : 0;      break;
    case EQL: c = (a == b) ? 1 : 0;      break;
    case GTE: c = (a >= b) ? 1 : 0;      break;
    case GTN: c = (a >  b) ? 1 : 0;      break;
    case NEQ: c = (a != b) ? 1 : 0;      break;
  }
  u64 done = U_32(c);
  clear(mem, get_loc(term,0), 2);
  link(mem, host, done);
  return done;
}

Lnk op2_par_0(u64 tid, Mem* mem, u64 host, Lnk term, Lnk arg0, Lnk arg1) {
  inc_gas(tid);
  u64 op20 = get_loc(term, 0);
  u64 op21 = get_loc(arg0, 0);
  u64 let0 = alloc(mem, 3);
  u64 par0 = alloc(mem, 2);
  link(mem, let0+2, arg1);
  link(mem, op20+1, Dp0(get_ext(arg0), let0));
  link(mem, op20+0, ask_arg(mem, arg0, 0));
  link(mem, op21+0, ask_arg(mem, arg0, 1));
  link(mem, op21+1, Dp1(get_ext(arg0), let0));
  link(mem, par0+0, Op2(get_ext(term), op20));
  link(mem, par0+1, Op2(get_ext(term), op21));
  u64 done = Par(get_ext(arg0), par0);
  link(mem, host, done);
  return done;
}

Lnk op2_par_1(u64 tid, Mem* mem, u64 host, Lnk term, Lnk arg0, Lnk arg1) {
  inc_gas(tid);
  u64 op20 = get_loc(term, 0);
  u64 op21 = get_loc(arg1, 0);
  u64 let0 = alloc(mem, 3);
  u64 par0 = alloc(mem, 2);
  link(mem, let0+2, arg0);
  link(mem, op20+0, Dp0(get_ext(arg1), let0));
  link(mem, op20+1, ask_arg(mem, arg1, 0));
  link(mem, op21+1, ask_arg(mem, arg1, 1));
  link(mem, op21+0, Dp1(get_ext(arg1), let0));
  link(mem, par0+0, Op2(get_ext(term), op20));
  link(mem, par0+1, Op2(get_ext(term), op21));
  u64 done = Par(get_ext(arg1), par0);
  link(mem, host, done);
  return done;
}

Lnk let_lam(u64 tid, Mem* mem, u64 host, Lnk term, Lnk arg0) {
  inc_gas(tid);
  u64 let0 = get_loc(term, 0);
  u64 par0 = get_loc(arg0, 0);
  u64 lam0 = alloc(mem, 2);
  u64 lam1 = alloc(mem, 2);
  link(mem, let0+2, ask_arg(mem, arg0, 1));
  link(mem, par0+1, Var(lam1));
  u64 arg0_arg_0 = ask_arg(mem, arg0, 0);
  link(mem, par0+0, Var(lam0));
  subst(mem, arg0_arg_0, Par(get_ext(term), par0));
  u64 term_arg_0 = ask_arg(mem,term,0);
  link(mem, lam0+1, Dp0(get_ext(term), let0));
  subst(mem, term_arg_0, Lam(lam0));
  u64 term_arg_1 = ask_arg(mem,term,1);                      
  link(mem, lam1+1, Dp1(get_ext(term), let0));
  subst(mem, term_arg_1, Lam(lam1));
  u64 done = Lam(get_tag(term) == DP0 ? lam0 : lam1);
  link(mem, host, done);
  return done;
}

Lnk let_par_eq(u64 tid, Mem* mem, u64 host, Lnk term, Lnk arg0) {
  inc_gas(tid);
  subst(mem, ask_arg(mem,term,0), ask_arg(mem,arg0,0));
  subst(mem, ask_arg(mem,term,1), ask_arg(mem,arg0,1));
  u64 done = link(mem, host, ask_arg(mem, arg0, get_tag(term) == DP0 ? 0 : 1));
  clear(mem, get_loc(term,0), 3);
  clear(mem, get_loc(arg0,0), 2);
  return done;
}

Lnk let_par_df(u64 tid, Mem* mem, u64 host, Lnk term, Lnk arg0) {
  inc_gas(tid);
  u64 par0 = alloc(mem, 2);
  u64 let0 = get_loc(term,0);
  u64 par1 = get_loc(arg0,0);
  u64 let1 = alloc(mem, 3);
  link(mem, let0+2, ask_arg(mem,arg0,0));
  link(mem, let1+2, ask_arg(mem,arg0,1));
  u64 term_arg_0 = ask_arg(mem,term,0);
  u64 term_arg_1 = ask_arg(mem,term,1);
  link(mem, par1+0, Dp1(get_ext(term),let0));
  link(mem, par1+1, Dp1(get_ext(term),let1));
  link(mem, par0+0, Dp0(get_ext(term),let0));
  link(mem, par0+1, Dp0(get_ext(term),let1));
  subst(mem, term_arg_0, Par(get_ext(arg0),par0));
  subst(mem, term_arg_1, Par(get_ext(arg0),par1));
  u64 done = Par(get_ext(arg0), get_tag(term) == DP0 ? par0 : par1);
  link(mem, host, done);
  return done;
}

Lnk let_u32(u64 tid, Mem* mem, u64 host, Lnk term, Lnk arg0) {
  inc_gas(tid);
  subst(mem, ask_arg(mem,term,0), arg0);
  subst(mem, ask_arg(mem,term,1), arg0);
  u64 done = arg0;
  link(mem, host, arg0);
  return done;
}

Lnk let_ctr(u64 tid, Mem* mem, u64 host, Lnk term, Lnk arg0) {
  inc_gas(tid);
  u64 func = get_ext(arg0);
  u64 arit = get_ari(arg0);
  if (arit == 0) {
    subst(mem, ask_arg(mem,term,0), Ctr(0, func, 0));
    subst(mem, ask_arg(mem,term,1), Ctr(0, func, 0));
    clear(mem, get_loc(term,0), 3);
    u64 done = link(mem, host, Ctr(0, func, 0));
    return done;
  } else {
    u64 ctr0 = get_loc(arg0,0);
    u64 ctr1 = alloc(mem, arit);
    u64 term_arg_0 = ask_arg(mem,term,0);
    u64 term_arg_1 = ask_arg(mem,term,1);
    for (u64 i = 0; i < arit; ++i) {
      u64 leti = i == 0 ? get_loc(term,0) : alloc(mem, 3);
      u64 arg0_arg_i = ask_arg(mem, arg0, i);
      link(mem, ctr0+i, Dp0(get_ext(term), leti));
      link(mem, ctr1+i, Dp1(get_ext(term), leti));
      link(mem, leti+2, arg0_arg_i);
    }
    subst(mem, term_arg_0, Ctr(arit, func, ctr0));
    subst(mem, term_arg_1, Ctr(arit, func, ctr1));
    u64 done = Ctr(arit, func, get_tag(term) == DP0 ? ctr0 : ctr1);
    link(mem, host, done);
    return done;
  }
}

Lnk cal_par(u64 tid, Mem* mem, u64 host, Lnk term, Lnk argn, u64 n) {
  inc_gas(tid);
  u64 arit = get_ari(term);
  u64 func = get_ext(term);
  u64 fun0 = get_loc(term, 0);
  u64 fun1 = alloc(mem, arit);
  u64 par0 = get_loc(argn, 0);
  for (u64 i = 0; i < arit; ++i) {
    if (i != n) {
      u64 leti = alloc(mem, 3);
      u64 argi = ask_arg(mem, term, i);
      link(mem, fun0+i, Dp0(get_ext(argn), leti));
      link(mem, fun1+i, Dp1(get_ext(argn), leti));
      link(mem, leti+2, argi);
    } else {
      link(mem, fun0+i, ask_arg(mem, argn, 0));
      link(mem, fun1+i, ask_arg(mem, argn, 1));
    }
  }
  link(mem, par0+0, Cal(arit, func, fun0));
  link(mem, par0+1, Cal(arit, func, fun1));
  u64 done = Par(get_ext(argn), par0);
  link(mem, host, done);
  return done;
}

Lnk cal_ctrs(
  u64 tid,
  Mem* mem,
  u64 host,
  Arr clrs,
  Arr cols,
  u64 root,
  Arr body,
  Lnk term,
  Arr args
) {
  inc_gas(tid);
  u64* data = mem->data;
  u64 size = body.size;
  u64 aloc = alloc(mem, size);
  //printf("- cal_ctrs | size: %llu | aloc: %llu\n", size, aloc);
  //printf("-- R: ");
  //debug_print_lnk(root);
  //printf("\n");
  for (u64 i = 0; i < size; ++i) {
    u64 lnk = body.data[i];
    //printf("-- %llx: ", i); //debug_print_lnk(lnk); //printf("\n");
    if (get_tag(lnk) == OUT) {
      u64 arg = (lnk >> 8) & 0xFF;
      u64 fld = (lnk >> 0) & 0xFF;
      u64 out = fld == 0xFF ? args.data[arg] : ask_arg(mem, args.data[arg], fld);
      link(mem, aloc + i, out);
    } else {
      array_write(mem, aloc + i, lnk + (get_tag(lnk) < U32 ? aloc : 0));
    }
  }
  u64 root_lnk;
  if (get_tag(root) == OUT) {
    u64 root_arg = (root >> 8) & 0xFF;
    u64 root_fld = (root >> 0) & 0xFF;
    root_lnk = root_fld == 0xFF ? args.data[root_arg] : ask_arg(mem, args.data[root_arg], root_fld);
    //printf("-- carai %llu %llu\n", root, OUT);
  } else {
    root_lnk = root + (get_tag(root) < U32 ? aloc : 0);
  }
  u64 done = root_lnk;
  link(mem, host, done);
  clear(mem, get_loc(term, 0), args.size);
  for (u64 i = 0; i < clrs.size; ++i) {
    u64 clr = clrs.data[i];
    if (clr > 0) {
      clear(mem, get_loc(args.data[i],0), clr);
    }
  }
  for (u64 i = 0; i < cols.size; ++i) {
    collect(mem, cols.data[i]);
  }
  return done;
}

Lnk reduce(u64 tid, Mem* mem, u64 host) {
  while (1) {
    u64 term = ask_lnk(mem, host);
    //printf("reduce %llu:%llu:%llu", get_tag(term)/TAG, get_ext(term)/EXT, get_val(term));
    switch (get_tag(term)) {
      case APP: {
        u64 arg0 = reduce(tid, mem, get_loc(term,0));
        switch (get_tag(arg0)) {
          case LAM: {
            app_lam(tid, mem, host, term, arg0);
            continue;
          }
          case PAR: {
            return app_par(tid, mem, host, term, arg0);
          }
        }
        break;
      }
      case DP0:
      case DP1: {
        u64 arg0 = reduce(tid, mem, get_loc(term,2));
        switch (get_tag(arg0)) {
          case LAM: {
            let_lam(tid, mem, host, term, arg0);
            continue;
          }
          case PAR: {
            if (get_ext(term) == get_ext(arg0)) {
              let_par_eq(tid, mem, host, term, arg0);
              continue;
            } else {
              return let_par_df(tid, mem, host, term, arg0);
            }
          }
        }
        if (get_tag(arg0) == U32) {
          let_u32(tid, mem, host, term, arg0);
          continue;
        }
        if (get_tag(arg0) >= CT0 && get_tag(arg0) <= CTF) {
          return let_ctr(tid, mem, host, term, arg0);
        }
        break;
      }
      case OP2: {
        u64 arg0 = reduce(tid, mem, get_loc(term,0));
        u64 arg1 = reduce(tid, mem, get_loc(term,1));
        if (get_tag(arg0) == U32 && get_tag(arg1) == U32) {
          return op2_u32_u32(tid, mem, host, term, arg0, arg1);
        }
        if (get_tag(arg0) == PAR) {
          return op2_par_0(tid, mem, host, term, arg0, arg1);
        }
        if (get_tag(arg1) == PAR) {
          return op2_par_1(tid, mem, host, term, arg0, arg1);
        }
        break;
      }
      case FN0: case FN1: case FN2: case FN3: case FN4: case FN5: case FN6: case FN7:
      case FN8: case FN9: case FNA: case FNB: case FNC: case FND: case FNE: case FNF: case FNG: {
        //printf("- cal\n");
        u64 fun = get_ext(term);
        u64 ari = get_ari(term);
        //printf("- call fun %llu\n", fun);

        for (u64 n = 0; n < ari; ++n) {
          u64 argn = ask_arg(mem, term, n);
          if (get_tag(argn) == PAR) {
            return cal_par(tid, mem, host, term, argn, n);
          }
        }
        

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

        u64 page_index = fun / EXT;
        Page page = BOOK[page_index];
        //printf("- BOOK[%llu].valid %llu\n", page_index, BOOK[page_index].valid);
        if (page.valid == 1) {
          //printf("- entering page...\n");
          u64 args_data[page.match.size];
          //printf("?a\n");
          for (u64 arg_index = 0; arg_index < page.match.size; ++arg_index) {
            //printf("- strict arg %llu\n", arg_index);
            if (page.match.data[arg_index] > 0) {
              args_data[arg_index] = reduce(tid, mem, get_loc(term, arg_index));
            } else {
              args_data[arg_index] = ask_lnk(mem, get_loc(term, arg_index));
            }
          }
          //printf("- page has: %llu rules\n", page.count);
          //printf("?b\n");
          u64 matched = 0;
          for (u64 rule_index = 0; rule_index < page.count; ++rule_index) {
            //printf("- trying to match rule %llu\n", rule_index);
            Rule rule = page.rules[rule_index];
            matched = 1;
            for (u64 arg_index = 0; arg_index < rule.test.size; ++arg_index) {
              u64 value = rule.test.data[arg_index];
              if (get_tag(value) == CT0 && get_ext(args_data[arg_index]) != get_ext(value)) {
                //printf("- no match ctr %llu | %llu %llu\n", arg_index, get_ext(args_data[arg_index])/EXT, value/EXT);
                matched = 0;
                break;
              }
              if (get_tag(value) == U32 && get_val(args_data[arg_index]) != get_val(value)) {
                //printf("- no match num %llu\n", arg_index);
                matched = 0;
                break;
              }
            }
            if (matched) {
              Arr args = (Arr){page.match.size, args_data};
              //printf("cal_ctrs\n");
              cal_ctrs(tid, mem, host, rule.clrs, rule.cols, rule.root, rule.body, term, args);
              break;
            }
          }
          if (matched) {
            continue;
          }
        }
        break;
      }
    }
    //printf("quit\n");
    return term;
  }
}

// sets the nth bit of a bit-array represented as a u64 array
void set_bit(u64* bits, u64 bit) {
  bits[bit >> 6] |= (1ULL << (bit & 0x3f));
}

// gets the nth bit of a bit-array represented as a u64 array
u8 get_bit(u64* bits, u8 bit) {
  return (bits[bit >> 6] >> (bit & 0x3F)) & 1;
}

void normal_fork(u64 tid, u64 host);
void normal_join(u64 tid);

Lnk normal_cont(u64 tid, Mem* mem, u64 host, u64* seen) {
  Lnk term = ask_lnk(mem, host);
  if (get_bit(seen, host)) {
    return term;
  } else {
    term = reduce(tid, mem, host);
    set_bit(seen, host);
    switch (get_tag(term)) {
      case LAM: {
        link(mem, get_loc(term,1), normal_cont(tid, mem, get_loc(term,1), seen));
        return term;
      }
      case APP: {
        link(mem, get_loc(term,0), normal_cont(tid, mem, get_loc(term,0), seen));
        link(mem, get_loc(term,1), normal_cont(tid, mem, get_loc(term,1), seen));
        return term;
      }
      case PAR: {
        link(mem, get_loc(term,0), normal_cont(tid, mem, get_loc(term,0), seen));
        link(mem, get_loc(term,1), normal_cont(tid, mem, get_loc(term,1), seen));
        return term;
      }
      case DP0: {
        link(mem, get_loc(term,2), normal_cont(tid, mem, get_loc(term,2), seen));
        return term;
      }
      case DP1: {
        link(mem, get_loc(term,2), normal_cont(tid, mem, get_loc(term,2), seen));
        return term;
      }
      case CT0: case CT1: case CT2: case CT3: case CT4: case CT5: case CT6: case CT7:
      case CT8: case CT9: case CTA: case CTB: case CTC: case CTD: case CTE: case CTF: case CTG:
      case FN0: case FN1: case FN2: case FN3: case FN4: case FN5: case FN6: case FN7:
      case FN8: case FN9: case FNA: case FNB: case FNC: case FND: case FNE: case FNF: case FNG: {
        u64 arity = (u64)get_ari(term);
        if (CAN_SPAWN_WORKERS && arity > 1 && arity <= MAX_WORKERS) {
          CAN_SPAWN_WORKERS = 0;
          for (u64 t = 0; t < arity; ++t) {
            normal_fork(t, get_loc(term,t));
          }
          for (u64 t = 0; t < arity; ++t) {
            normal_join(t);
          }
        } else {
          for (u64 i = 0; i < arity; ++i) {
            link(mem, get_loc(term,i), normal_cont(tid, mem, get_loc(term,i), seen));
          }
        }
        return term;
      }
      default: {
        return term;
      }
    }
  }
}

Lnk normal(u64 tid, Mem* mem, u64 host) {
  const u64 size = 4194304; // uses 32 MB, covers heaps up to 2 GB
  static u64 seen[size]; 
  for (u64 i = 0; i < size; ++i) {
    seen[i] = 0;
  }
  return normal_cont(tid, mem, host, seen);
}

void *normal_thread(void *args_ptr) {
  u64 tid = (u64)args_ptr;
  normal(tid, workers[tid].mem, workers[tid].host);
  return 0;
}

void normal_fork(u64 tid, u64 host) {
  printf("* spawning thread: %llu\n", tid);
  workers[tid].host = host;
  pthread_create(&workers[tid].thread, NULL, &normal_thread, (void*)tid);
}

void normal_join(u64 tid) {
  pthread_join(workers[tid].thread, NULL);
}

//typedef struct {
  //Arr test;
  //Arr clrs;
  //Arr cols;
  //Lnk root;
  //Arr body;
//} Rule;

//typedef struct {
  //Arr match;
  //u64 count;
  //Rule* rules;
//} Page;

//typedef struct {
  //u64 size;
  //u64* data;
//} Arr;

//void add_dynbook_ffi(
  //u64* match_data,
  //u64  match_size,
  //u64* test_data,
  //u64  test_size,
  //u64* clrs_data,
  //u64  clrs_size,
  //u64  root,
  //u64* lnk,
//) {
  
//}

void dynbook_page_init_ffi(
  u64  page_index,
  u64* match_data,
  u64  match_size,
  u64  count
) {
  BOOK[page_index].valid      = 1;
  BOOK[page_index].match.data = (u64*)malloc(match_size * sizeof(u64));
  memcpy(BOOK[page_index].match.data, match_data, match_size * sizeof(u64));
  BOOK[page_index].match.size = match_size;
  BOOK[page_index].count      = count;
  BOOK[page_index].rules      = (Rule*)malloc(count * sizeof(Rule));
}

void dynbook_page_add_rule_ffi(
  u64  page_index,
  u64  rule_index,
  u64* test_data,
  u64  test_size,
  u64* clrs_data,
  u64  clrs_size,
  u64* cols_data,
  u64  cols_size,
  u64* root,
  u64* body_data,
  u64  body_size 
) {
  BOOK[page_index].rules[rule_index].test.data = (u64*)malloc(test_size * sizeof(u64));
  BOOK[page_index].rules[rule_index].test.size = test_size;
  memcpy(BOOK[page_index].rules[rule_index].test.data, test_data, test_size * sizeof(u64));

  BOOK[page_index].rules[rule_index].clrs.data = (u64*)malloc(clrs_size * sizeof(u64));
  BOOK[page_index].rules[rule_index].clrs.size = clrs_size;
  memcpy(BOOK[page_index].rules[rule_index].clrs.data, clrs_data, clrs_size * sizeof(u64));

  BOOK[page_index].rules[rule_index].cols.data = (u64*)malloc(cols_size * sizeof(u64));
  BOOK[page_index].rules[rule_index].cols.size = cols_size;
  memcpy(BOOK[page_index].rules[rule_index].cols.data, cols_data, cols_size * sizeof(u64));

  BOOK[page_index].rules[rule_index].root      = root[0];

  BOOK[page_index].rules[rule_index].body.data = (u64*)malloc(body_size * sizeof(u64));
  BOOK[page_index].rules[rule_index].body.size = body_size;
  memcpy(BOOK[page_index].rules[rule_index].body.data, body_data, body_size * sizeof(u64));

  //printf("Page index: %llu\n", page_index);
  //printf("Rule index: %llu\n", rule_index);
  //printf("Test data:");
  //for (u64 i = 0; i < test_size; ++i) {
    //printf(" %llu", test_data[i]);
  //}
  //printf("\n");
  //printf("Test size: %llu\n", test_size);
  //printf("Clrs data:");
  //for (u64 i = 0; i < clrs_size; ++i) {
    //printf(" %llu", clrs_data[i]);
  //}
  //printf("\n");
  //printf("Clrs size: %llu\n", clrs_size);
  //printf("Cols data:");
  //for (u64 i = 0; i < cols_size; ++i) {
    //printf(" %llu", cols_data[i]);
  //}
  //printf("\n");
  //printf("Cols size: %llu\n", cols_size);
  //printf("Root     : %llu\n", root[0]);
  //printf("Body data:");
  //for (u64 i = 0; i < body_size; ++i) {
    //printf(" %llu", body_data[i]);
  //}
  //printf("\n");
  //printf("Body size: %llu\n", body_size);
  //printf("\n");

}

u32 normal_ffi(u8* mem_data, u32 mem_size, u32 host) {

  // Init thread objects
  Mem mem;
  mem.data = (u64*)mem_data;
  mem.size = (u64)mem_size;
  for (u64 t = 0; t < MAX_WORKERS; ++t) {
    workers[t].thread = NULL;
    workers[t].mem = &mem;
    workers[t].gas = 0;
  }

  // Inits dynbook
  //for (u64 i = 0; i < BOOK_SIZE; ++i) {
    //BOOK[i].valid = 0;
  //}

  //printf("got: %llu %llu %llu\n", get_tag(mem.data[0])/TAG, get_ext(mem.data[0])/EXT, get_val(mem.data[0]));

  // Spawns the root worker
  normal_fork(0, (u64) host);
  normal_join(0);
  printf("\n");

  // Clears dynbook
  for (u64 i = 0; i < BOOK_SIZE; ++i) {
    if (BOOK[i].valid) {
      free(BOOK[i].match.data);
      for (u64 j = 0; j < BOOK[i].count; ++j) {
        free(BOOK[i].rules[j].test.data);
        free(BOOK[i].rules[j].clrs.data);
        free(BOOK[i].rules[j].cols.data);
        free(BOOK[i].rules[j].body.data);
      }
      free(BOOK[i].rules);
    }
  }

  // Clear thread objects
  // TODO?
  
  return mem.size;

}
