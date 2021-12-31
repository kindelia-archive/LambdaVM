export type Lnk = bigint // U52 in JS, U64 in C

export type Arr = {size: number, data: BigUint64Array};
export type Mem = Arr;

export type Page = {
  match: Array<number>,
  rules: Array<{
    test: Array<Lnk>, 
    clrs: Array<number>,
    cols: Array<Lnk>,
    root: Lnk,
    body: Array<Lnk>,
  }>
}

export type Book = {[fun:string]: Page};

// namespace Lambolt {
//   type Rule = {$: "Rule", lhs: Term, rhs: Term}
// }
