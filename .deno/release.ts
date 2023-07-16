import * as semver from "https://deno.land/std@0.194.0/semver/mod.ts";

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
const token = Deno.env.get("GITHUB_TOKEN");

// 作成されるであろうリリースノートを取得
// const mayRelease = await octokit.request(`POST /repos/${owner}/${repo}/releases/generate-notes`, {
//     owner: owner,
//     repo: repo,
//     tag_name: 'v100.0.0',
//     target_commitish: 'main',
//     previous_tag_name: last_tag,
//     headers: {
//         'X-GitHub-Api-Version': '2022-11-28'
//     }
// })

const data = {
    owner: owner,
    repo: repo,
    tag_name: "v100.0.0",
    target_commitish: "main",
    previous_tag_name: last_tag,
};

console.log(Json.stringify(data));
const result = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/generate-notes`, {
    method: "POST",
    headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": token,
        "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(data),
},);

const jjj = await result.json();
console.log(jjj);

// curl -L \
//   -X POST \
//   -H "Accept: application/vnd.github+json" \
//   -H "Authorization: Bearer <YOUR-TOKEN>"\
//   -H "X-GitHub-Api-Version: 2022-11-28" \
//   https://api.github.com/repos/OWNER/REPO/releases/generate-notes \
//       -d '{"tag_name":"v1.0.0","target_commitish":"main","previous_tag_name":"v0.9.2","configuration_file_path":".github/custom_release_config.yml"}'
//


// 内容を元にセマンティックバージョンを上げる
// もう一度リリースノートを作成してCHANGELOGに追記
// READMEとCHAGELOGをコピー
// コミットする
// タグを付ける
// プッシュ
// タグでリリースを作成
