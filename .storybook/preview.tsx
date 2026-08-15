import type { Decorator, Preview } from "@storybook/react-vite";
import "../dist/tokens.css";
import { themeOptions } from "../dist/themes.js";
import "../src/token-explorer.css";

const themeItems = themeOptions.flatMap((theme) =>
  theme.modes.map((mode) => ({
    value: `${mode}-${theme.id}`,
    title: `${mode === "light" ? "Light" : "Dark"} / ${theme.label}`,
  })),
);

const withTheme: Decorator = (Story, context) => {
  const [base, color] = String(context.globals["theme"] ?? "light-sky").split("-");

  return (
    <div className="tokenExplorerCanvas" data-theme-base={base} data-theme-color={color}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "テーマと表示モード",
      defaultValue: "light-sky",
      toolbar: {
        icon: "paintbrush",
        items: themeItems,
      },
    },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default preview;
