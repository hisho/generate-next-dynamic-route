# generate-next-dynamic-route

next.jsのdynamic routeを生成するためのcli

## Install

```shell
$ npm i -D @hisho/generate-next-dynamic-route
# or
$ yarn add -D @hisho/generate-next-dynamic-route
```

## Feature

1. dynamic routeを生成する
2. next.config.jsを自動で読み込む
3. `-w`または`--watch`をつけるとファイルを監視する

## Usage

package.json の scripts に以下を追加する

```json
{
  "scripts": {
    "watch:image": "./node_modules/@hisho/generate-next-dynamic-route/bin/index.js --watch",
    "build:image": "./node_modules/@hisho/generate-next-dynamic-route/bin/index.js"
  }
}
```

## TODO

- オプションを受け取れるようにする
- `scripts`の指定の方法を`generate-next-dynamic-route --watch`でできるようにする
