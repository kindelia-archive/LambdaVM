function loop(n) {
  if (n === 0) {
    return 42;
  } else {
    return loop(n - 1);
  }
}

console.log(loop(1000000000));

