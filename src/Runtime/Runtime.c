#include <stdlib.h>
#include <stdio.h>
#include <pthread.h>

// Numbers
// -------

typedef unsigned char u8;
typedef unsigned int u32;
typedef unsigned long long int u64;
typedef pthread_t Thd;

const u64 U64_PER_KB = 0x80;
const u64 U64_PER_MB = 0x20000;
const u64 U64_PER_GB = 0x8000000;

// Consts
// ------

const u64 MAX_THREADS = 8;
const u64 MAX_DYNFUNS = 65536;

// Terms
// -----

typedef u64 Lnk;

const u64 VAL = 1;
const u64 EXT = 0x100000000; 
const u64 ARI = 0x100000000000000;
const u64 TAG = 0x1000000000000000;

const u64 DP0 = 0x0;
const u64 DP1 = 0x1;
const u64 VAR = 0x2;
const u64 ARG = 0x3;
const u64 ERA = 0x4;
const u64 LAM = 0x5;
const u64 APP = 0x6;
const u64 PAR = 0x7;
const u64 CTR = 0x8;
const u64 FUN = 0x9;
const u64 OP2 = 0xA;
const u64 U32 = 0xB;
const u64 F32 = 0xC;
const u64 OUT = 0xE;
const u64 NIL = 0xF;

const u64 ADD = 0x0;
const u64 SUB = 0x1;
const u64 MUL = 0x2;
const u64 DIV = 0x3;
const u64 MOD = 0x4;
const u64 AND = 0x5;
const u64 OR  = 0x6;
const u64 XOR = 0x7;
const u64 SHL = 0x8;
const u64 SHR = 0x9;
const u64 LTN = 0xA;
const u64 LTE = 0xB;
const u64 EQL = 0xC;
const u64 GTE = 0xD;
const u64 GTN = 0xE;
const u64 NEQ = 0xF;

//GENERATED_CONSTRUCTOR_IDS_START//
//GENERATED_CONSTRUCTOR_IDS//
//GENERATED_CONSTRUCTOR_IDS_END//

//GENERATED_USE_DYNAMIC_FLAG//
//GENERATED_USE_STATIC_FLAG//

// Threads
// -------

typedef struct {
  u64  size;
  u64* data;
} Arr;

typedef struct {
  u64  host;
  u64  cost;
  u64  next;
  Arr  free[16];
  u32* todo;
  Thd  thd;
} Thread;

u64* data;
Thread threads[MAX_THREADS];

// Dynbook
// -------

typedef struct {
  Arr test;
  Lnk root;
  Arr body;
  Arr clrs;
  Arr cols;
} Rule;

typedef struct {
  Arr match;
  u64 count;
  Rule* rules;
} Dynfun;

Dynfun* dynfuns[MAX_DYNFUNS];

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

Lnk Var(u64 pos) {
  return (VAR * TAG) | pos;
}

Lnk Dp0(u64 col, u64 pos) {
  return (DP0 * TAG) | (col * EXT) | pos;
}

Lnk Dp1(u64 col, u64 pos) {
  return (DP1 * TAG) | (col * EXT) | pos;
}

Lnk Arg(u64 pos) {
  return (ARG * TAG) | pos;
}

Lnk Era() {
  return (ERA * TAG);
}

Lnk Lam(u64 pos) {
  return (LAM * TAG) | pos;
}

Lnk App(u64 pos) {
  return (APP * TAG) | pos;
}

Lnk Par(u64 col, u64 pos) {
  return (PAR * TAG) | (col * EXT) | pos;
}

Lnk Op2(u64 ope, u64 pos) {
  return (OP2 * TAG) | (ope * EXT) | pos;
}

Lnk U_32(u64 val) {
  return (U32 * TAG) | val;
}

Lnk Nil() {
  return NIL * TAG;
}

Lnk Ctr(u64 ari, u64 fun, u64 pos) {
  return (CTR * TAG) | (ari * ARI) | (fun * EXT) | pos;
}

