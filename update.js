const fs = require("fs-extra");
const path = "./node_modules/@egjs";

fs.removeSync("./dist");
fs.readdirSync(path).reduce((acc, file) => {
    return acc.then(fs.copy(`${path}/${file}/dist`, `./dist/${file}`));
  }, Promise.resolve())
.then(() => {
  console.log("all egjs modules are moved!!!");
});