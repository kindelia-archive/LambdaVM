#include <stdlib.h>
#include <stdio.h>
#include <pthread.h>

// Types
// -----

typedef unsigned char u8;
typedef unsigned int u32;
typedef unsigned long long int u64;

const u8 NIL = 0;
const u8 LAM = 1;
const u8 APP = 2;
const u8 PAR = 3;
const u8 DP0 = 4;
const u8 DP1 = 5;
const u8 VAR = 6;
const u8 ARG = 7;
const u8 CTR = 8;
const u8 CAL = 9;
const u8 OP2 = 10;
const u8 U32 = 11;

const u8 ADD = 0;
const u8 SUB = 1;
const u8 MUL = 2;
const u8 DIV = 3;
const u8 MOD = 4;
const u8 AND = 5;
const u8 OR  = 6;
const u8 XOR = 7;
const u8 SHL = 8;
const u8 SHR = 9;
const u8 LTN = 10;
const u8 LTE = 11;
const u8 EQL = 12;
const u8 GTE = 13;
const u8 GTN = 14;
const u8 NEQ = 15;

//GENERATED_CONSTRUCTOR_IDS_START//
//GENERATED_CONSTRUCTOR_IDS//
//GENERATED_CONSTRUCTOR_IDS_END//

typedef u64 Lnk;

typedef struct {
  u64 size;
  u64* data;
} Arr;


typedef struct {
  Arr* lnk;
  u64 gas;
  Arr use[9];
} Mem;

typedef struct {
  pthread_t thread;
  Mem mem;
  u64 host;
} Worker;

// Workers
// -------

const u64 MAX_WORKERS = 8;
u64 CAN_SPAWN_WORKERS = 1;
Worker workers[MAX_WORKERS];

// Gas
// ---

u32 get_gas() {
  u32 total = 0;
  for (u64 t = 0; t < MAX_WORKERS; ++t) {
    total += workers[t].mem.gas;
  }
  return total;
}

void inc_gas(Mem* MEM) {
  MEM->gas++;
}

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

Lnk Nil() {
  return NIL;
}

Lnk Lam(u64 pos) {
  return LAM | (pos << 24);
}

Lnk App(u64 pos) {
  return APP | (pos << 24);
}

Lnk Par(u64 col, u64 pos) {
  return PAR | (col << 4) | (pos << 24);
}

Lnk Dp0(u64 col, u64 pos) {
  return DP0 | (col << 4) | (pos << 24);
}

Lnk Dp1(u64 col, u64 pos) {
  return DP1 | (col << 4) | (pos << 24);
}

Lnk Var(u64 pos) {
  return VAR | (pos << 24);
}

Lnk Arg(u64 pos) {
  return ARG | (pos << 24);
}

Lnk Ctr(u64 fun, u64 ari, u64 pos) {
  return CTR | (fun << 4) | (ari << 20) | (pos << 24);
}

Lnk Cal(u64 fun, u64 ari, u64 pos) {
  return CAL | (fun << 4) | (ari << 20) | (pos << 24);
}

Lnk Op2(u64 op, u64 pos) {
  return OP2 | (op << 4) | (pos << 24);
}

Lnk U_32(u64 val) {
  return U32 | (val << 4);
}

u64 get_tag(Lnk lnk) {
  return lnk & 0xF;
}

u64 get_col(Lnk lnk) {
  return (lnk >> 4) & 0xFFFFF;
}

u64 get_fun(Lnk lnk) {
  return (lnk >> 4) & 0xFFFF;
}

u64 get_ari(Lnk lnk) {
  return (lnk >> 20) & 0xF;
}

u64 get_ope(Lnk lnk) {
  return (lnk >> 4) & 0xF;
}

u64 get_num(Lnk lnk) {
  return (lnk >> 4) & 0xFFFFFFFF;
}

u64 get_loc(Lnk lnk, u64 arg) {
  return (lnk >> 24) + arg;
}

Lnk get_lnk(Mem* mem, Lnk lnk, u8 arg) {
  return array_read(mem->lnk, get_loc(lnk, arg));
}

Lnk deref(Mem* mem, u64 loc) {
  return array_read(mem->lnk, loc);
}

u64 link(Mem* mem, u64 loc, Lnk link) {
  array_write(mem->lnk, loc, link);
  switch (get_tag(link)) {
    case VAR: array_write(mem->lnk, get_loc(link,0), Arg(loc)); break;
    case DP0: array_write(mem->lnk, get_loc(link,0), Arg(loc)); break;
    case DP1: array_write(mem->lnk, get_loc(link,1), Arg(loc)); break;
  }
  return link;
}

