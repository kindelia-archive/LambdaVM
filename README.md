# CaseCrusher

An optimal functional runtime.

## Installing

1. [Install Deno.js](https://deno.land/manual/getting_started/installation)

2. Paste this command to install `CaseCrusher`:

```bash
deno --unstable install -n crush --allow-all https://raw.githubusercontent.com/taelin-org/CaseCrusher/master/src/CLI.ts
```

3. Create a Kindash file:

```javascript
// main.kindash

con 0 zero{}
con 1 succ{pred}

fun double(n):
  case n {
    zero{}: zero{}
    succ{pred}: succ{succ{double(pred)}}
  }

fun main(): 
  double(succ{succ{succ{zero{}}}})
```

4. Crush it:

```bash
crush main.kindash
```
