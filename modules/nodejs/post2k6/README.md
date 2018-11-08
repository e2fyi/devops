# `@e2fyi/post2k6`

A quick hack to generate [`k6`](https://github.com/loadimpact/k6) scripts
from [`postman`](https://www.getpostman.com/) collections _v1_ because
[`postman-to-k6`](https://github.com/loadimpact/postman-to-k6) does not
support _v1_.

More details in [documentation](https://e2fyi.github.io/devops/modules/nodejs/post2k6/)

> TODO:
>
> - Properly parse all data fields in v1 collection
> - Support methods other than GET and POST

## Usage

`@e2fyi/post2k6` provides a cli `post2k6` if installed globally.

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

> NOTES:
>
> If a template is provided, the mustache variable `{{request}}` should mark
> the location where the generated k6 http request should be.
>
> If the template is not provided, the following default template will be used:
>
> ```js
> import http from "k6/http";
> import { check, sleep } from "k6";
>
> export default function() {
>   let res = {{request}}
>   check(res, {
>     "status was 200": (r) => r.status == 200,
>     "transaction time OK": (r) => r.timings.duration < 200
>   });
>   sleep(1);
> };
> ```

## References

Postman collection schemas

- https://schema.getpostman.com/json/collection/v1.0.0/collection.json
- https://schema.getpostman.com/json/collection/v2.0.0/collection.json
