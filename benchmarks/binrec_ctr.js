function zero() {
  return {ctor: "Zero"};
}

function succ(pred) {
  return {ctor: "Succ", pred};
}

function slow(x) {
  switch (x.ctor) {
    case "Zero": return x => x;
    case "Succ": return (slow(x.pred))(slow(x.pred));
  }
}

console.log(slow(
  succ(succ(succ(succ(
  succ(succ(succ(succ(
  succ(succ(succ(succ(
  succ(succ(succ(succ(
  succ(succ(succ(succ(
  succ(succ(succ(succ(
  succ(succ(succ(succ(
    zero()
  ))))
  ))))
  ))))
  ))))
  ))))
  ))))
  ))))
)(0))
