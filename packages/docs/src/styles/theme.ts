/**
 * Design System Colors
 * Based on Radix Colors 12-step color scales
 * Each step is designed for specific use cases following industry standards
 */
export const colors = {
  // Gray scale (neutral colors)
  gray: {
    1: '#fcfcfc', // App background
    2: '#f9f9f9', // Subtle background
    3: '#f0f0f0', // UI element background
    4: '#e8e8e8', // Hovered UI element background
    5: '#e0e0e0', // Active / Selected UI element background
    6: '#d9d9d9', // Subtle borders and separators
    7: '#cecece', // UI element border and focus rings
    8: '#bbbbbb', // Hovered UI element border
    9: '#8d8d8d', // Solid backgrounds
    10: '#838383', // Hovered solid backgrounds
    11: '#646464', // Low-contrast text
    12: '#202020', // High-contrast text
  },

  // Primary brand colors (blue)
  blue: {
    1: '#fbfcfe',
    2: '#f4f8fe',
    3: '#e9f1fd',
    4: '#dbeaff',
    5: '#cae1ff',
    6: '#b6d3fb',
    7: '#9dc2f4',
    8: '#78aaed', // Primary brand color
    9: '#1c71d8', // Solid background
    10: '#0363c9', // Hovered solid background
    11: '#176dd4', // Low-contrast text
    12: '#103360', // High-contrast text
  },

  // Accent colors (violet)
  violet: {
    1: '#fefcff',
    2: '#fdfaff',
    3: '#f9f1fe',
    4: '#f3e7fc',
    5: '#eddbf9',
    6: '#e3ccf4',
    7: '#d3b4ed',
    8: '#be93e4',
    9: '#8e4ec6', // Accent solid background
    10: '#8347b9', // Hovered accent
    11: '#8145b5', // Low-contrast text
    12: '#402060', // High-contrast text
  },

  // Status colors
  red: {
    1: '#fffcfc',
    2: '#fff7f7',
    3: '#feebec',
    4: '#ffdbdc',
    5: '#ffcdce',
    6: '#fdbdbe',
    7: '#f4a9aa',
    8: '#eb8e90',
    9: '#e5484d', // Error solid background
    10: '#dc3e42',
    11: '#ce2c31',
    12: '#641723',
  },

  green: {
    1: '#fbfefc',
    2: '#f4fcf7',
    3: '#e6f7ed',
    4: '#d6f1df',
    5: '#c4e8d1',
    6: '#adddc0',
    7: '#8eceaa',
    8: '#5bb98b',
    9: '#30a46c', // Success solid background
    10: '#2b9a66',
    11: '#218358',
    12: '#193b2d',
  },

  yellow: {
    1: '#fefdfb',
    2: '#fef9e7',
    3: '#fef2d1',
    4: '#fde68a',
    5: '#fcd34d',
    6: '#f59e0b',
    7: '#d97706',
    8: '#b45309',
    9: '#92400e', // Warning solid background
    10: '#78350f',
    11: '#451a03',
    12: '#1c0a00',
  },
} as const;

/**
 * Design System Theme
 * Semantic tokens following industry standards from Radix UI, Chakra UI, and Material Design
 */
