const T = (x) => x;
const Z = () => ({ctor: "Z"});
const S = (pred) => ({ctor: "S", pred});

function slow(x) {
  switch (x.ctor) {
    case "Z":
      return x => x;
    case "S":
      var pred = x.pred
      return (slow(pred))(slow(pred));
  }
}

function main() {
  return [
    slow(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(Z())))))))))))))))))))))))))))(0),
    slow(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(Z())))))))))))))))))))))))))))(0),
    slow(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(Z())))))))))))))))))))))))))))(0),
    slow(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(S(Z())))))))))))))))))))))))))))(0),
  ]
};

console.log(main());
