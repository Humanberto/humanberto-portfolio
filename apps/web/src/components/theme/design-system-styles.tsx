import type { DesignSystem } from "@humanberto/ui";
import { designSystemToCssBlock } from "@humanberto/ui";

type Props = {
  system: DesignSystem;
  /** CSS selector, e.g. ":root" or ".project-theme" */
  selector?: string;
};

/** Injects editable design tokens as CSS custom properties. */
export function DesignSystemStyles({ system, selector = ":root" }: Props) {
  const css = designSystemToCssBlock(system, selector);
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
