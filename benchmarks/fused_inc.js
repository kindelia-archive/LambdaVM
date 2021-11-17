var NOT = b => t => f => b(f)(t)
var EXP = a => b => b(a)
var ODD = n => n(NOT)(t => f => f)

let A = S => Z => S(S(S(Z)))
let B = S => Z => S(S(S(Z)))

console.log(ODD(EXP(A)(B))(true)(false));
