import * as K from "./Runtime.ts";
export * from "./Runtime.ts"

// Utils
// -----

export function pad(str : string, len : number) {
  while (str.length < len) {
    str = " " + str;
  }
  return str.slice(-len);
}

// Stringifier
// -----------

export function show_tag(tag: K.Tag) {
  switch (tag) {
    case K.LAM: return "LAM";
    case K.APP: return "APP";
    case K.PAR: return "PAR";
    case K.DP0: return "DP0";
    case K.DP1: return "DP1";
    case K.VAR: return "VAR";
    case K.ARG: return "ARG";
    case K.NIL: return "NIL";
    case K.CTR: return "CTR";
    case K.CAL: return "CAL";
    case K.FRE: return "FRE";
  }
}

export function show_lnk(lnk: K.Lnk) {
  return show_tag(K.get_tag(lnk)) + ":" + K.get_loc(lnk,0) + "[" + K.get_ex0(lnk) + "," + K.get_ex1(lnk) + "]";
}

export function show_mem(mem: K.Mem) {
  var text = "";
  for (var i = 0; i < mem.lnk.size; ++i) {
    var lnk = K.array_read(mem.lnk, i);
    if (lnk !== 0) {
      text += pad(String(i),4) + " | " + show_lnk(lnk) + "\n";
    }
  }
  return text;
}

export function show_term(MEM: K.Mem, term: K.Lnk) : string {
  var lets : {[key:string]:number} = {};
  var kinds : {[key:string]:number} = {};
  var names : {[key:string]:string} = {};
  var count = 0;
  function find_lets(term: K.Lnk) {
    switch (K.get_tag(term)) {
      case K.LAM:
        names[K.get_loc(term,0)] = String(++count);
        find_lets(K.get_lnk(MEM, term, 1));
        break;
      case K.APP:
        find_lets(K.get_lnk(MEM, term, 0));
        find_lets(K.get_lnk(MEM, term, 1));
        break;
      case K.PAR:
        find_lets(K.get_lnk(MEM, term, 0));
        find_lets(K.get_lnk(MEM, term, 1));
        break;
      case K.DP0:
        if (!lets[K.get_loc(term,0)]) {
          names[K.get_loc(term,0)] = String(++count);
          kinds[K.get_loc(term,0)] = K.get_ex0(term);
          lets[K.get_loc(term,0)] = K.get_loc(term,0);
          find_lets(K.get_lnk(MEM, term, 2));
        }
        break;
      case K.DP1:
        if (!lets[K.get_loc(term,0)]) {
          names[K.get_loc(term,0)] = String(++count);
          kinds[K.get_loc(term,0)] = K.get_ex0(term);
          lets[K.get_loc(term,0)] = K.get_loc(term,0);
          find_lets(K.get_lnk(MEM, term, 2));
        }
        break;
      case K.CTR:
      case K.CAL:
        var arity = K.get_ex1(term);
        for (var i = 0; i < arity; ++i) {
          find_lets(K.get_lnk(MEM, term,i));
        }
        break;
    }
  }
  function go(term: K.Lnk) : string {
    switch (K.get_tag(term)) {
      case K.LAM: {
        var name = "x" + (names[K.get_loc(term,0)] || "?");
        return "λ" + name + " " + go(K.get_lnk(MEM, term, 1));
      }
      case K.APP: {
        let func = go(K.get_lnk(MEM, term, 0));
        let argm = go(K.get_lnk(MEM, term, 1));
        return "(" + func + " " + argm + ")";
      }
      case K.PAR: {
        let kind = K.get_ex0(term);
        let func = go(K.get_lnk(MEM, term, 0));
        let argm = go(K.get_lnk(MEM, term, 1));
        return "&" + kind + "<" + func + " " + argm + ">";
      }
      case K.CTR: {
        let func = K.get_ex0(term);
        let arit = K.get_ex1(term);
        let args = [];
        for (let i = 0; i < arit; ++i) {
          args.push(go(K.get_lnk(MEM, term, i)));
        }
        return "$" + func + ":" + arit + "{" + args.join(" ") + "}";
      }
      case K.CAL: {
        let func = K.get_ex0(term);
        let arit = K.get_ex1(term);
        let args = [];
        for (let i = 0; i < arit; ++i) {
          args.push(go(K.get_lnk(MEM, term, i)));
        }
        return "@" + func + ":" + arit + "(" + args.join(" ") + ")";
      }
      case K.DP0: {
        return "a" + (names[K.get_loc(term,0)] || "?");
      }
      case K.DP1: {
        return "b" + (names[K.get_loc(term,0)] || "?");
      }
      case K.VAR: {
        return "x" + (names[K.get_loc(term,0)] || "?");
      }
    }
    return "?" + show_lnk(term);
  }
  find_lets(term);
  var text = "";
  for (var key in lets) {
    var pos = lets[key];
    var kind = kinds[key] || 0;
    var name = names[pos] || "?";
    text += "!" + kind + "<a"+name+" b"+name+"> = " + go(K.deref(MEM, pos + 2)) + ";\n";
  }
  text += go(term);
  return text;
}

