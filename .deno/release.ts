import * as semver from "https://deno.land/std@0.194.0/semver/mod.ts";

import { Octokit, App } from "https://esm.sh/octokit?dts";
const octokit = new Octokit({ auth: Deno.env.get("GITHUB_TOKEN") });



// const pathPackage = "./../Packages/EasyHttpRPC/package.json";
// const {default: p} = await import(pathPackage, {assert: {type: "json"}});
// console.log(semver.format(semver.parse(p.version)));

function executeGit(args: string[]): Promise<CommandOutput> {
    const command = new Deno.Command("git", {args: args});
    return command.output();
}



// 最後のリリースのタグを取得
const last_tag = Deno.env.get("LAST_TAG");
const owner = Deno.env.get("OWNER");
const repo = Deno.env.get("REPO");

// 作成されるであろうリリースノートを取得
const mayRelease = await octokit.request(`POST /repos/${owner}/${REPO}/releases/generate-notes`, {
    owner: $owner,
    repo: $repo,
    tag_name: 'v100.0.0',
    target_commitish: 'main',
    previous_tag_name: $last_tag,
    headers: {
        'X-GitHub-Api-Version': '2022-11-28'
    }
})

console.log(mayRelease);

// 内容を元にセマンティックバージョンを上げる
// もう一度リリースノートを作成してCHANGELOGに追記
// READMEとCHAGELOGをコピー
// コミットする
// タグを付ける
// プッシュ
// タグでリリースを作成
