import * as P from "./Parser.ts";
export * from "./Parser.ts"

// Types
// -----

export type Term
  = {ctor: "Var", name: string}
  | {ctor: "Dup", nam0: string, nam1: string, expr: Term, body: Term}
  | {ctor: "Lam", name: string, body: Term}
  | {ctor: "App", func: Term, argm: Term}
  | {ctor: "Ctr", func: string, args: Array<Term>}
  | {ctor: "Cal", func: string, args: Array<Term>}

export type Case
  = {ctor: "Cse", func: string, args: Array<string>, body: Match}

export type Match
  = {ctor: "Mat", expr: string, cses: Array<Case>}
  | {ctor: "Ret", expr: Term}

export type Function
  = {ctor: "Fun", name: string, args: Array<string>, body: Match}

export type Constructor
  = {ctor: "Con", numb: number, name: string, args: Array<string>}

export type File
  = {ctor: "Fil", cons: Array<Constructor>, funs: Array<Function>}

// Term
// ----

export function Var(name: string) : Term {
  return {ctor: "Var", name};
}

export function Dup(nam0: string, nam1: string, expr: Term, body: Term) : Term {
  return {ctor: "Dup", nam0, nam1, expr, body};
}

export function Lam(name: string, body: Term) : Term {
  return {ctor: "Lam", name, body};
}

export function App(func: Term, argm: Term) : Term {
  return {ctor: "App", func, argm};
}

export function Ctr(func: string, args: Array<Term>) : Term {
  return {ctor: "Ctr", func, args};
}

export function Cal(func: string, args: Array<Term>) : Term {
  return {ctor: "Cal", func, args};
}

// Function
// ----

export function Cse(func: string, args: Array<string>, body: Match) : Case {
  return {ctor: "Cse", func, args, body};
}

export function Mat(expr: string, cses: Array<Case>) : Match {
  return {ctor: "Mat", expr, cses};
}

export function Ret(expr: Term) : Match {
  return {ctor: "Ret", expr};
}

export function Fun(name: string, args: Array<string>, body: Match) : Function {
  return {ctor: "Fun", name, args, body};
}

// File
// ----

export function Con(numb: number, name: string, args: Array<string>) : Constructor {
  return {ctor: "Con", numb, name, args};
}

export function Fil(cons: Array<Constructor>, funs: Array<Function>) : File {
  return {ctor: "Fil", cons, funs};
}

// Stringifier
// -----------

// Stringifies a term
export function show_term(term: Term): string {
  switch (term.ctor) {
    case "Var": {
      return term.name;
    }
    case "Dup": {
      let nam0 = term.nam0;
      let nam1 = term.nam1;
      let expr = show_term(term.expr);
      let body = show_term(term.body);
      return "dup " + nam0 + " " + nam1 + " = " + expr + " " + body;
    }
    case "Lam": {
      let name = term.name;
      let body = show_term(term.body);
      return "λ" + name + " " + body;
    }
    case "App": {
      let args = [];
      while (term.ctor === "App") {
        args.push(show_term(term.argm));
        term = term.func;
      }
      let func = show_term(term);
      return "(" + func + " " + args.reverse().join(" ") + ")";
    }
    case "Ctr": {
      let func = term.func;
      let args = term.args.map(show_term);
      return func + "{" + args.join(" ") + "}";
    }
    case "Cal": {
      let func = term.func;
      let args = term.args.map(show_term);
      return func + "(" + args.join(" ") + ")";
    }
  }
  return "?";
}

export function show_match(match: Match): string {
  switch (match.ctor) {
    case "Mat": {
      let expr = match.expr;
      let cses = [];
      for (var i = 0; i < match.cses.length; ++i) {
        let {func, args, body} = match.cses[i];
        cses.push(func + "{" + args.join(",") + "}:" + show_match(body));
      }
      return "case " + expr + " {" + cses.join(" ") + "}";
    }
    case "Ret": {
      return show_term(match.expr);
    }
  }
}

export function show_fun(fun: Function): string {
  let args = fun.args;
  let body = show_match(fun.body);
  return "fun " + fun.name + "(" + args.join(",") + "): " + body;
}

export function show_con(con: Constructor): string {
  var args = con.args;
  return "con " + con.numb + " " + con.name + "{" + args.join(",") + "}";
}

export function show_file(file: File): string {
  var cons = file.cons.map(show_con).join("\n");
  var func = file.funs.map(show_fun).join("\n");
  return cons + "\n" + func;
}

// Parser
// ------

