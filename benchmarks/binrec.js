const O = x => ["O", x];
const I = x => ["I", x];
const E = x => ["E"];

const slow = x => {
  switch (x[0]) {
    case "E": return 1;
    case "O": return slow(x[1]) + slow(x[1]);
    case "I": return slow(x[1]) + slow(x[1]);
  }
}

console.log([
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(E()))))))))))))))))))))))))))),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(E()))))))))))))))))))))))))))),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(E()))))))))))))))))))))))))))),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(E()))))))))))))))))))))))))))),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(O(E()))))))))))))))))))))))))))),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(O(I(E()))))))))))))))))))))))))))),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(O(E()))))))))))))))))))))))))))),
  slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(I(I(I(E()))))))))))))))))))))))))))),
]);
