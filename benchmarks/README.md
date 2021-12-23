Benchmarks
==========

These benchmarks compare JavaScript V8, Haskell GHC and Lambolt λVM. Right now,
we just have some micro-benchmarks, tested on my Macbook Pro M1. We will soon
update this repository to include real-world examples, and a proper benchmark
suite that 1. performs multiple runs, 2. creates a chart for varying input
sizes. Note that this is a very early, non-optimized, version of λVM, and
several improvements are on the workings.

### Running

We run JavaScript with Node.js, Haskell with GHC (`-O2` flag) and Lambolt (with
the `clang` back-end).

* JavaScript: `time node file.js`

* Haskell: `ghc -O2 file.hs -o file; time ./file`

* Lambolt: `time lam file.bolt c` 

Results
=======

BinRec
------

A micro-benchmark that performs a binary recursion with a given depth, with no
sharing at all. As such, its complexity is exponential, and it essentially just
tests the raw performance of recursive calls alone. Its Haskell code is:

```haskell
slow E        = 1
slow (O pred) = slow pred + slow pred
slow (I pred) = slow pred + slow pred
```

Benchmarking 8 parallel calls, with input size of 26, I get these results:

```
JavaScript : 4.449s
Haskell    : 5.938s
Lambolt    : 5.889s
```

On my machine, Lambolt ran as fast as Haskell, but only because it used 4 cores.
Running in a single thread, it is ~4x slower. We want to improve that number!

LetLam
------

A micro-benchmark that performs a binary recursion with a given depth, except we
copy the intermediate result using a `let` expression, hiding it under a
λ-binder. This tests whether the runtime is capable of sharing computations
inside lambdas. If it is, then the complexity is linear; otherwise, then it is
exponential, and the runtime isn't optimal. Its Haskell code is:

```haskell
slow Z     = 1
slow (S n) =
  let k = \x -> x (slow n)
  in k (\x->x) + k (\x->x)
```

Benchmarking a single call, with input size of 28, I get these results:

```
JavaScript : 8.890s
Haskell    : 3.305s
Lambolt    : 0.048s
```

On my machine, Haskell and JavaScript both take a long time, while Lambolt is
instantaneous. That's because neither Haskell nor JavaScript runtimes can share
computations inside λ-binders, which means they, unlike Lambolt, they are not
optimal λ-calculus evaluators. Since Lambolt is, the complexity of `slow` is
linear, rather than exponential.

TailCall
--------

This micro-benchmark tests whether a runtime is capable of avoiding stack
overflow when performing tail calls, as well as the resulting preformance. Its
Haskell code is:

```haskell
loop :: Word32 -> Word32
loop 0 = 42
loop n = loop (n - 1)
```

With `1000000000` as the input, I got the following results:

```
JavaScript : stack overflow
Haskell    : 0.896s
Lambolt    : 9.924s
```

Haskell outperforms Lambolt, because it compiles to a tight, allocation-free
loop. While Lambolt doesn't suffer from stack overflows, it does alloc (and
immediately collect) memory in that case, which makes it considerably slower. We
must aim to avoid these intermediat allocations.

More benchmarks
---------------

Coming soon...
