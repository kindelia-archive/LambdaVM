// Tests
// -----

import {run} from "./../api.ts"

var code = `
def @0(x):
  case x {
    $0{}: $0{}
    $1{pred}:
      dup a b = pred
      @1(@0(a) @0(b))
  }

def @1(a b):
  case a {
    $0{}: case b {
      $0{}: $1{}
      $1{}: $1{}
    }
    $1{}: case b {
      $0{}: $1{}
      $1{}: $0{}
    }
  }
`;

var main : string = `
  @0(
    $1{$1{$1{$1{
      $0{}
    }}}}
  )
`;

console.log(run(false, main));