// Parser
// ------

export function read_term(code: string) : K.Mem {
  //K.PARSING = true;
  var lams  : K.MAP<number> = {};
  var let0s : K.MAP<number> = {};
  var let1s : K.MAP<number> = {};
  var tag0s : K.MAP<number> = {};
  var tag1s : K.MAP<number> = {};
  var vars  : Array<[string,number]> = [];

  function build() {
    for (var [var_name, var_pos] of vars) {
      var lam = lams[var_name]
      if (lam !== undefined) {
        K.link(MEM, var_pos, K.lnk(K.VAR,0,0,lam));
      }
      var let0 = let0s[var_name]
      if (let0 !== undefined) {
        K.link(MEM, var_pos, K.lnk(K.DP0,tag0s[var_name]||0,0,let0));
      }
      var let1 = let1s[var_name]
      if (let1 !== undefined) {
        K.link(MEM, var_pos, K.lnk(K.DP1,tag1s[var_name]||0,0,let1));
      }
    }
  }

  function skip() {
    while (code[0] === " " || code[0] === "\n") {
      code = code.slice(1);
    }
  }

  function parse_name() : string {
    skip();
    var name = "";
    while ("a" <= code[0] && code[0] <= "z"
        || "A" <= code[0] && code[0] <= "Z"
        || "0" <= code[0] && code[0] <= "9"
        || "_" === code[0]
        || "." === code[0]) {
      name += code[0];
      code = code.slice(1);
    }
    return name;
  }

  function consume(str: string) {
    skip();
    if (code.slice(0, str.length) === str) {
      return code.slice(str.length);
    } else {
      throw "Bad parse: " + str;
    }
  }

  function parse_numb(): number {
    if (/[0-9]/.test(code[0])) {
      var num = "";
      while (/[0-9]/.test(code[0])) {
        num += code[0];
        code = code.slice(1);
      }
      return Number(num);
    } else {
      return Number(0);
    }
  }

  function parse_term(local: number) : K.Lnk {
    skip();
    var node = 0;
    switch (code[0]) {
      case "λ": 
        code = consume("λ");
        node = K.alloc(MEM, 2);
        var name = parse_name();
        var body = parse_term(node + 1);
        K.link(MEM, node+0, K.lnk(K.NIL,0,0,0));
        K.link(MEM, node+1, body);
        lams[name] = node;
        return K.lnk(K.LAM, 0, 0, node);
      case "(":
        code = consume("(");
        node = K.alloc(MEM, 2);
        var func = parse_term(node + 0);
        var argm = parse_term(node + 1);
        code = consume(")");
        K.link(MEM, node+0, func);
        K.link(MEM, node+1, argm);
        return K.lnk(K.APP, 0, 0, node);
      case "&":
        code = consume("&");
        var col = parse_numb();
        code = consume("<");
        code = consume(">");
        node = K.alloc(MEM, 2);
        var val0 = parse_term(node + 0);
        var val1 = parse_term(node + 1);
        K.link(MEM, node+0, val0);
        K.link(MEM, node+1, val1);
        skip();
        return K.lnk(K.PAR, col, 0, node);
      case "!":
        code = consume("!");
        var col = parse_numb();
        code = consume("<");
        var nam0 = parse_name();
        var nam1 = parse_name();
        code = consume(">");
        code = consume("=");
        node = K.alloc(MEM, 3);
        var expr = parse_term(node + 2);
        code = consume(";");
        var body = parse_term(local);
        K.link(MEM, node+0, K.lnk(K.NIL, 0, 0, 0));
        K.link(MEM, node+1, K.lnk(K.NIL, 0, 0, 0));
        K.link(MEM, node+2, expr);
        let0s[nam0] = node;
        tag0s[nam0] = col;
        let1s[nam1] = node;
        tag1s[nam1] = col;
        return body;
      // $0{1 2 3}
      case "$":
        code = consume("$");
        var func = parse_numb();
        code = consume(":");
        var arit = parse_numb();
        code = consume("{");
        var node = K.alloc(MEM, arit);
        var args = [];
        for (var i = 0; i < arit; ++i) {
          args.push(parse_term(node + i));
        }
        code = consume("}");
        for (var i = 0; i < arit; ++i) {
          K.link(MEM, node+i, args[i]);
        }
        return K.lnk(K.CTR, func, arit, node);
      // @0(1 2 3)
      case "@":
        code = consume("@");
        var func = parse_numb();
        code = consume(":");
        var arit = parse_numb();
        code = consume("(");
        var node = K.alloc(MEM, arit);
        var args = [];
        for (var i = 0; i < arit; ++i) {
          args.push(parse_term(node + i));
        }
        code = consume(")");
        for (var i = 0; i < arit; ++i) {
          K.link(MEM, node+i, args[i]);
        }
        return K.lnk(K.CAL, func, arit, node);
      default:
        var name = parse_name();
        var vari = K.lnk(K.NIL,0,0,0);
        vars.push([name, local]);
        return vari;
    }
  }

  var MEM = K.init();
  var root = parse_term(0);
  K.link(MEM, 0, root);
  build();
  return MEM;
}
