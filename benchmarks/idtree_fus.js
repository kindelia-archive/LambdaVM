function main() {

  let slow = n => {
    if (n === 0) {
      return true;
    } else {
      let rec = x => x(slow(n - 1));
      return rec(x => x) && rec(x => x);
    }
  };

  return slow(28);
};

console.log(main());