Lnk Cal(u64 ari, u64 fun, u64 pos) { 
  return (FUN * TAG) | (ari * ARI) | (fun * EXT) | pos;
}

Lnk Out(u64 arg, u64 fld) {
  return (OUT * TAG) | (arg << 8) | fld;
}

u64 get_tag(Lnk lnk) {
  return lnk / TAG;
}

u64 get_ext(Lnk lnk) {
  return (lnk / EXT) & 0xFFFFFF;
}

u64 get_val(Lnk lnk) {
  return lnk & 0xFFFFFFFF;
}

u64 get_ari(Lnk lnk) {
  return (lnk / ARI) & 0xF;
}

u64 get_loc(Lnk lnk, u64 arg) {
  return get_val(lnk) + arg;
}

Lnk ask_lnk(u64 loc) {
  return data[loc];
}

Lnk ask_arg(Lnk term, u64 arg) {
  return ask_lnk(get_loc(term, arg));
}

u64 link(u64 loc, Lnk lnk) {
  data[loc] = lnk;
  if (get_tag(lnk) <= VAR) {
    data[get_loc(lnk, get_tag(lnk) & 1)] = Arg(loc);
  }
  return lnk;
}

u64 alloc(u64 tid, u64 size) {
  if (size == 0) {
    return 0;
  } else {
    if (size < 16) {
      u64 reuse = array_pop(&threads[tid].free[size]);
      if (reuse != -1) {
        return reuse;
      }
    }
    u64 loc = threads[tid].next;
    threads[tid].next += size;
    return loc;
  }
}

void clear(u64 tid, u64 loc, u64 size) {
  array_push(&threads[tid].free[size], loc);
}

// Debug
// -----

