const O = x => ["O", x];
const I = x => ["I", x];
const E = x => ["E"];

const slow = x => {
  switch (x[0]) {
    case "E": return x => x;
    case "O": return (slow(x[1]))(slow(x[1]));
    case "I": return (slow(x[1]))(slow(x[1]));
  }
}

console.log([
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(E())))))))))))))))))))))))))))(0),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(E())))))))))))))))))))))))))))(1),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(E())))))))))))))))))))))))))))(2),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(E())))))))))))))))))))))))))))(3),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(O(E())))))))))))))))))))))))))))(4),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(I(E())))))))))))))))))))))))))))(5),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(O(E())))))))))))))))))))))))))))(6),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(I(E())))))))))))))))))))))))))))(7),
]);
