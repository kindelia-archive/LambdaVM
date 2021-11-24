const T = (x) => x;

function F(n) {
  return n(x => x)(pred => { var id = F(pred); return id(id); });
}

function main() {
  let Z = z => s => z
  let S = n => z => s => s(n)
  return [
    F(S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (Z)))))))))))))))))))))))))(0),
    F(S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (Z)))))))))))))))))))))))))(0),
    F(S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (Z)))))))))))))))))))))))))(0),
    F(S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (S (Z)))))))))))))))))))))))))(0),
  ];
}

console.log(main());
