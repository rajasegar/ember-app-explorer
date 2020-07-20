const walkSync = require("walk-sync");
const { transform } = require("ember-template-recast");
const fse = require("fs-extra");
const { uniq, sort, symmetricDifference } = require("ramda");
const path = require("path");

console.log("namespace components");

const ignoreList = [
  "action",
  "if",
  "t",
  "component",
  "link-to",
  "partial",
  "each",
  "unless",
];
const componentsFromAddon = ["ember-wormhole", "svg-jar", "power-select"];
const allComponents = walkSync(
  "/Users/user/Code/freshsales/frontend/app/components",
  { directories: false }
)
  .filter((f) => f.includes("component.js"))
  .map((f) => f.replace("/component.js", ""));

function isValidComponent(name) {
  return (
    !ignoreList.includes(name) &&
    !name.includes(".") &&
    !componentsFromAddon.includes(name) &&
    allComponents.includes(name)
  );
}

async function findComponents(file) {
  let components = [];
  await fse.readFile(file, "utf-8").then((data) => {
    // console.log(data);
    transform(data, () => {
      return {
        BlockStatement(node) {
          if (isValidComponent(node.path.original)) {
            components.push(node.path.original);
          }
          return node;
        },

        MustacheStatement(node) {
          if (isValidComponent(node.path.original)) {
            components.push(node.path.original);
          }
          return node;
        },
      };
    });
  });

  return components;
}

// to enable deep level flatten use recursion with reduce and concat
function flatDeep(arr, d = 1) {
  return d > 0
    ? arr.reduce(
        (acc, val) =>
          acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val),
        []
      )
    : arr.slice();
}

function findComponentsinRoute(route) {
  const templatePath = "/Users/user/Code/freshsales/frontend/app/templates";
  const dirs = walkSync(`${templatePath}/${route}`, {
    directories: false,
    includeBasePath: true,
  });

  let p = dirs.map((file) => {
    return findComponents(file).then((data) => {
      return uniq(data);
    });
  });

  return Promise.all(p).then((values) => {
    let value = sort(
      (a, b) => a.localeCompare(b),
      uniq(flatDeep(values, Infinity))
    );
    console.log(value.join("\n"));
    fse.outputFile(`${route}.txt`, value.join("\n"));
    return value;
  });
}

//const accComponents = findComponentsinRoute('accounts');
//const dealsComponents = findComponentsinRoute('deals');

//findComponentsinRoute('leads');
//findComponentsinRoute('contacts');
//findComponentsinRoute('settings');

//Promise.all([accComponents, dealsComponents]).then(values => {
//console.log(symmetricDifference(values[0], values[1]));
//});
