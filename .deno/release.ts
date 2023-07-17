import * as semver from "https://deno.land/std@0.194.0/semver/mod.ts";

// const pathPackage = "./../Packages/EasyHttpRPC/package.json";
// const {default: p} = await import(pathPackage, {assert: {type: "json"}});
// console.log(semver.format(semver.parse(p.version)));

function executeGit(args: string[]): Promise<CommandOutput> {
    const command = new Deno.Command("git", {args: args});
    return command.output();
}


const last_tag = Deno.env.get("LAST_TAG");
const owner = Deno.env.get("OWNER");
const repo = Deno.env.get("REPO");
const token = Deno.env.get("GITHUB_TOKEN");

// 作成されるであろうリリースノートを取得
const dataMayRelease = {
    owner: owner,
    repo: repo,
    tag_name: "v100.0.0",
    target_commitish: "main",
    previous_tag_name: last_tag,
};

const responseMayRelease = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/generate-notes`, {
    method: "POST",
    headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(dataMayRelease),
},);

const mayRelease = await responseMayRelease.json().body;
console.log(mayRelease);

let increment = "";
const arrayMajor = ["### Removed",];
const arrayMinor = ["### Added", "### Changed", "### Deprecated",];
const arrayPatch = ["### Fixed", "### Security"];
if (arrayMajor.some(v => mayRelease.includes(v))) {
    increment = "major";
} else if (arrayMinor.some(v => mayRelease.includes(v))) {
    increment = "minor";
} else {
    increment = "patch";
}

const current = semver.parse(last_tag);
const next = semver.increment(current, increment);

const dataTrueRelease = {
    owner: owner,
    repo: repo,
    tag_name: `v${next.format()}`,
    target_commitish: "main",
    previous_tag_name: last_tag,
};

const responseTrueRelease = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/generate-notes`, {
    method: "POST",
    headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(dataMayRelease),
},);

// もう一度リリースノートを作成してCHANGELOGに追記
const trueRelease: string = await responseTrueRelease.json().body;

// 現在のリリースノートをすべて取得
let currentReleases = [];
currentReleases.push(trueRelease);
let pages = 0;
const per = 100;
while (true) {
    pages++;
    const data = {
        per_page: per,
        page: pages,
    };
    const responseCurrentRelease = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
        method: "GET",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify(data),
    },);
    const parsed = JSON.parse(responseCurrentRelease.json());
    currentReleases.push(parsed.filter(r => !r.draft).map(r => r.body));
    if (parsed.length < per) {
        break;
    }
}

Deno.writeTextFileSync("../CHANGELOG.md", currentReleases.join("\\r\\n"));

console.log(`v${next.format()}`);

// 内容を元にセマンティックバージョンを上げる
// もう一度リリースノートを作成してCHANGELOGに追記
// READMEとCHAGELOGをコピー
// コミットする
// タグを付ける
// プッシュ
// タグでリリースを作成
