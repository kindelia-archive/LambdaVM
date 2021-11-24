import * as P from "./Parser.ts";
export * from "./Parser.ts"

// Types
// =====

// Term
// ----

export type Term
  = {$: "Var", name: string}
  | {$: "Dup", nam0: string, nam1: string, expr: Term, body: Term}
  | {$: "Let", name: string, expr: Term, body: Term}
  | {$: "Lam", name: string, body: Term}
  | {$: "App", func: Term, argm: Term}
  | {$: "Ctr", name: string, args: Array<Term>}
  | {$: "Cal", func: string, args: Array<Term>}

// Type
// ----

export type Type
  = {$: "Type", name: string, ctrs: Array<{name: string, args: Array<string>}>}

// Bond
// ----

export type Match
  = {$: "Case", expr: string, cses: Array<{name: string, args: Array<string>, body: Match}>}
  | {$: "Body", expr: Term}

export type Bond
  = {$: "Bond", name: string, args: Array<string>, body: Match}

// File
// ----

export type Statement
  = {$: "NewBond", bond: Bond}
  | {$: "NewType", type: Type}

export type File
  = {$: "File", defs: Array<Statement>}

// Constructors
// ============

// Term
// ----

export function Var(name: string) : Term {
  return {$: "Var", name};
}

export function Dup(nam0: string, nam1: string, expr: Term, body: Term) : Term {
  return {$: "Dup", nam0, nam1, expr, body};
}

export function Let(name: string, expr: Term, body: Term) : Term {
  return {$: "Let", name, expr, body};
}

export function Lam(name: string, body: Term) : Term {
  return {$: "Lam", name, body};
}

export function App(func: Term, argm: Term) : Term {
  return {$: "App", func, argm};
}

export function Ctr(name: string, args: Array<Term>) : Term {
  return {$: "Ctr", name, args};
}

export function Cal(func: string, args: Array<Term>) : Term {
  return {$: "Cal", func, args};
}

// Type
// ----

export function Type(name: string, ctrs: Array<{name: string, args: Array<string>}>) : Type {
  return {$: "Type", name, ctrs};
}

// Bond
// ----

export function Case(expr: string, cses: Array<{name: string, args: Array<string>, body: Match}>) : Match {
  return {$: "Case", expr, cses};
}

export function Body(expr: Term) : Match {
  return {$: "Body", expr};
}

export function Bond(name: string, args: Array<string>, body: Match) : Bond {
  return {$: "Bond", name, args, body};
}

// File
// ----

export function NewBond(bond: Bond) : Statement {
  return {$: "NewBond", bond};
}

export function NewType(type: Type) : Statement {
  return {$: "NewType", type};
}

export function File(defs: Array<Statement>) : File {
  return {$: "File", defs};
}

// Stringifier
// ===========

// Term
// ----

export function show_term(term: Term): string {
  switch (term.$) {
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
    case "Let": {
      let name = term.name;
      let expr = show_term(term.expr);
      let body = show_term(term.body);
      return "let " + name + " = " + expr + " " + body;
    }
    case "Lam": {
      let name = term.name;
      let body = show_term(term.body);
      return "λ" + name + " " + body;
    }
    case "App": {
      let args = [];
      while (term.$ === "App") {
        args.push(show_term(term.argm));
        term = term.func;
      }
      let func = show_term(term);
      return "(" + func + " " + args.reverse().join(" ") + ")";
    }
    case "Ctr": {
      let name = term.name;
      let args = term.args.map(show_term);
      return name + "{" + args.join(" ") + "}";
    }
    case "Cal": {
      let func = term.func;
      let args = term.args.map(show_term);
      return func + "(" + args.join(" ") + ")";
    }
  }
  return "?";
}

// Type
// ----

export function show_type(type: Type): string {
  let ctrs = type.ctrs;
  let ctrs_str = [];
  for (var i = 0; i < ctrs.length; ++i) {
    let ctr = ctrs[i];
    let args = ctr.args;
    ctrs_str.push(ctr.name + "{" + args.join(", ") + "}");
  }
  return "type " + type.name + " { " + ctrs_str.join(" ") + " }";
}

// Bond
// ----

