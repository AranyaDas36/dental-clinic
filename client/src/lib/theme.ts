import type { ThemeTokens } from '@dental/shared';

export function getShadowCss(level: ThemeTokens['cardShadow']): string {
  switch (level) {
    case 'none':
      return 'none';
    case 'sm':
      return '0 8px 24px rgb(44 44 44 / 6%)';
    case 'md':
      return '0 16px 36px rgb(44 44 44 / 12%)';
  }
}

export function getContentWidthCss(width: ThemeTokens['contentWidth']): string {
  switch (width) {
    case 'narrow':
      return '64rem';
    case 'default':
      return '74rem';
    case 'wide':
      return '86rem';
  }
}

export function getSectionSpaceCss(space: ThemeTokens['sectionSpacing']): string {
  switch (space) {
    case 'compact':
      return '3.5rem';
    case 'comfortable':
      return '5.5rem';
    case 'spacious':
      return '7.5rem';
  }
}

export function themeToCssVariables(theme: ThemeTokens): Record<string, string> {
  return {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-text': theme.colors.text,
    '--color-muted-text': theme.colors.mutedText,
    '--font-heading': `'${theme.fonts.heading}', Georgia, serif`,
    '--font-body': `'${theme.fonts.body}', system-ui, sans-serif`,
    '--radius-button': `${theme.cornerRadiusPx}px`,
    '--radius-card': `${theme.cardRadiusPx}px`,
    '--shadow-card': getShadowCss(theme.cardShadow),
    '--content-width': getContentWidthCss(theme.contentWidth),
    '--section-space': getSectionSpaceCss(theme.sectionSpacing),
  };
}

export function applyThemeTokens(
  theme: ThemeTokens,
  target: HTMLElement = document.documentElement,
): void {
  const vars = themeToCssVariables(theme);
  for (const [key, value] of Object.entries(vars)) {
    target.style.setProperty(key, value);
  }
}
