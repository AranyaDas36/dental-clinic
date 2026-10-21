export const APPROVED_HEADING_FONTS = [
  'Fraunces',
  'Playfair Display',
  'Cormorant Garamond',
  'Libre Baskerville',
] as const;

export const APPROVED_BODY_FONTS = [
  'Source Sans 3',
  'DM Sans',
  'Nunito Sans',
  'IBM Plex Sans',
] as const;

export const BUTTON_STYLES = ['solid', 'outline', 'soft'] as const;
export const CONTENT_WIDTHS = ['narrow', 'default', 'wide'] as const;
export const SECTION_SPACINGS = ['compact', 'comfortable', 'spacious'] as const;
export const SHADOW_LEVELS = ['none', 'sm', 'md'] as const;

export type ApprovedHeadingFont = (typeof APPROVED_HEADING_FONTS)[number];
export type ApprovedBodyFont = (typeof APPROVED_BODY_FONTS)[number];
export type ButtonStyle = (typeof BUTTON_STYLES)[number];
export type ContentWidth = (typeof CONTENT_WIDTHS)[number];
export type SectionSpacing = (typeof SECTION_SPACINGS)[number];
export type ShadowLevel = (typeof SHADOW_LEVELS)[number];
