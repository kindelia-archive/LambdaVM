# CaseCrusher

A next-gen, massively parallel, beta-optimal functional runtime.

## Installing

1. [Install Deno.js](https://deno.land/manual/getting_started/installation)

2. Paste this command to install `CaseCrusher`:

```bash
deno --unstable install -n crush --allow-all https://raw.githubusercontent.com/kindelia/CaseCrusher/master/src/main.ts
```

3. Create a [Lambolt](https://github.com/kindelia/lambolt) file:

```javascript
// main.bolt

type Nat {
  zero{}
  succ{pred}
}

bond double(n) {
  case n {
    zero{}:
      zero{}
    succ{pred}:
      succ{succ{double(pred)}}
  }
}

bond main() {
  double(succ{succ{zero{}}})
}
```

4. Crush it:

```bash
crush main.bolt
```
