const S = x => ["S", x];
const Z = x => ["Z"];

let slow = n => {
  switch (n[0]) {
    case "Z":
      return 1;
    case "S":
      let rec = x => x(slow(n[1]));
      return rec(x => x) + rec(x => x);
  }
};

console.log(slow(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(Z()))))))))))))))))))))))))))))));