u64 alloc(Mem* mem, u64 size) {
  if (size == 0) {
    return 0;
  } else {
    u64 reuse = array_pop(&mem->use[size]);
    if (reuse != -1) {
      return reuse;
    } else {
      u64 loc = __atomic_fetch_add(&mem->lnk->size, size, __ATOMIC_RELAXED);
      for (u64 i = 0; i < size; ++i) {
        mem->lnk->data[loc + i] = 0;
      }
      return loc;
    }
  }
}

void clear(Mem* mem, u64 loc, u64 size) {
  if (size > 0) {
    array_push(&mem->use[size], loc);
  }
}

// Garbage Collection
// ------------------

void collect(Mem* mem, Lnk term) {
  switch (get_tag(term)) {
    case LAM: {
      if (get_tag(get_lnk(mem,term,0)) != NIL) {
        link(mem, get_loc(get_lnk(mem,term,0),0), Nil());
      }
      collect(mem, get_lnk(mem,term,1));
      clear(mem, get_loc(term,0), 2);
      break;
    }
    case APP: {
      collect(mem, get_lnk(mem,term,0));
      collect(mem, get_lnk(mem,term,1));
      clear(mem, get_loc(term,0), 2);
      break;
    }
    case PAR: {
      collect(mem, get_lnk(mem,term,0));
      collect(mem, get_lnk(mem,term,1));
      clear(mem, get_loc(term,0), 2);
      break;
    }
    case DP0: {
      link(mem, get_loc(term,0), Nil());
      break;
    }
    case DP1: {
      link(mem, get_loc(term,1), Nil());
      break;
    }
    case CAL:
    case CTR: {
      u64 arity = get_ari(term);
      for (u64 i = 0; i < arity; ++i) {
        collect(mem, get_lnk(mem,term,i));
      }
      clear(mem, get_loc(term,0), arity);
      break;
    }
    case OP2: {
      collect(mem, get_lnk(mem,term,0));
      collect(mem, get_lnk(mem,term,1));
      break;
    }
    case U32: {
      break;
    }
    case VAR: {
      link(mem, get_loc(term,0), Nil());
      break;
    }
  }
}

// Reduction
// ---------

void subst(Mem* mem, Lnk lnk, Lnk val) {
  if (get_tag(lnk) != NIL) {
    link(mem, get_loc(lnk,0), val);
  } else {
    collect(mem, val);
  }
}

