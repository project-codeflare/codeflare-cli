/* eslint-disable @typescript-eslint/no-var-requires */

const dashdash = require("yargs-parser")(require("fs").readFileSync(process.argv[2]).toString())._
console.log(
  `['${dashdash[0]}'` + dashdash.slice(1).reduce((S, e) => S + `, '${e.replace(/^'(.+)'$/, "$1")}'`, "") + "]"
)
