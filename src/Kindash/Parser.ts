// Type
// ====

export type State = {code: string, index: number};

export type Parser<A> = (state: State) => [State, A];

// Monad
// =====

export function bind<A,B>(a_parser: Parser<A>, b_parser: (a: A) => Parser<B>): Parser<B> {
  return (state) => {
    var [state, a_value] = a_parser(state);
    return b_parser(a_value)(state);
  }
}

export function pure<A>(a: A): Parser<A> {
  return (state) => {
    return [state, a];
  }
}

// This kinda works but lowers the IQ of TypeScript's type checker by 87%
export function Parser<A,B>(fn: () => Generator<Parser<A>,B,A>) : Parser<B> {
  var gen = fn();
  return (state) => {
    var next = gen.next();
    while (!next.done) {
      var [state, value] = next.value(state);
      next = gen.next(value);
    }
    return pure(next.value)(state);
  }
}

export function* run<A>(a: any) {
  return (yield a) as A;
}

// Utils
// =====

export const get_state : Parser<State> = (state) => {
  return [state, state];
};

export function read<A>(parser: () => Parser<A>, code: string): A {
  var [state, value] = parser()({code, index: 0});
  return value;
}

// Skippers
// ========

export const skip_comment : Parser<boolean> = (state: State) => {
  var state = {...state};
  var skips = state.code.slice(state.index, state.index + 2) === "//";
  if (skips) {
    state.index += 2;
    while (state.index < state.code.length && !/\n/.test(state.code[state.index])) {
      state.index += 1;
    }
  }
  return [state, skips];
};

export const skip_spaces : Parser<boolean> = (state: State) => {
  var state = {...state};
  var skips = /\s/.test(state.code[state.index]);
  while (/\s/.test(state.code[state.index])) {
    state.index += 1;
  }
  return [state, skips];
};

export const skip : Parser<boolean> = (state: State) => {
  var [state, comment] = skip_comment(state);
  var [state, spaces] = skip_spaces(state);
  if (comment || spaces) {
    return [state, true];
  } else {
    return [state, false];
  }
};

// Strings
// =======

export function match_here(str: string) : Parser<boolean> {
  return (state) => {
    if (state.code.slice(state.index, state.index + str.length) === str) {
      return [{...state, index: state.index + str.length}, true];
    } else {
      return [state, false];
    }
  };
}

export function match(str: string) : Parser<boolean> {
  return (state) => {
    var [state, skipped] = skip(state);
    return match_here(str)(state);
  };
}

export function consume(str: string) : Parser<null> {
  return (state) => {
    var [state, matched] = match(str)(state);
    if (matched) {
      return [state, null];
    } else {
      var fail : Parser<null> = expected_string(str);
      return fail(state);
    }
  };
}

export const done : Parser<boolean> = (state) => {
  var [state, skipped] = skip(state);
  return [state, state.index === state.code.length];
};

// Blocks
// ======

export function guard<A>(head: Parser<boolean>, body: Parser<A>) : Parser<A|null> {
  return (state) => {
    var [state, skipped] = skip(state);
    var [state, matched] = dry(head)(state);
    if (matched) {
      return body(state);
    } else {
      return [state, null];
    }
  };
}

export function grammar<A>(name: string, choices: Array<Parser<A|null>>) : Parser<A> {
  return (state) => {
    for (var i = 0; i < choices.length; ++i) {
      var [state, got] = choices[i](state);
      if (got) {
        return [state, got];
      }
    }
    var fail : Parser<A> = expected_type(name);
    return fail(state);
  };
}

// Combinators
// ===========

export function dry<A>(parser: Parser<A>): Parser<A> {
  return (state) => {
    var [_, result] = parser(state);
    return [state, result];
  };
}

export function until<A>(delim: Parser<boolean>, parser: Parser<A>): Parser<Array<A>> {
  return (state) => {
    var [state, delimited] = delim(state);
    if (delimited) {
      return [state, []];
    } else {
      var [state, a] = parser(state);
      var [state, b] = until(delim, parser)(state);
      return [state, [a].concat(b)];
    }
  };
}

export function list<A,B>(
  open  : Parser<boolean>,
  sep   : Parser<boolean>,
  close : Parser<boolean>,
  elem  : Parser<A>,
  make  : (x: Array<A>) => B,
) : Parser<B> {
  return (state) => {
    var [state, skp] = open(state);
    var [state, arr] = until(close, (state) => {
      var [state, val] = elem(state);
      var [state, skp] = sep(state);
      return [state, val];
    })(state);
    return [state, make(arr)];
  };
}

