# LamRT

A next-gen, massively parallel, beta-optimal functional runtime.

## Installing

1. [Install Deno.js](https://deno.land/manual/getting_started/installation)

2. Clone this repository:

    ```
    git clone https://github.com/kindelia/lamrt
    ```

3. Install LamRT:

    ```bash
    deno --unstable install -n lam --allow-all ./lamrt/src/main.ts
    ```

4. Create a [Lambolt](https://github.com/kindelia/lambolt) file:

    ```javascript
    // Doubles a natural number
    (double (zero))   = (zero)
    (double (succ x)) = (succ (succ (double x)))

    // Computes 2 * 2
    (main) = (double (succ (succ (succ (zero)))))
    ```

5. Run it:

    With the JavaScript runtime:

    ```bash
    lam main.bolt
    ```

    With the C runtime (requires `clang`):

    ```bash
    lam main.bolt c
    ```

## Benchmarks

Check the [benchmarks](benchmarks) directory.