void debug_print_lnk(Lnk x) {
  u64 tag = get_tag(x);
  u64 ext = get_ext(x);
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
    case CTR: printf("CTR"); break;
    case FUN: printf("FUN"); break;
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

void collect(u64 tid, Lnk term) {
  switch (get_tag(term)) {
    case DP0: {
      link(get_loc(term,0), Era());
      //reduce(tid, get_loc(ask_arg(term, 1),0));
      break;
    }
    case DP1: {
      link(get_loc(term,1), Era());
      //reduce(tid, get_loc(ask_arg(term, 0),0));
      break;
    }
    case VAR: {
      link(get_loc(term,0), Era());
      break;
    }
    case LAM: {
      if (get_tag(ask_arg(term, 0)) != ERA) {
        link(get_loc(ask_arg(term, 0),0), Era());
      }
      collect(tid, ask_arg(term, 1));
      clear(tid, get_loc(term,0), 2);
      break;
    }
    case APP: {
      collect(tid, ask_arg(term, 0));
      collect(tid, ask_arg(term, 1));
      clear(tid, get_loc(term,0), 2);
      break;
    }
    case PAR: {
      collect(tid, ask_arg(term, 0));
      collect(tid, ask_arg(term, 1));
      clear(tid, get_loc(term,0), 2);
      break;
    }
    case OP2: {
      collect(tid, ask_arg(term, 0));
      collect(tid, ask_arg(term, 1));
      break;
    }
    case U32: {
      break;
    }
    case CTR: case FUN: {
      u64 arity = get_ari(term);
      for (u64 i = 0; i < arity; ++i) {
        collect(tid, ask_arg(term, i));
      }
      clear(tid, get_loc(term,0), arity);
      break;
    }
  }
}

// Terms
// -----

void inc_cost(u64 tid) {
  threads[tid].cost++;
}

void subst(u64 tid, Lnk lnk, Lnk val) {
  if (get_tag(lnk) != ERA) {
    link(get_loc(lnk,0), val);
  } else {
    collect(tid, val);
  }
}

Lnk app_lam(u64 tid, u64 host, Lnk term, Lnk arg0) {
  inc_cost(tid);
  subst(tid, ask_arg(arg0, 0), ask_arg(term, 1));
  u64 done = link(host, ask_arg(arg0, 1));
  clear(tid, get_loc(term,0), 2);
  clear(tid, get_loc(arg0,0), 2);
  return done;
}

Lnk app_par(u64 tid, u64 host, Lnk term, Lnk arg0) {
  inc_cost(tid);
  u64 app0 = get_loc(term, 0);
  u64 app1 = get_loc(arg0, 0);
  u64 let0 = alloc(tid, 3);
  u64 par0 = alloc(tid, 2);
  link(let0+2, ask_arg(term, 1));
  link(app0+1, Dp0(get_ext(arg0), let0));
  link(app0+0, ask_arg(arg0, 0));
  link(app1+0, ask_arg(arg0, 1));
  link(app1+1, Dp1(get_ext(arg0), let0));
  link(par0+0, App(app0));
  link(par0+1, App(app1));
  u64 done = Par(get_ext(arg0), par0);
  link(host, done);
  return done;
}

Lnk op2_u32_u32(u64 tid, u64 host, Lnk term, Lnk arg0, Lnk arg1) {
  inc_cost(tid);
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
  clear(tid, get_loc(term,0), 2);
  link(host, done);
  return done;
}

Lnk op2_par_0(u64 tid, u64 host, Lnk term, Lnk arg0, Lnk arg1) {
  inc_cost(tid);
  u64 op20 = get_loc(term, 0);
  u64 op21 = get_loc(arg0, 0);
  u64 let0 = alloc(tid, 3);
  u64 par0 = alloc(tid, 2);
  link(let0+2, arg1);
  link(op20+1, Dp0(get_ext(arg0), let0));
  link(op20+0, ask_arg(arg0, 0));
  link(op21+0, ask_arg(arg0, 1));
  link(op21+1, Dp1(get_ext(arg0), let0));
  link(par0+0, Op2(get_ext(term), op20));
  link(par0+1, Op2(get_ext(term), op21));
  u64 done = Par(get_ext(arg0), par0);
  link(host, done);
  return done;
}

Lnk op2_par_1(u64 tid, u64 host, Lnk term, Lnk arg0, Lnk arg1) {
  inc_cost(tid);
  u64 op20 = get_loc(term, 0);
  u64 op21 = get_loc(arg1, 0);
  u64 let0 = alloc(tid, 3);
  u64 par0 = alloc(tid, 2);
  link(let0+2, arg0);
  link(op20+0, Dp0(get_ext(arg1), let0));
  link(op20+1, ask_arg(arg1, 0));
  link(op21+1, ask_arg(arg1, 1));
  link(op21+0, Dp1(get_ext(arg1), let0));
  link(par0+0, Op2(get_ext(term), op20));
  link(par0+1, Op2(get_ext(term), op21));
  u64 done = Par(get_ext(arg1), par0);
  link(host, done);
  return done;
}

Lnk let_lam(u64 tid, u64 host, Lnk term, Lnk arg0) {
  inc_cost(tid);
  u64 let0 = get_loc(term, 0);
  u64 par0 = get_loc(arg0, 0);
  u64 lam0 = alloc(tid, 2);
  u64 lam1 = alloc(tid, 2);
  link(let0+2, ask_arg(arg0, 1));
  link(par0+1, Var(lam1));
  u64 arg0_arg_0 = ask_arg(arg0, 0);
  link(par0+0, Var(lam0));
  subst(tid, arg0_arg_0, Par(get_ext(term), par0));
  u64 term_arg_0 = ask_arg(term, 0);
  link(lam0+1, Dp0(get_ext(term), let0));
  subst(tid, term_arg_0, Lam(lam0));
  u64 term_arg_1 = ask_arg(term, 1);                      
  link(lam1+1, Dp1(get_ext(term), let0));
  subst(tid, term_arg_1, Lam(lam1));
  u64 done = Lam(get_tag(term) == DP0 ? lam0 : lam1);
  link(host, done);
  return done;
}

Lnk let_par_eq(u64 tid, u64 host, Lnk term, Lnk arg0) {
  inc_cost(tid);
  subst(tid, ask_arg(term, 0), ask_arg(arg0, 0));
  subst(tid, ask_arg(term, 1), ask_arg(arg0, 1));
  u64 done = link(host, ask_arg(arg0, get_tag(term) == DP0 ? 0 : 1));
  clear(tid, get_loc(term,0), 3);
  clear(tid, get_loc(arg0,0), 2);
  return done;
}

Lnk let_par_df(u64 tid, u64 host, Lnk term, Lnk arg0) {
  inc_cost(tid);
  u64 par0 = alloc(tid, 2);
  u64 let0 = get_loc(term,0);
  u64 par1 = get_loc(arg0,0);
  u64 let1 = alloc(tid, 3);
  link(let0+2, ask_arg(arg0, 0));
  link(let1+2, ask_arg(arg0, 1));
  u64 term_arg_0 = ask_arg(term, 0);
  u64 term_arg_1 = ask_arg(term, 1);
  link(par1+0, Dp1(get_ext(term),let0));
  link(par1+1, Dp1(get_ext(term),let1));
  link(par0+0, Dp0(get_ext(term),let0));
  link(par0+1, Dp0(get_ext(term),let1));
  subst(tid, term_arg_0, Par(get_ext(arg0),par0));
  subst(tid, term_arg_1, Par(get_ext(arg0),par1));
  u64 done = Par(get_ext(arg0), get_tag(term) == DP0 ? par0 : par1);
  link(host, done);
  return done;
}

Lnk let_u32(u64 tid, u64 host, Lnk term, Lnk arg0) {
  inc_cost(tid);
  subst(tid, ask_arg(term, 0), arg0);
  subst(tid, ask_arg(term, 1), arg0);
  u64 done = arg0;
  link(host, arg0);
  return done;
}

Lnk let_ctr(u64 tid, u64 host, Lnk term, Lnk arg0) {
  inc_cost(tid);
  u64 func = get_ext(arg0);
  u64 arit = get_ari(arg0);
  if (arit == 0) {
    subst(tid, ask_arg(term, 0), Ctr(0, func, 0));
    subst(tid, ask_arg(term, 1), Ctr(0, func, 0));
    clear(tid, get_loc(term,0), 3);
    u64 done = link(host, Ctr(0, func, 0));
    return done;
  } else {
    u64 ctr0 = get_loc(arg0,0);
    u64 ctr1 = alloc(tid, arit);
    u64 term_arg_0 = ask_arg(term, 0);
    u64 term_arg_1 = ask_arg(term, 1);
    for (u64 i = 0; i < arit; ++i) {
      u64 leti = i == 0 ? get_loc(term,0) : alloc(tid, 3);
      u64 arg0_arg_i = ask_arg(arg0, i);
      link(ctr0+i, Dp0(get_ext(term), leti));
      link(ctr1+i, Dp1(get_ext(term), leti));
      link(leti+2, arg0_arg_i);
    }
    subst(tid, term_arg_0, Ctr(arit, func, ctr0));
    subst(tid, term_arg_1, Ctr(arit, func, ctr1));
    u64 done = Ctr(arit, func, get_tag(term) == DP0 ? ctr0 : ctr1);
    link(host, done);
    return done;
  }
}

Lnk cal_par(u64 tid, u64 host, Lnk term, Lnk argn, u64 n) {
  inc_cost(tid);
  u64 arit = get_ari(term);
  u64 func = get_ext(term);
  u64 fun0 = get_loc(term, 0);
  u64 fun1 = alloc(tid, arit);
  u64 par0 = get_loc(argn, 0);
  for (u64 i = 0; i < arit; ++i) {
    if (i != n) {
      u64 leti = alloc(tid, 3);
      u64 argi = ask_arg(term, i);
      link(fun0+i, Dp0(get_ext(argn), leti));
      link(fun1+i, Dp1(get_ext(argn), leti));
      link(leti+2, argi);
    } else {
      link(fun0+i, ask_arg(argn, 0));
      link(fun1+i, ask_arg(argn, 1));
    }
  }
  link(par0+0, Cal(arit, func, fun0));
  link(par0+1, Cal(arit, func, fun1));
  u64 done = Par(get_ext(argn), par0);
  link(host, done);
  return done;
}

Lnk cal_ctrs(
  u64 tid,
  u64 host,
  Arr clrs,
  Arr cols,
  u64 root,
  Arr body,
  Lnk term,
  Arr args
) {
  inc_cost(tid);
  u64 size = body.size;
  u64 aloc = alloc(tid, size);
  //printf("- cal_ctrs | size: %llu | aloc: %llu\n", size, aloc);
  //printf("-- R: ");
  //debug_print_lnk(root);
  //printf("\n");
  for (u64 i = 0; i < size; ++i) {
    u64 lnk = body.data[i];
    //printf("-- %llx: ", i); debug_print_lnk(lnk); printf("\n");
    if (get_tag(lnk) == OUT) {
      u64 arg = (lnk >> 8) & 0xFF;
      u64 fld = (lnk >> 0) & 0xFF;
      u64 out = fld == 0xFF ? args.data[arg] : ask_arg(args.data[arg], fld);
      link(aloc + i, out);
    } else {
      data[aloc + i] = lnk + (get_tag(lnk) < U32 ? aloc : 0);
    }
  }
  u64 root_lnk;
  if (get_tag(root) == OUT) {
    u64 root_arg = (root >> 8) & 0xFF;
    u64 root_fld = (root >> 0) & 0xFF;
    root_lnk = root_fld == 0xFF ? args.data[root_arg] : ask_arg(args.data[root_arg], root_fld);
  } else {
    root_lnk = root + (get_tag(root) < U32 ? aloc : 0);
  }
  u64 done = root_lnk;
  link(host, done);
  clear(tid, get_loc(term, 0), args.size);
  for (u64 i = 0; i < clrs.size; ++i) {
    u64 clr = clrs.data[i];
    if (clr > 0) {
      clear(tid, get_loc(args.data[i],0), clr);
    }
  }
  for (u64 i = 0; i < cols.size; ++i) {
    collect(tid, cols.data[i]);
  }
  return done;
}

u64 reduce_dynfun(u64 tid, u64 host, Lnk term, Dynfun* dynfun) {
  //printf("- entering dynfun...\n");
  u64 args_data[dynfun->match.size];
  for (u64 arg_index = 0; arg_index < dynfun->match.size; ++arg_index) {
    //printf("- strict arg %llu\n", arg_index);
    args_data[arg_index] = ask_arg(term, arg_index);
    if (get_tag(args_data[arg_index]) == PAR) {
      cal_par(tid, host, term, args_data[arg_index], arg_index);
      break;
    }
  }
  //printf("- dynfun has: %llu rules\n", dynfun->count);
  u64 matched = 0;
  for (u64 rule_index = 0; rule_index < dynfun->count; ++rule_index) {
    //printf("- trying to match rule %llu\n", rule_index);
    Rule rule = dynfun->rules[rule_index];
    matched = 1;
    for (u64 arg_index = 0; arg_index < rule.test.size; ++arg_index) {
      u64 value = rule.test.data[arg_index];
      if (get_tag(value) == CTR && !(get_tag(args_data[arg_index]) == CTR && get_ext(args_data[arg_index]) == get_ext(value))) {
        //printf("- no match ctr %llu | %llu %llu\n", arg_index, get_ext(args_data[arg_index]), value);
        matched = 0;
        break;
      }
      if (get_tag(value) == U32 && !(get_tag(args_data[arg_index]) == U32 && get_val(args_data[arg_index]) == get_val(value))) {
        //printf("- no match num %llu\n", arg_index);
        matched = 0;
        break;
      }
    }
    if (matched) {
      Arr args = (Arr){dynfun->match.size, args_data};
      //printf("- cal_ctrs\n");
      cal_ctrs(tid, host, rule.clrs, rule.cols, rule.root, rule.body, term, args);
      break;
    }
  }
  return matched;
}

Lnk reduce(u64 tid, u64 root) {
  u32* stack = threads[tid].todo;

  u64 init = 1;
  u64 size = 1;
  u32 host = (u32)root;

  while (1) {

    u64 term = ask_lnk(host);

    //printf("reducing: host=%d size=%llu init=%llu ", host, size, init); debug_print_lnk(term); printf("\n");
    //for (u64 i = 0; i < size; ++i) {
      //printf("- %llu ", stack[i]); debug_print_lnk(ask_lnk(stack[i]>>1)); printf("\n");
    //}
    
    if (init == 1) {
      switch (get_tag(term)) {
        case APP: {
          stack[size++] = host;
          init = 1;
          host = get_loc(term, 0);
          continue;
        }
        case DP0:
        case DP1: {
          stack[size++] = host;
          host = get_loc(term, 2);
          continue;
        }
        case OP2: {
          stack[size++] = host;
          stack[size++] = get_loc(term, 0) | 0x80000000;
          host = get_loc(term, 1);
          continue;
        }
        case FUN: {
          //printf("?\n");
          u64 fun = get_ext(term);
          u64 ari = get_ari(term);
          
          // Static rules
          // ------------
          
          #ifdef USE_STATIC
          switch (fun)
          //GENERATED_REWRITE_RULES_STEP_0_START//
          {
//GENERATED_REWRITE_RULES_STEP_0//
          }
          //GENERATED_REWRITE_RULES_STEP_0_END//
          #endif

          // Dynamic rules
          // -------------

          #ifdef USE_DYNAMIC
          Dynfun* dynfun = dynfuns[fun];
          if (dynfun) {
            stack[size++] = host;
            for (u64 arg_index = 0; arg_index < dynfun->match.size; ++arg_index) {
              if (dynfun->match.data[arg_index] > 0) {
                //printf("- ue %llu\n", arg_index);
                stack[size++] = get_loc(term, arg_index) | 0x80000000;
              }
            }
            break;
          }
          #endif

          break;
        }
      }

    } else {

      switch (get_tag(term)) {
        case APP: {
          u64 arg0 = ask_arg(term, 0);
          switch (get_tag(arg0)) {
            case LAM: {
              app_lam(tid, host, term, arg0);
              init = 1;
              continue;
            }
            case PAR: {
              app_par(tid, host, term, arg0);
              break;
            }
          }
          break;
        }
        case DP0:
        case DP1: {
          u64 arg0 = ask_arg(term, 2);
          switch (get_tag(arg0)) {
            case LAM: {
              let_lam(tid, host, term, arg0);
              init = 1;
              continue;
            }
            case PAR: {
              if (get_ext(term) == get_ext(arg0)) {
                let_par_eq(tid, host, term, arg0);
                init = 1;
                continue;
              } else {
                let_par_df(tid, host, term, arg0);
                break;
              }
            }
          }
          if (get_tag(arg0) == U32) {
            let_u32(tid, host, term, arg0);
            break;
          }
          if (get_tag(arg0) == CTR) {
            let_ctr(tid, host, term, arg0);
            break;
          }
          break;
        }
        case OP2: {
          u64 arg0 = ask_arg(term, 0);
          u64 arg1 = ask_arg(term, 1);
          if (get_tag(arg0) == U32 && get_tag(arg1) == U32) {
            op2_u32_u32(tid, host, term, arg0, arg1);
            break;
          }
          if (get_tag(arg0) == PAR) {
            op2_par_0(tid, host, term, arg0, arg1);
            break;
          }
          if (get_tag(arg1) == PAR) {
            op2_par_1(tid, host, term, arg0, arg1);
            break;
          }
          break;
        }
        case FUN: {
          u64 fun = get_ext(term);
          u64 ari = get_ari(term);

          #ifdef USE_STATIC
          switch (fun)
          //GENERATED_REWRITE_RULES_STEP_1_START//
          {
//GENERATED_REWRITE_RULES_STEP_1//
          }
          //GENERATED_REWRITE_RULES_STEP_1_END//
          #endif

          #ifdef USE_DYNAMIC
          Dynfun* dynfun = dynfuns[fun];
          //printf("- on term: "); debug_print_lnk(term); printf("\n");
          //printf("- dynfuns[%llu].valid %llu\n", fun, dynfuns[fun].valid);
          if (dynfun) {
            if (reduce_dynfun(tid, host, term, dynfun)) {
              init = 1;
              continue;
            }
          }
          #endif

          break;
        }
      }
    }

    if (size > 0) {
      u64 item = stack[--size];
      init = item >> 31;
      host = item & 0x7FFFFFFF;
      continue;
    } else {
      break;
    }

  }

  return ask_lnk(root);
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

u64 CAN_SPAWN_THREADS = 1;
Lnk normal_cont(u64 tid, u64 host, u64* seen) {
  Lnk term = ask_lnk(host);
  //printf("normal "); debug_print_lnk(term); printf("\n");
  if (get_bit(seen, host)) {
    return term;
  } else {
    term = reduce(tid, host);
    set_bit(seen, host);
    switch (get_tag(term)) {
      case LAM: {
        link(get_loc(term,1), normal_cont(tid, get_loc(term,1), seen));
        return term;
      }
      case APP: {
        link(get_loc(term,0), normal_cont(tid, get_loc(term,0), seen));
        link(get_loc(term,1), normal_cont(tid, get_loc(term,1), seen));
        return term;
      }
      case PAR: {
        link(get_loc(term,0), normal_cont(tid, get_loc(term,0), seen));
        link(get_loc(term,1), normal_cont(tid, get_loc(term,1), seen));
        return term;
      }
      case DP0: {
        link(get_loc(term,2), normal_cont(tid, get_loc(term,2), seen));
        return term;
      }
      case DP1: {
        link(get_loc(term,2), normal_cont(tid, get_loc(term,2), seen));
        return term;
      }
      case CTR: case FUN: {
        u64 arity = (u64)get_ari(term);
        if (CAN_SPAWN_THREADS && arity > 1 && arity <= MAX_THREADS) {
          CAN_SPAWN_THREADS = 0;
          for (u64 t = 0; t < arity; ++t) {
            normal_fork(t, get_loc(term,t));
          }
          for (u64 t = 0; t < arity; ++t) {
            normal_join(t);
          }
        } else {
          for (u64 i = 0; i < arity; ++i) {
            link(get_loc(term,i), normal_cont(tid, get_loc(term,i), seen));
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

Lnk normal(u64 tid, u64 host) {
  const u64 size = 4194304; // uses 32 MB, covers heaps up to 2 GB
  static u64 seen[size]; 
  for (u64 i = 0; i < size; ++i) {
    seen[i] = 0;
  }
  return normal_cont(tid, host, seen);
}

void *normal_thread(void *args_ptr) {
  u64 tid = (u64)args_ptr;
  normal(tid, threads[tid].host);
  return 0;
}

void normal_fork(u64 tid, u64 host) {
  printf("* spawning thread: %llu\n", tid);
  threads[tid].host = host;
  pthread_create(&threads[tid].thd, NULL, &normal_thread, (void*)tid);
}

void normal_join(u64 tid) {
  pthread_join(threads[tid].thd, NULL);
}

// FFI
// ---

void ffi_add_dynfun(u64 dynfun_index, u64* dynfun_data) {
  //printf("dynbook_add_dynfun: %llu %llu %llu %llu ...\n", dynfun_data[0], dynfun_data[1], dynfun_data[2], dynfun_data[3]);

  Dynfun* dynfun = dynfuns[dynfun_index] = malloc(sizeof(Dynfun));

  u64 i = 0;
  dynfun->match.size = dynfun_data[i++];
  //printf("match.size: %llu\n", dynfun->match.size);
  dynfun->match.data = (u64*)malloc(dynfun->match.size * sizeof(u64));
  for (u64 n = 0; n < dynfun->match.size; ++n) {
    dynfun->match.data[n] = dynfun_data[i++];
  }

  dynfun->count = dynfun_data[i++];
  dynfun->rules = (Rule*)malloc(dynfun->count * sizeof(Rule));
  //printf("rule count: %llu\n", dynfun->count);

  for (u64 r = 0; r < dynfun->count; ++r) {
    //printf("on rule %llu\n", r);
    dynfun->rules[r].test.size = dynfun_data[i++];
    //printf("- test.size: %llu\n", dynfun->rules[r].test.size);
    dynfun->rules[r].test.data = (u64*)malloc(dynfun->rules[r].test.size * sizeof(u64));
    for (u64 n = 0; n < dynfun->rules[r].test.size; ++n) {
      dynfun->rules[r].test.data[n] = dynfun_data[i++];
    }

    dynfun->rules[r].root = dynfun_data[i++];
    //printf("- root: %llu\n", dynfun->rules[r].root);
    dynfun->rules[r].body.size = dynfun_data[i++];
    //printf("- body.size: %llu\n", dynfun->rules[r].body.size);
    dynfun->rules[r].body.data = (u64*)malloc(dynfun->rules[r].body.size * sizeof(u64));
    for (u64 n = 0; n < dynfun->rules[r].body.size; ++n) {
      dynfun->rules[r].body.data[n] = dynfun_data[i++];
    }

    dynfun->rules[r].clrs.size = dynfun_data[i++];
    //printf("- clrs.size: %llu\n", dynfun->rules[r].clrs.size);
    dynfun->rules[r].clrs.data = (u64*)malloc(dynfun->rules[r].clrs.size * sizeof(u64));
    for (u64 n = 0; n < dynfun->rules[r].clrs.size; ++n) {
      dynfun->rules[r].clrs.data[n] = dynfun_data[i++];
    }

    dynfun->rules[r].cols.size = dynfun_data[i++];
    //printf("- cols.size: %llu\n", dynfun->rules[r].cols.size);
    dynfun->rules[r].cols.data = (u64*)malloc(dynfun->rules[r].cols.size * sizeof(u64));
    for (u64 n = 0; n < dynfun->rules[r].cols.size; ++n) {
      dynfun->rules[r].cols.data[n] = dynfun_data[i++];
    }
  }
}

u64 ffi_cost = 0;
u64 ffi_size = 0;

u32 ffi_get_cost() {
  return ffi_cost;
}

u64 ffi_get_size() {
  return ffi_size;
}

void ffi_normal(u8* mem_data, u32 mem_size, u32 host) {

  data = (u64*)mem_data;

  // Init thread objects
  threads[0].next = (u64)mem_size;
  for (u64 i = 0; i < 16; ++i) {
    threads[0].free[i].size = 0;
    threads[0].free[i].data = malloc(256 * 1024 * 1024 * sizeof(u64));
  }
  threads[0].todo = malloc(64 * 1024 * 1024 * sizeof(u64)); // 64 MB
  threads[0].cost = 0;
  for (u64 t = 0; t < MAX_THREADS; ++t) {
    threads[t].thd = NULL;
  }

  //printf("got: %llu %llu %llu\n", get_tag(mem.data[0])/TAG, get_ext(mem.data[0])/EXT, get_val(mem.data[0]));

  // Spawns the root worker
  normal_fork(0, (u64) host);
  normal_join(0);
  
  // Clears mallocs
  for (u64 i = 0; i < MAX_DYNFUNS; ++i) {
    Dynfun* dynfun = dynfuns[i];
    if (dynfun) {
      free(dynfun->match.data);
      for (u64 j = 0; j < dynfun->count; ++j) {
        free(dynfun->rules[j].test.data);
        free(dynfun->rules[j].clrs.data);
        free(dynfun->rules[j].cols.data);
        free(dynfun->rules[j].body.data);
      }
      free(dynfun->rules);
      free(dynfun);
    }
  }
  free(threads[0].todo);
  
  ffi_cost = threads[0].cost;
  ffi_size = threads[0].next;
}

// Main
// ----

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
