import type { Meta, StoryObj } from "@storybook/react-vite";
import { getThemeTokens, themeOptions } from "../dist/themes.js";
import type { ThemeId, ThemeMode } from "../dist/themes.js";

const meta = {
  title: "Design Tokens/Explorer",
  parameters: {
    docs: {
      description: {
        component: "テーマ JSON から生成された CSS カスタムプロパティと実表示の確認画面です。",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function resolveTheme(value: unknown): { id: ThemeId; mode: ThemeMode } {
  const [mode, id] = String(value ?? "light-sky").split("-");
  return { id: id as ThemeId, mode: mode as ThemeMode };
}

export const Overview: Story = {
  render: (_args, context) => {
    const { id, mode } = resolveTheme(context.globals["theme"]);
    const theme = themeOptions.find((option) => option.id === id) ?? themeOptions[0];
    if (theme === undefined) {
      throw new Error("At least one theme is required to render the token explorer.");
    }
    const tokens = getThemeTokens(theme.id, mode);

    return (
      <main className="tokenExplorer">
        <header className="tokenExplorerHeader">
          <div>
            <p className="tokenExplorerEyebrow">Design Tokens</p>
            <h1>{theme.label}</h1>
          </div>
          <div className="tokenExplorerMode">{mode}</div>
        </header>

        <section aria-label="テーマスウォッチ" className="tokenExplorerSwatches">
          {theme.swatches.map((swatch) => (
            <span key={swatch} style={{ backgroundColor: swatch }} title={swatch} />
          ))}
        </section>

        <section className="tokenExplorerSamples" aria-label="表示サンプル">
          <article className="tokenSample tokenSampleSurface">
            <p>Surface</p>
            <h2>標準サーフェス</h2>
            <span>surface / ink / muted</span>
          </article>
          <article className="tokenSample tokenSamplePrimary">
            <p>Primary</p>
            <h2>強調アクション</h2>
            <button type="button">アクション</button>
          </article>
          <article className="tokenSample tokenSampleMedia">
            <p>Media overlay</p>
            <h2>メディアオーバーレイ</h2>
            <span>overlay / on-media</span>
          </article>
        </section>

        <section aria-label="トークン一覧" className="tokenExplorerGrid">
          {Object.entries(tokens).map(([name, value]) => (
            <article className="tokenItem" key={name}>
              <span className="tokenItemSwatch" style={{ backgroundColor: value }} />
              <code>--{name}</code>
              <output>{value}</output>
            </article>
          ))}
        </section>
      </main>
    );
  },
};
