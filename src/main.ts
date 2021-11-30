import * as API from "./API.ts"

var path = Deno.args[0];

if (path) {
  var file = Deno.readTextFileSync("./" + path);
  var targ = Deno.args[1] || "ts";
  API.run(file, {target: targ});
} else {
  console.log("Usage: lam file.bolt");
}
