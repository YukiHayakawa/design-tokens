# Design Tokens

複数プロジェクトで共有するカラーテーマのパッケージです。テーマ定義は `themes/*.json` を正本とし、ビルド時に利用側の CSS とテーマ一覧を生成します。

この README では、作業する場所を次の二つに分けて説明します。

- **このリポジトリ**: テーマ JSON の追加、生成、GUI プレビューを行います。
- **利用アプリ**: このリポジトリから公開された成果物を導入するアプリケーションです。テーマ JSON は編集せず、生成済みの CSS と TypeScript API を利用します。

## 生成物

`pnpm build` は JSON を検証し、次のファイルを `dist/` に生成します。`dist/` 内は直接編集しません。

| ファイル           | 用途                                                  |
| ------------------ | ----------------------------------------------------- |
| `dist/tokens.css`  | テーマに応じた CSS カスタムプロパティ                 |
| `dist/themes.json` | テーマ選択 UI で使うテーマ ID、表示名、スウォッチ一覧 |
| `dist/themes.js`   | TypeScript / JavaScript 向けのテーマ API              |
| `dist/themes.d.ts` | テーマ API の型定義                                   |

## このリポジトリでの作業

テーマ JSON を編集した後は、このパッケージのディレクトリで生成を実行します。

```sh
# JSON を検証して生成物を更新する
pnpm build
```

`prepack` も同じ生成を実行するため、公開用アーカイブには最新の `dist/` が含まれます。

## GUI プレビュー

テーマ追加後の色、トークン値、実表示はこのパッケージの Storybook で確認します。

```sh
pnpm storybook
```

起動前に `pnpm build` が自動実行されます。ツールバーでテーマと `light` / `dark` を切り替えると、Token Explorer のスウォッチ、CSS 変数一覧、表示サンプルが切り替わります。テーマ JSON の追加後に個別の Storybook 設定を更新する必要はありません。

## GitHub Packages から利用アプリへ導入

このリポジトリの成果物は GitHub Packages で公開し、利用アプリは公開済みの `dist/` を依存として取得します。テーマ JSON の編集やトークン生成を利用アプリ側で行う必要はありません。

以下では、GitHub の組織またはユーザー名を `<GitHub owner>` と表記します。公開名は `@<GitHub owner>/design-tokens` とします。

利用アプリのプロジェクトルートに `.npmrc` を追加し、GitHub Packages を scope のレジストリとして設定します。

```ini
@<GitHub owner>:registry=https://npm.pkg.github.com
```

認証済みの開発環境で、利用アプリのディレクトリからパッケージを追加します。

```sh
pnpm add @<GitHub owner>/design-tokens
```

追加後は、利用アプリのグローバル CSS またはルートレイアウトで CSS を一度読み込みます。

```ts
import '@<GitHub owner>/design-tokens/tokens.css';
```

CI では GitHub Packages の読み取り権限を持つ `NODE_AUTH_TOKEN` を設定します。トークン値をリポジトリへ記録せず、CI のシークレットまたは GitHub Actions の `GITHUB_TOKEN` として渡します。

## テーマを追加する

`themes/` に JSON ファイルを追加します。ファイル名は任意ですが、`id` は英小文字で始まる kebab-case にします。

```json
{
  "id": "ocean",
  "label": "Ocean",
  "swatches": ["#2387b5", "#e27d6c", "#d4aa4d"],
  "modes": {
    "light": {
      "ink": "#17384a"
    },
    "dark": {
      "ink": "#e4f3f7"
    }
  }
}
```

実際には、各モードに既存テーマと**同じ全トークン**を定義します。新しいテーマを追加したら `pnpm theme:build` を実行します。生成スクリプトが新しい JSON を自動検出するため、CSS、アプリのテーマ選択、Storybook の選択肢へ個別にテーマ名を追加する必要はありません。

## トークンの方針

トークンは色名ではなく、UI 上の役割で命名します。

| 区分               | トークン                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| 基本の文字・面     | `ink`, `muted`, `page`, `surface`, `surface-subtle`                       |
| 強調・境界         | `primary`, `secondary`, `accent`, `line`, `border`, `border-subtle`       |
| 反転表示・メディア | `on-primary`, `on-media`, `overlay`, `shadow`, `media-start`, `media-end` |
| 状態表示           | `status-danger`, `status-muted`                                           |

新しいトークンを追加する場合は、すべてのテーマの `light` と `dark` に同名の値を追加します。値は `#rgb`、`#rrggbb`、またはアルファ付きの 4 / 8 桁 HEX で定義します。トークン名や値が不足・重複・不正な場合、ビルドは失敗します。

## テーマの適用

生成 CSS を読み込んだ利用側では、テーマを適用するルート要素に属性を設定します。

```tsx
import '<テーマパッケージ名>/tokens.css';

export function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-theme-base='light' data-theme-color='ocean'>
      <body>{children}</body>
    </html>
  );
}
```

コンポーネント側では、直接 HEX 値を書かずに CSS 変数を利用します。

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-ink);
  box-shadow: 0 12px 32px
    color-mix(in srgb, var(--color-shadow) 12%, transparent);
}
```

テーマ選択 UI やテーマ値の参照が必要な TypeScript プロジェクトでは、`@<GitHub owner>/design-tokens/themes` を利用します。テーマ追加後に公開バージョンを更新すれば、テーマ ID の union 型、テーマ一覧、トークン値も更新されます。

```ts
import {
  getThemeTokens,
  themeOptions,
  type ThemeId,
  type ThemeMode,
} from '@<GitHub owner>/design-tokens/themes';

const options = themeOptions;

function getPrimaryColor(
  themeId: ThemeId,
  mode: ThemeMode
) {
  return getThemeTokens(themeId, mode).primary;
}
```

## 公開と利用アプリの更新

このリポジトリは独立した Git リポジトリです。初回公開前に `package.json` の `name` を `@<GitHub owner>/design-tokens` へ変更し、`private` を削除または `false` にします。GitHub Packages を公開先として指定します。

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

テーマを変更したら、次の順で公開します。

1. テーマ JSON を編集し、`pnpm build` と `pnpm storybook` で生成物と表示を確認する。
2. `package.json` の `version` を更新する。CSS 変数名の変更など利用側の修正が必要な変更は、メジャーバージョンを更新する。
3. `pnpm pack` を実行し、アーカイブに `dist/tokens.css`、`dist/themes.js`、`dist/themes.d.ts`、`dist/themes.json` が含まれることを確認する。
4. `pnpm publish` で GitHub Packages へ公開する。
5. `pnpm view @<GitHub owner>/design-tokens@<version> version --registry=https://npm.pkg.github.com` で公開済みバージョンを確認する。
6. 公開したバージョンと同じ `v<version>` の注釈付きタグを作成して push する。

```sh
git tag -a v<version> -m "v<version>"
git push origin v<version>
```

7. 利用アプリで公開名の依存バージョンを更新する。

利用アプリは、公開済みのバージョンを更新してテーマの変更を取り込みます。CSS import と TypeScript import の名前は、公開時の `package.json` の `name` に合わせます。
