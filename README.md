# generate-next-dynamic-route

next.js の dynamic route を生成するための cli

## Install

```shell
$ npm i -D @hisho/generate-next-dynamic-route
# or
$ yarn add -D @hisho/generate-next-dynamic-route
```

## Feature

1. dynamic route を生成する
2. next.config.js を自動で読み込む
3. `-w`または`--watch`をつけるとファイルを監視する

## Usage

package.json の scripts に以下を追加する

```json
{
  "scripts": {
    "watch:image": "generate-next-dynamic-route --watch",
    "build:image": "generate-next-dynamic-route"
  }
}
```

## TODO

- オプションを受け取れるようにする
- `src`を指定できるようにする
- `out`を指定できるようにする