Lnk reduce(Mem* MEM, u64 host) {
  while (1) {
    u64 term = deref(MEM, host);
    switch (get_tag(term)) {
      case APP: {
        Lnk func = reduce(MEM, get_loc(term,0));
        switch (get_tag(func)) {
          // (λx:b a)
          // --------- APP-LAM
          // x <- a
          case LAM: {
            inc_gas(MEM);
            subst(MEM, get_lnk(MEM, func, 0), get_lnk(MEM, term, 1));
            link(MEM, host, get_lnk(MEM, func, 1));
            clear(MEM, get_loc(term,0), 2);
            clear(MEM, get_loc(func,0), 2);
            continue;
          }
          // (&A<a b> c)
          // ----------------- APP-PAR
          // !A<x0 x1> = c
          // &A<(a x0) (b x1)>
          case PAR: {
            inc_gas(MEM);
            u64 app0 = get_loc(term, 0);
            u64 app1 = get_loc(func, 0);
            u64 let0 = alloc(MEM, 3);
            u64 par0 = alloc(MEM, 2);
            link(MEM, let0+2, get_lnk(MEM, term, 1));
            link(MEM, app0+1, Dp0(get_col(func), let0));
            link(MEM, app0+0, get_lnk(MEM, func, 0));
            link(MEM, app1+0, get_lnk(MEM, func, 1));
            link(MEM, app1+1, Dp1(get_col(func), let0));
            link(MEM, par0+0, App(app0));
            link(MEM, par0+1, App(app1));
            return link(MEM, host, Par(get_col(func), par0));
          }
        }
        break;
      }
      // {a _op_ b}
      // ---------- OP2-U32
      // _op_(a, b)
      case OP2: {
        Lnk val0 = reduce(MEM, get_loc(term,0));
        Lnk val1 = reduce(MEM, get_loc(term,1));
        if (get_tag(val0) == U32 && get_tag(val1) == U32) {
          u32 a = get_num(val0);
          u32 b = get_num(val1);
          u32 c;
          switch (get_ope(term)) {
            case ADD: c = a + b; break;
            case SUB: c = a - b; break;
            case MUL: c = a * b; break;
            case DIV: c = a / b; break;
            case MOD: c = a % b; break;
            case AND: c = a & b; break;
            case OR : c = a | b; break;
            case XOR: c = a ^ b; break;
            case SHL: c = a << b; break;
            case SHR: c = a >> b; break;
            case LTN: c = a < b; break;
            case LTE: c = a <= b; break;
            case EQL: c = a == b; break;
            case GTE: c = a >= b; break;
            case GTN: c = a > b; break;
            case NEQ: c = a != b; break;
            default : c = 0; break;
          }
          clear(MEM, get_loc(term,0), 2);
          return link(MEM, host, U_32(c));
        }
      }
      case DP0:
      case DP1: {
        Lnk expr = reduce(MEM, get_loc(term,2));
        switch (get_tag(expr)) {
          // !A<r s> = λx: f
          // --------------- LET-LAM
          // !A<f0 f1> = f
          // r <- λx0: f0
          // s <- λx1: f1
          // x <- &A<x0 x1>
          // ~
          case LAM: {
            inc_gas(MEM);

            u64 let0 = get_loc(term, 0);
            u64 par0 = get_loc(expr, 0);
            u64 lam0 = alloc(MEM, 2);
            u64 lam1 = alloc(MEM, 2);

            link(MEM, let0+2, get_lnk(MEM, expr, 1));
            link(MEM, par0+1, Var(lam1));

            Lnk expr_lnk_0 = get_lnk(MEM, expr, 0);
            link(MEM, par0+0, Var(lam0));
            subst(MEM, expr_lnk_0, Par(get_col(term), par0));

            Lnk term_lnk_0 = get_lnk(MEM,term,0);
            link(MEM, lam0+1, Dp0(get_col(term), let0));
            subst(MEM, term_lnk_0, Lam(lam0));

            Lnk term_lnk_1 = get_lnk(MEM,term,1);
            link(MEM, lam1+1, Dp1(get_col(term), let0));
            subst(MEM, term_lnk_1, Lam(lam1));

            link(MEM, host, Lam(get_tag(term) == DP0 ? lam0 : lam1));

            continue;
          }
          case PAR: {
            inc_gas(MEM);

            if (get_col(term) == get_col(expr)) {
              subst(MEM, get_lnk(MEM,term,0), get_lnk(MEM,expr,0));
              subst(MEM, get_lnk(MEM,term,1), get_lnk(MEM,expr,1));
              link(MEM, host, get_lnk(MEM, expr, get_tag(term) == DP0 ? 0 : 1));
              clear(MEM, get_loc(term,0), 3);
              clear(MEM, get_loc(expr,0), 2);
              continue;
            } else {

              u64 par0 = alloc(MEM, 2);
              u64 let0 = get_loc(term,0);
              u64 par1 = get_loc(expr,0);
              u64 let1 = alloc(MEM, 3);

              link(MEM, let0+2, get_lnk(MEM,expr,0));
              link(MEM, let1+2, get_lnk(MEM,expr,1));

              Lnk term_lnk_1 = get_lnk(MEM,term,1);
              link(MEM, par1+0, Dp1(get_col(term),let0));
              link(MEM, par1+1, Dp1(get_col(term),let1));
              subst(MEM, term_lnk_1, Par(get_col(expr),par1));

              Lnk term_lnk_0 = get_lnk(MEM,term,0);
              link(MEM, par0+0, Dp0(get_col(term),let0));
              link(MEM, par0+1, Dp0(get_col(term),let1));
              subst(MEM, term_lnk_0, Par(get_col(expr),par0));

              return link(MEM, host, Par(get_col(expr), get_tag(term) == DP0 ? par0 : par1));
            }
          }
          // !A<x y> = $V:L{a b c ...}
          // -------------------------
          // !A<a0 a1> = a
          // !A<b0 b1> = b
          // !A<c0 c1> = c
          // ...
          // x <- $V:L{a0 b0 c0 ...}
          // y <- $V:L{a1 b1 c1 ...}
          // ~
          case CTR: {
            inc_gas(MEM);
            u64 func = get_fun(expr);
            u64 arit = get_ari(expr);
            if (arit == 0) {
              subst(MEM, get_lnk(MEM,term,0), Ctr(func, 0, 0));
              subst(MEM, get_lnk(MEM,term,1), Ctr(func, 0, 0));
              clear(MEM, get_loc(term,0), 3);
              return link(MEM, host, Ctr(func, 0, 0));
            } else {
              u64 ctr0 = get_loc(expr,0);
              u64 ctr1 = alloc(MEM, arit);
              subst(MEM, get_lnk(MEM,term,0), Ctr(func, arit, ctr0));
              subst(MEM, get_lnk(MEM,term,1), Ctr(func, arit, ctr1));
              for (u64 i = 0; i < arit; ++i) {
                u64 leti = i == 0 ? get_loc(term,0) : alloc(MEM, 3);
                Lnk expr_lnk_i = get_lnk(MEM, expr, i);
                link(MEM, ctr0+i, Dp0(get_col(term), leti));
                link(MEM, ctr1+i, Dp1(get_col(term), leti));
                link(MEM, leti+2, expr_lnk_i);
              }
              return link(MEM, host, Ctr(func, arit, get_tag(term) == DP0 ? ctr0 : ctr1));
            }
          }
          // !A<x y> = #k
          // ------------
          // x <- #k
          // y <- #k
          // ~
          case U32: {
            subst(MEM, get_lnk(MEM,term,0), expr);
            subst(MEM, get_lnk(MEM,term,1), expr);
            link(MEM, host, expr);
            continue;
          }
        }
        break;
      }

      case CAL: {
        switch (get_fun(term))
        //GENERATED_REWRITE_RULES_START//
        {
//GENERATED_REWRITE_RULES//
        }
        //GENERATED_REWRITE_RULES_END//
      }

    }
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

Lnk normal_cont(Mem* MEM, u64 host, u64* seen) {
  Lnk term = deref(MEM, host);
  if (get_bit(seen, get_loc(term,0))) {
    return term;
  } else {
    term = reduce(MEM, host);
    set_bit(seen, get_loc(term,0));
    switch (get_tag(term)) {
      case LAM: {
        link(MEM, get_loc(term,1), normal_cont(MEM, get_loc(term,1), seen));
        return term;
      }
      case APP: {
        link(MEM, get_loc(term,0), normal_cont(MEM, get_loc(term,0), seen));
        link(MEM, get_loc(term,1), normal_cont(MEM, get_loc(term,1), seen));
        return term;
      }
      case PAR: {
        link(MEM, get_loc(term,0), normal_cont(MEM, get_loc(term,0), seen));
        link(MEM, get_loc(term,1), normal_cont(MEM, get_loc(term,1), seen));
        return term;
      }
      case DP0: {
        link(MEM, get_loc(term,2), normal_cont(MEM, get_loc(term,2), seen));
        return term;
      }
      case DP1: {
        link(MEM, get_loc(term,2), normal_cont(MEM, get_loc(term,2), seen));
        return term;
      }
      case CTR: {
        u64 arity = (u64)get_ari(term);
        if (CAN_SPAWN_WORKERS && arity > 1 && arity <= MAX_WORKERS) {
          CAN_SPAWN_WORKERS = 1;
          for (u64 t = 0; t < arity; ++t) {
            normal_fork(t, get_loc(term,t));
          }
          for (u64 t = 0; t < arity; ++t) {
            normal_join(t);
          }
        } else {
          for (u64 i = 0; i < arity; ++i) {
            link(MEM, get_loc(term,i), normal_cont(MEM, get_loc(term,i), seen));
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

Lnk normal(Mem* MEM, u64 host) {
  const u64 size = 2097152; // uses 16 MB, covers heaps up to 1 GB
  static u64 seen[size]; 
  for (u64 i = 0; i < size; ++i) {
    seen[i] = 0;
  }
  return normal_cont(MEM, host, seen);
}

void *normal_thread(void *args_ptr) {
  u64 tid = (u64)args_ptr;
  normal(&workers[tid].mem, workers[tid].host);
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

u32 normal_ffi(
  u8* lnk_data, u32 lnk_size,
  u8* use0_data, u32 use0_size,
  u8* use1_data, u32 use1_size,
  u8* use2_data, u32 use2_size,
  u8* use3_data, u32 use3_size,
  u8* use4_data, u32 use4_size,
  u8* use5_data, u32 use5_size,
  u8* use6_data, u32 use6_size,
  u8* use7_data, u32 use7_size,
  u8* use8_data, u32 use8_size,
  u32 host
) {
  // Init thread objects
  Arr* lnk = malloc(sizeof(Arr));
  lnk->data = (u64*)lnk_data;
  lnk->size = (u64)lnk_size;
  for (u64 t = 0; t < MAX_WORKERS; ++t) {
    workers[t].thread = NULL;
    workers[t].mem.lnk = lnk;
    workers[t].mem.gas = 0;
    for (u64 i = 0; i < 8; ++i) {
      workers[t].mem.use[i].data = malloc(256 * 131072 * sizeof(u64));
      workers[t].mem.use[i].size = 0;
    }
  }

  // Spawns the root worker
  normal_fork(0, (u64) host);
  normal_join(0);
  printf("\n");

  // Clear thread objects
  u32 size = (u32)lnk->size;
  free(lnk);
  for (u64 t = 0; t < MAX_WORKERS; ++t) {
    for (u64 i = 0; i < 9; ++i) {
      free(workers[t].mem.use[i].data);
    }
  }

  return size;
  //return GAS;
}