export function caller(open: string) : Parser<boolean> {
  return (state) => {
    var [state, nam] = name_here(state);
    var [state, got] = match_here(open)(state);
    return [state, nam.length > 0 && got];
  };
};

export function call<A,B>(
  open  : Parser<boolean>,
  sep   : Parser<boolean>,
  close : Parser<boolean>,
  elem  : Parser<A>,
  make  : (x: string, y: Array<A>) => B,
) : Parser<B> {
  return (state) => {
    var [state, nam] = name1(state);
    var [state, skp] = open(state);
    var [state, arr] = until(close, (state) => {
      var [state, val] = elem(state);
      var [state, skp] = sep(state);
      return [state, val];
    })(state);
    return [state, make(nam, arr)];
  };
}

// Name
// ====

export const name_here : Parser<string> = (state) => {
  var state = {...state};
  var name = "";
  while (state.index < state.code.length && /[a-zA-Z0-9_.]/.test(state.code[state.index])) {
    name += state.code[state.index];
    state.index += 1;
  }
  return [state, name];
}

export const name : Parser<string> = (state) => {
  var [state, skipped] = skip(state);
  return name_here(state);
}

export const name1 : Parser<string> = (state) => {
  var [state, name1] = name(state);
  if (name1.length > 0) {
    return [state, name1];
  } else {
    var fail : Parser<string> = expected_type("name");
    return fail(state);
  }
}

// Errors
// ======

export function expected_string<A>(str: string): Parser<A> {
  return (state) => {
    throw "Expected '" + str + "':\n" + highlight(state.index, state.index + str.length, state.code);
  }
}

export function expected_type<A>(name: string): Parser<A> {
  return (state) => {
    throw "Expected '" + name + "':\n" + highlight(state.index, state.index + 1, state.code);
  }
}

export function highlight(from_index: number, to_index: number, code: string): string {
  var open = "«";
  var close = "»";
  var open_color = "\x1b[4m\x1b[31m";
  var close_color = "\x1b[0m";
  var from_line = 0;
  var to_line = 0;
  for (var i = 0; i < from_index; ++i) {
    if (code[i] === "\n") ++from_line;
  }
  for (var i = 0; i < to_index; ++i) {
    if (code[i] === "\n") ++to_line;
  }
  var colored = code.slice(0, from_index) + open + code.slice(from_index, to_index) + close + code.slice(to_index);
  var lines = colored.split("\n");
  var block_from_line = Math.max(from_line-3,0);
  var block_to_line = Math.min(to_line+3,lines.length);
  var lines = lines.slice(block_from_line, block_to_line);
  var text = "";
  for (var i = 0; i < lines.length; ++i) {
    var numb = block_from_line + i;
    var line = lines[i] + "\n";
    if (numb === from_line && numb === to_line) {
      line = line.slice(0,line.indexOf(open)) + open_color + line.slice(line.indexOf(open), line.indexOf(close)+1) + close_color + line.slice(line.indexOf(close)+1);
    } else if (numb === from_line) {
      line = line.slice(0,line.indexOf(open)) + open_color + line.slice(line.indexOf(open)) + close_color;
    } else if (numb > from_line && numb < to_line) {
      line = open_color + line + close_color;
    } else if (numb === to_line) {
      line = open_color + line.slice(0,line.indexOf(close)+1) + close_color + line.slice(line.indexOf(close)+1);
    }
    line = ("    "+numb).slice(-4) + " | " + line;
    text += line;
  }
  return text;
}

// Tests
// =====

type StrBinTree = [StrBinTree, StrBinTree] | string

const sbt : Parser<StrBinTree> = (state) => {
  const sbt_node : Parser<StrBinTree|null> = guard(match("("), Parser(function*() {
    yield* run(consume("("));
    var lft = yield* run(sbt);
    var rgt = yield* run(sbt);
    yield* run(consume(")"));
    return [lft, rgt];
  }));
  const sbt_name : Parser<StrBinTree|null> = guard(match(""), Parser(function*() {
    return yield* run(name);
  }));
  return grammar("StrBinTree", [sbt_node, sbt_name])(state);
}

function sbt_test() {
  var code = "(this ((is surely) (((a proper) string) (binary tree))))";
  console.log(JSON.stringify(sbt({code,index:0})));
}

//console.log(sbt_test());