export const theme = {
  // Background colors following Radix guidelines
  bg: {
    // App and component backgrounds (steps 1-2)
    app: colors.gray[1], // Main app background
    canvas: colors.gray[2], // Canvas area, card backgrounds
    subtle: colors.blue[1], // Subtle accent background

    // Component backgrounds (steps 3-5)
    default: colors.gray[3], // Default component background
    hover: colors.gray[4], // Hovered component background
    active: colors.gray[5], // Pressed/selected component background

    // Brand backgrounds
    primary: colors.blue[9], // Primary button background
    'primary-hover': colors.blue[10], // Primary button hover
    'primary-subtle': colors.blue[3], // Primary subtle background
    'primary-subtle-hover': colors.blue[4], // Primary subtle hover

    accent: colors.violet[9], // Accent button background
    'accent-hover': colors.violet[10], // Accent button hover
    'accent-subtle': colors.violet[3], // Accent subtle background
    'accent-subtle-hover': colors.violet[4], // Accent subtle hover

    // Status backgrounds
    error: colors.red[9], // Error background
    'error-subtle': colors.red[3], // Error subtle background
    success: colors.green[9], // Success background
    'success-subtle': colors.green[3], // Success subtle background
    warning: colors.yellow[9], // Warning background
    'warning-subtle': colors.yellow[3], // Warning subtle background
  },

  // Border colors (steps 6-8)
  border: {
    default: colors.gray[6], // Default borders, separators
    hover: colors.gray[7], // Interactive element borders
    focus: colors.blue[8], // Focus rings, active borders
    strong: colors.gray[8], // Strong borders

    primary: colors.blue[6], // Primary borders
    'primary-hover': colors.blue[7], // Primary border hover
    accent: colors.violet[6], // Accent borders
    'accent-hover': colors.violet[7], // Accent border hover

    error: colors.red[6], // Error borders
    success: colors.green[6], // Success borders
    warning: colors.yellow[6], // Warning borders
  },

  // Text colors (steps 11-12)
  text: {
    default: colors.gray[12], // High-contrast text
    subtle: colors.gray[11], // Low-contrast text
    muted: colors.gray[9], // Muted text, placeholders
    inverse: '#ffffff', // Text on colored backgrounds

    primary: colors.blue[11], // Primary text
    accent: colors.violet[11], // Accent text

    error: colors.red[11], // Error text
    success: colors.green[11], // Success text
    warning: colors.yellow[11], // Warning text (readable on light bg)
  },

  // Interactive element states
  interactive: {
    // Primary actions
    primary: {
      default: colors.blue[9],
      hover: colors.blue[10],
      active: colors.blue[11],
      disabled: colors.gray[6],
      text: '#ffffff',
    },

    // Secondary actions
    secondary: {
      default: colors.gray[3],
      hover: colors.gray[4],
      active: colors.gray[5],
      disabled: colors.gray[2],
      text: colors.gray[12],
    },

    // Accent actions
    accent: {
      default: colors.violet[9],
      hover: colors.violet[10],
      active: colors.violet[11],
      disabled: colors.gray[6],
      text: '#ffffff',
    },

    // Ghost/subtle actions
    ghost: {
      default: 'transparent',
      hover: colors.gray[3],
      active: colors.gray[4],
      disabled: 'transparent',
      text: colors.gray[11],
    },
  },

  // Gradients
  gradients: {
    primary: `linear-gradient(135deg, ${colors.blue[8]} 0%, ${colors.violet[9]} 100%)`,
    subtle: `linear-gradient(180deg, ${colors.blue[2]} 0%, ${colors.gray[1]} 100%)`,
    subtleReverse: `linear-gradient(0deg, ${colors.blue[2]} 0%, ${colors.gray[1]} 100%)`,
    brand: `linear-gradient(90deg, ${colors.blue[9]} 0%, ${colors.blue[11]} 100%)`,
  },

  // Typography
  font: {
    size: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
      '7xl': '4.5rem', // 72px
      '8xl': '6rem', // 96px
      '9xl': '8rem', // 128px
    },

    weight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },

    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  // Spacing scale (Tailwind-based)
  spacing: {
    0: '0rem',
    1: '0.125rem',
    2: '0.25rem',
    3: '0.5rem',
    4: '0.75rem',
    5: '1rem',
    6: '1.5rem',
    7: '2rem',
    8: '3rem',
    9: '4rem',
    10: '6rem',
    11: '8rem',
  },

  // Border radius
  radius: {
    none: '0px',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadow: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Animation durations
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },

  // Easing functions
  ease: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  borderRadius: {
    none: '0px',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },
} as const;
