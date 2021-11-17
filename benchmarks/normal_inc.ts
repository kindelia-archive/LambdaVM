// Tests
// -----

import {read, lambda_to_optimal, show_as_lambda} from "./../syntax.ts"
import {normal} from "./../optimal_calculus.ts"
import {normal_ffi} from "./../optimal_calculus_ffi.ts"

var lib : string = `
// inc : Bits -> Pair<Bool,Bits>
def @0(x):
  case x {
    $0{pred}: $0{$0{} $1{pred}}
    $1{pred}: @1(@0(pred))
    $2{}: $0{$1{} $2{}}
  }

// inc.aux : Pair<Bool,Bits> -> Pair<Bool,Bits>
def @1(p):
  case p {
    $0{carry pred}: $0{carry $0{pred}}
  }

// slow : Bits -> Bits
def @2(x):
  @3(@0(x))

// slow.aux : Pair<Bool,Bits> -> Bits
def @3(x):
  case x {
    $0{carry next}: case carry { 
      $0{}: @2(next)
      $1{}: next
    }
  }
`;

var main : string = `
  @2($0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$0{$2{}}}}}}}}}}}}}}}}}}}}}}}}}}}}})
`;

var val = lambda_to_optimal(main);
var mem = read(val);
var gas = normal(mem, 0);
