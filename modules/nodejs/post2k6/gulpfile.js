const gulp = require("gulp");
const typedoc = require("gulp-typedoc");

gulp.task("docs", function() {
  return gulp.src(["src/**/*.ts"]).pipe(
    typedoc({
      module: "commonjs",
      target: "es5",
      mode: "modules",
      out: "docs/",
      name: "@e2fyi/post2k6",
      excludeExternals: true,
      includeDeclarations: false,
      theme: "minimal"
    })
  );
});
