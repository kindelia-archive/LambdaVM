// Tests
// -----

import {read, lambda_to_optimal, show_as_lambda} from "./../syntax.ts"
import {normal} from "./../optimal_calculus.ts"
import {normal_ffi} from "./../optimal_calculus_ffi.ts"

var main : string = `
  let NOT = λb: λt: λf: (b f t)
  let EXP = λa: λb: (b a)
  let ODD = λn: (n NOT λt:λf:f)

  let A = λS: λZ: (S (S (S (S (S (S (S (S (S Z)))))))))
  let B = λS: λZ: (S (S (S (S (S (S (S (S (S Z)))))))))

  (ODD (EXP A B))
`;

var val = lambda_to_optimal(main);
var mem = read(val);
var gas = normal(mem, 0);

console.log("cost: " + gas);
console.log("norm: " + show_as_lambda(mem));
