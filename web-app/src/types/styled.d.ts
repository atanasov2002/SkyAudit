import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      white: string;
      black: string;
      zinc: Record<number, string>;
      error: { default: string };
      warning: { default: string };
      success: { default: string };
    };
    spacing: { xs: string; sm: string; md: string; lg: string };
    borderRadius: { sm: string; md: string; lg: string };
    fontSize: { sm: string; md: string; lg: string };
    fontWeight: { normal: number; medium: number; bold: number };
  }
}