export function parse_dup() : P.Parser<Term | null> {
  return P.guard(P.match("dup "), (state) => {
    var [state, skp0] = P.match("dup ")(state);
    var [state, nam0] = P.name1(state);
    var [state, nam1] = P.name1(state);
    var [state, skp1] = P.consume("=")(state);
    var [state, expr] = parse_term()(state);
    var [state, body] = parse_term()(state);
    return [state, Dup(nam0, nam1, expr, body)];
  });
}

export function parse_lam() : P.Parser<Term | null> {
  return P.guard(P.match("λ"), (state) => {
    var [state, skp0] = P.match("λ")(state);
    var [state, name] = P.name(state);
    var [state, body] = parse_term()(state);
    return [state, Lam(name, body)];
  });
}

export function parse_app() : P.Parser<Term | null> {
  return (state) => P.guard(P.match("("), P.list(
    P.match("("),
    P.match(","),
    P.match(")"),
    parse_term(),
    (args) => args.reduce((a,b) => App(a,b)),
  ))(state);
}

export function parse_ctr() : P.Parser<Term | null> {
  return (state) => P.guard(P.caller("{"), P.call(
    P.match("{"),
    P.match(","),
    P.match("}"),
    parse_term(),
    (name, args) => Ctr(name, args),
  ))(state);
}

export function parse_cal() : P.Parser<Term | null> {
  return (state) => P.guard(P.caller("("), P.call(
    P.match("("),
    P.match(","),
    P.match(")"),
    parse_term(),
    (name, args) => Cal(name, args),
  ))(state);
}

export function parse_var() : P.Parser<Term | null> {
  return (state) => {
    var [state, name] = P.name(state);
    if (name.length > 0) {
      return [state, Var(name)];
    } else {
      return [state, null];
    }
  };
}

export function parse_term() : P.Parser<Term> {
  return P.grammar("Term", [
    parse_dup(),
    parse_lam(),
    parse_app(),
    parse_ctr(),
    parse_cal(),
    parse_var(),
    (state) => {
      throw new Error("???");
      return [state, null];
    }
  ]);
}

export function parse_mat() : P.Parser<Match | null> {
  return P.guard(P.match("case "), (state) => {
    var [state, skp0] = P.match("case ")(state);
    var [state, expr] = P.name1(state);
    var [state, cses] = P.list(P.match("{"), P.match(","), P.match("}"), (state) => {
      var left : P.Parser<[string,string[]]> = P.call(P.match("{"), P.match(","), P.match("}"), P.name1, (x,y)=>[x,y]);
      var [state, [name,args]] = left(state);
      var [state, skp0] = P.consume(":")(state);
      var [state, body] = parse_match()(state);
      return [state, Cse(name, args, body)];
    }, x => x)(state);
    return [state, Mat(expr, cses)];
  });
}

export function parse_ret() : P.Parser<Match | null> {
  return (state) => {
    var [state, term] = parse_term()(state);
    return [state, Ret(term)];
  }
};

export function parse_match() : P.Parser<Match> {
  return P.grammar("Match", [
    parse_mat(),
    parse_ret(),
  ]);
}

export function parse_fun() : P.Parser<Function | null> {
  return P.guard(P.match("fun "), (state) => {
    var parse_call : P.Parser<[string,string[]]> = P.call(P.match("("), P.match(","), P.match(")"), P.name1, (x,y)=>[x,y])
    var [state, skp0] = P.match("fun ")(state);
    var [state, [name,args]] = parse_call(state);
    var [state, skp1] = P.consume(":")(state);
    var [state, body] = parse_match()(state);
    return [state, Fun(name, args, body)];
  });
}

export function parse_con() : P.Parser<Constructor | null> {
  return P.guard(P.match("con "), (state) => {
    var [state, skp0] = P.match("con ")(state);
    var [state, numb] = P.name1(state);
    var [state, name] = P.name1(state);
    var [state, args] = P.list(P.match("{"), P.match(","), P.match("}"), P.name1, x=>x)(state);
    return [state, Con(Number(numb), name, args)];
  });
}

export function parse_file() : P.Parser<File> {
  return (state) => {
    var [state, fun] = parse_fun()(state);
    if (fun !== null) {
      var [state, file] = parse_file()(state);
      return [state, {...file, funs: [fun].concat(file.funs)}];
    } else {
      var [state, con] = parse_con()(state);
      if (con !== null) {
        var [state, file] = parse_file()(state);
        return [state, {...file, cons: [con].concat(file.cons)}];
      } else {
        return [state, Fil([],[])];
      }
    }
  };
}