export function show_match(match: Match): string {
  switch (match.$) {
    case "Case": {
      let expr = match.expr;
      let cses = [];
      for (var i = 0; i < match.cses.length; ++i) {
        let {name, args, body} = match.cses[i];
        cses.push(name + "{" + args.join(",") + "}:" + show_match(body));
      }
      return "case " + expr + " { " + cses.join(" ") + " }";
    }
    case "Body": {
      return show_term(match.expr);
    }
  }
}

export function show_bond(bond: Bond): string {
  let args = bond.args;
  let body = show_match(bond.body);
  return "bond " + bond.name + "(" + args.join(", ") + "): { " + body + " }";
}

// File
// ----

export function show_file(file: File): string {
  let defs = file.defs;
  let text = "";
  for (var i = 0; i < defs.length; ++i) {
    let def = defs[i];
    switch (def.$) {
      case "NewBond": {
        text += show_bond(def.bond) + "\n";
        break;
      }
      case "NewType": {
        text += show_type(def.type) + "\n";
        break;
      }
    }
  }
  return text;
}

// Parser
// ======

// Term
// ----

export function parse_let() : P.Parser<Term | null> {
  return P.guard(P.match("let "), (state) => {
    var [state, skp0] = P.match("let ")(state);
    var [state, name] = P.name1(state);
    var [state, skp1] = P.consume("=")(state);
    var [state, expr] = parse_term()(state);
    var [state, body] = parse_term()(state);
    return [state, Let(name, expr, body)];
  });
}

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
    parse_let(),
    parse_dup(),
    parse_lam(),
    parse_app(),
    parse_ctr(),
    parse_cal(),
    parse_var(),
    (state) => {
      return [state, null];
    }
  ]);
}

// Type
// ----

export function parse_type() : P.Parser<Type | null> {
  return P.guard(P.match("type "), (state) => {
    var [state, skp0] = P.match("type ")(state);
    var [state, name] = P.name1(state);
    var [state, ctrs] = P.list(P.match("{"), P.match(","), P.match("}"), (state) => {
      var left : P.Parser<[string,string[]]> = P.call(P.match("{"), P.match(","), P.match("}"), P.name1, (x,y)=>[x,y]);
      var [state, [name,args]] = left(state);
      return [state, {name, args}];
    }, x => x)(state);
    return [state, Type(name, ctrs)];
  });
}

// Bond
// ----

export function parse_case() : P.Parser<Match | null> {
  return P.guard(P.match("case "), (state) => {
    var [state, skp0] = P.match("case ")(state);
    var [state, expr] = P.name1(state);
    var [state, cses] = P.list(P.match("{"), P.match(","), P.match("}"), (state) => {
      var left : P.Parser<[string,string[]]> = P.call(P.match("{"), P.match(","), P.match("}"), P.name1, (x,y)=>[x,y]);
      var [state, [name,args]] = left(state);
      var [state, skp0] = P.consume(":")(state);
      var [state, body] = parse_match()(state);
      return [state, {name, args, body}];
    }, x => x)(state);
    return [state, Case(expr, cses)];
  });
}

export function parse_body() : P.Parser<Match | null> {
  return (state) => {
    var [state, term] = parse_term()(state);
    return [state, Body(term)];
  }
};

export function parse_match() : P.Parser<Match> {
  return P.grammar("Match", [
    parse_case(),
    parse_body(),
  ]);
}

export function parse_bond() : P.Parser<Bond | null> {
  return P.guard(P.match("bond "), (state) => {
    var parse_call : P.Parser<[string,string[]]> = P.call(P.match("("), P.match(","), P.match(")"), P.name1, (x,y)=>[x,y])
    var [state, skp0] = P.match("bond ")(state);
    var [state, [name,args]] = parse_call(state);
    var [state, skp1] = P.consume("{")(state);
    var [state, body] = parse_match()(state);
    var [state, skp2] = P.consume("}")(state);
    return [state, Bond(name, args, body)];
  });
}

// File
// ----

export function parse_file() : P.Parser<File> {
  return (state) => {
    var [state, type] = parse_type()(state);
    if (type !== null) {
      var [state, file] = parse_file()(state);
      return [state, File([NewType(type)].concat(file.defs))];
    }
    var [state, bond] = parse_bond()(state);
    if (bond !== null) {
      var [state, file] = parse_file()(state);
      return [state, File([NewBond(bond)].concat(file.defs))];
    }
    var [state, done] = P.done(state);
    if (!done) {
      P.expected_type("definition")(state);
    }
    return [state, File([])];
  };
}
