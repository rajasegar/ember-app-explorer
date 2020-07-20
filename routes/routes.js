const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require("fs");

let bundles = {};

function transform(code) {
  const ast = parser.parse(code, {
    sourceType: "module",
  });

  traverse(ast, {
    CallExpression(p) {
      if (
        p.node.callee.object.name === "Router" &&
        p.node.callee.property.name === "map"
      ) {
        let mapCalls = p.node.arguments[0].body.body;
        let routeNames = mapCalls
          .filter((m) => m.type === "ExpressionStatement")
          .map((m) => m.expression.arguments[0].value);

        routeNames.forEach((r) => {
          bundles[r] = {
            files: [`**/templates/${r}/**/*.js`],
            routes: [r],
          };
        });
      }
    },
  });
}

exports.index = function (req, res) {
  const routerPath = "/Users/user/Code/freshsales/frontend/app/router.js";
  const code = fs.readFileSync(routerPath, "utf-8");
  transform(code);

  res.json(bundles);
};
