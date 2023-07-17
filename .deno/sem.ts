import * as semver from "https://deno.land/std@0.194.0/semver/mod.ts";

const v = semver.parse("v1.2.3");
const up = semver.increment(v, "major");
console.log(up);
console.log(semver.format(up))


Deno.writeTextFileSync("../CHANGELOG.md", semver.format(up));
