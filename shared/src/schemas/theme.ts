import { z } from 'zod';
import {
  APPROVED_BODY_FONTS,
  APPROVED_HEADING_FONTS,
  BUTTON_STYLES,
  CONTENT_WIDTHS,
  SECTION_SPACINGS,
  SHADOW_LEVELS,
} from '../constants/theme.js';

/** Accepts #RGB, #RRGGBB, or #RRGGBBAA */
export const hexColorSchema = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, 'Invalid hex color');

export const themeSchema = z.object({
  colors: z.object({
    primary: hexColorSchema,
    secondary: hexColorSchema,
    accent: hexColorSchema,
    background: hexColorSchema,
    surface: hexColorSchema,
    text: hexColorSchema,
    mutedText: hexColorSchema,
  }),
  fonts: z.object({
    heading: z.enum(APPROVED_HEADING_FONTS),
    body: z.enum(APPROVED_BODY_FONTS),
  }),
  buttonStyle: z.enum(BUTTON_STYLES),
  cornerRadiusPx: z.number().int().min(0).max(32),
  cardRadiusPx: z.number().int().min(0).max(40),
  cardShadow: z.enum(SHADOW_LEVELS),
  contentWidth: z.enum(CONTENT_WIDTHS),
  sectionSpacing: z.enum(SECTION_SPACINGS),
});

export type ThemeTokens = z.infer<typeof themeSchema>;

export const DEFAULT_THEME: ThemeTokens = {
  colors: {
    primary: '#5F7A6A',
    secondary: '#3D5A5B',
    accent: '#C4A484',
    background: '#F7F4EF',
    surface: '#FFFFFF',
    text: '#2C2C2C',
    mutedText: '#5C5C5C',
  },
  fonts: {
    heading: 'Fraunces',
    body: 'Source Sans 3',
  },
  buttonStyle: 'solid',
  cornerRadiusPx: 10,
  cardRadiusPx: 16,
  cardShadow: 'sm',
  contentWidth: 'default',
  sectionSpacing: 'comfortable',
};
