var calls = 0;

function T() {
  return {ctor: "T"};
}

function F() {
  return {ctor: "F"};
}

function O(pred) {
  return {ctor: "O", pred};
}

function I(pred) {
  return {ctor: "I", pred};
}

function E() {
  return {ctor: "E"};
}

function inc(n) {
  switch (n.ctor) {
    case "E":
      return [T(), E()];
    case "O":
      return [F(), I(n.pred)];
    case "I":
      var [carry, pred] = inc(n.pred);
      return [carry, O(pred)];
  }
}

function slow(next) {
  while (true) {
    var [carry, next] = inc(next);
    switch (carry.ctor) {
      case "T":
        return next;
      case "F":
        continue;
    }
  }
}

console.log(JSON.stringify(slow(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(O(E())))))))))))))))))))))))))))))));
