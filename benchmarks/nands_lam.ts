// Tests
// -----

import {run} from "./../api.ts"

var main : string = `
  let Y = λf: (λr: (f (r r)) λr: (f (r r)))
  let Z = λz: λs: z
  let S = λn: λz: λs: (s n)
  let nand = λa: (a λb:(b λt:λf:f λt:λf:f) λb:(b λt:λf:f λt:λf:t))
  let slow = (Y λslow: λn: (n λx:x λpred:((slow pred) (slow pred))))
  (slow (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S Z))))))))))))))))))))))))
`;

console.log(run(true, main));

// mem old commit: 35652931
// mem new commit: 35652929

//2384767
//2384765
