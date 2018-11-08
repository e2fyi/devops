#!/usr/bin/env node
/**
 node script for cli commands to convert postman collection to k6 scripts.
 @example
 ```bash
 post2k6 somecollection.json -r "host=example.com" --tags "group=dev" -o ./scripts
 ```

```
usage: post2k6 [-h] [-v] [-t TEMPLATE] [-r REPLACE] [--tags TAGS] [-o OUTDIR]
               postman

Generate k6 scripts from postman with the provided k6 templates.

Positional arguments:
  postman               path to postman collection JSON.

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -t TEMPLATE, --template TEMPLATE
                        path to k6 template. e.g. -t ./abc/template.json
  -r REPLACE, --replace REPLACE
                        mustache variables to replace. e.g. -r
                        'var1=abc;var2=efg'
  --tags TAGS           tags to add to k6 requests. e.g. --tags
                        'name=abc;group=efg'
  -o OUTDIR, --outdir OUTDIR
                        output directory for all the generated files. default
                        = './'
```
 */
import { readFileSync, writeFileSync } from "fs";
import { ArgumentParser } from "argparse";
import * as path from "path";
import * as mkdirp from "mkdirp";

import { IPostmanCollectionV1 } from "../interfaces/v1/postman.collection";
import { render, generateRequests } from "../index";

const { version } = require("../../package.json");

const defaultTemplate = `
import http from "k6/http";
import { check, sleep } from "k6";

export default function() {
  let res = {{request}}
  check(res, {
    "status was 200": (r) => r.status == 200,
    "transaction time OK": (r) => r.timings.duration < 200
  });
  sleep(1);
};`.trim();

const parser = new ArgumentParser({
  version,
  addHelp: true,
  description:
    "Generate k6 scripts from postman with the provided k6 templates."
});
parser.addArgument("postman", {
  help: "path to postman collection JSON."
});
parser.addArgument(["-t", "--template"], {
  help: "path to k6 template. e.g. -t ./abc/template.json"
});
parser.addArgument(["-r", "--replace"], {
  help: "mustache variables to replace. e.g. -r 'var1=abc;var2=efg'"
});
parser.addArgument(["--tags"], {
  help: "tags to add to k6 requests. e.g. --tags 'name=abc;group=efg'"
});
parser.addArgument(["-o", "--outdir"], {
  help: "output directory for all the generated files. default = './'",
  defaultValue: "./"
});

const { postman, template, replace, outdir, tags } = parser.parseArgs();

function toStringMap(value: string) {
  const results: { [key: string]: string } = {};
  value.split(";").map(s => {
    const [key, val] = s.split("=");
    results[key.trim()] = val.trim();
  });
  return results;
}

try {
  const mustache = replace ? toStringMap(replace) : {};
  const tagsMap = tags ? toStringMap(tags) : {};
  const collection = JSON.parse(
    readFileSync(postman, "utf8")
  ) as IPostmanCollectionV1;
  const tmpl = template ? readFileSync(template, "utf8") : defaultTemplate;
  const requests = generateRequests(collection, { mustache, tags: tagsMap });
  mkdirp(outdir, () => {
    requests.forEach(request => {
      const { uuid, rendered } = render(request, tmpl);
      const filename = path.join(outdir, `${uuid}.js`);
      writeFileSync(filename, rendered);
      console.log(`generated: ${filename}`);
    });
  });
} catch (error) {
  console.error(error);
}
