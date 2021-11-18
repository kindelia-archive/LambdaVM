var NOT = b => t => f => b(f)(t)
var EXP = a => b => b(a)
var ODD = n => n(NOT)(t => f => f)

var S = n => s => z => s(n(s)(z));

let A = S => Z => S(S(S(S(S(Z)))));
let B = S => Z => S(S(S(S(S(Z)))));

function to_num(lam_num) {
  return lam_num((x) => x + 1)(0);
}

function to_bool(lam_bool) {
  return lam_bool(true)(false);
}

console.log(to_bool(ODD(EXP(A)(B))));
