function main() {
  let S = n => z => s => s(n);
  let Z = z => s => z;
  let Y = f => (r => r(r))(r => f(x => r(r)(x)));
  let slow = Y(slow => n =>
    (n
      (x => x)
      (pred => {
        let rec = x => x(slow(pred));
        return rec(x => x)(rec(x => x));
      })));
  return slow(
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
  )(0);
};

console.log(main());
