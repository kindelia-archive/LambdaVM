function F(n) {
  return n(x => x)(pred => (F(pred))(F(pred)));
}

let Z = z => s => z
let S = n => z => s => s(n)

console.log(
  F(
    S(S(S(S(
    S(S(S(S(
    S(S(S(S(
    S(S(S(S(
    S(S(S(S(
    S(S(S(S(
    Z
    ))))
    ))))
    ))))
    ))))
    ))))
    ))))
  )(0)
);
