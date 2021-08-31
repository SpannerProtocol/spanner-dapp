import { useMemo } from 'react'
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
  DefaultTheme,
} from 'styled-components'
import { useIsDarkMode } from '../state/user/hooks'
import { Text, TextProps } from 'rebass'
import { Colors } from './styled'

export * from './components'

export const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const white = '#FFFFFF'
const black = '#000000'

export function colors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? '#FFFFFF' : '#262A41',
    text2: darkMode ? '#C3C5CB' : '#2B2F4A',
    text3: darkMode ? '#6C7284' : '#828a92',
    text4: darkMode ? '#565A69' : '#79828b',
    text5: darkMode ? '#2C2F36' : '#9299A0',

    // backgrounds / greys
    bg1: darkMode ? '#212429' : '#FFFFFF',
    bg2: darkMode ? '#2C2F36' : '#F8F8FA',
    bg3: darkMode ? '#40444F' : '#D6D6D6',
    bg4: darkMode ? '#565A69' : '#f0f0f4',
    bg5: darkMode ? '#6C7284' : '#262A41',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    primary1: darkMode ? '#FFA521' : '#FFA521',
    primary2: darkMode ? '#ffb13e' : '#ffb13e',
    primary3: darkMode ? '#ffb74c' : '#ffb74c',
    primary4: darkMode ? '#ffc877' : '#ffc877',
    primary5: darkMode ? '#D28203' : '#D28203',

    // color text
    primaryText1: darkMode ? '#6da8ff' : '#ff007a',

    // secondary colors
    secondary1: darkMode ? '#262A41' : '#262A41',
    secondary2: darkMode ? '#2a2e47' : '#313754',
    secondary3: darkMode ? '#2c304b' : '#393f61',
    secondary4: darkMode ? '#313754' : '#424971',
    secondary5: darkMode ? '#AD074F' : '#5a618b',

    // other
    red1: '#EC3D3D',
    red2: '#F82D3A',
    green1: '#5BC85B',
    green2: '#8CD88C',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    blue1: '#1B488B',
    blue2: '#3498DB',
    gray1: '#adadaf',
    gray2: '#dfdfe1',
    gray3: '#F8F8FA',
  }
}

export function theme(darkMode: boolean): DefaultTheme {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text2'} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} color={'text1'} {...props} />
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={20} {...props} />
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={17} {...props} />
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow1'} {...props} />
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />
  },
}

export const FixedGlobalStyle = createGlobalStyle`
html, input, textarea, button {
  font-family: 'Lato', 'Roboto', sans-serif;
  font-display: fallback;
}

@supports (font-variation-settings: normal) {
  html, input, textarea, button {
    font-family: 'Lato', 'Roboto', sans-serif;
  }
}

html,
body {
  margin: 0;
  padding: 0;
}

 a {
   color: ${colors(false).blue1}; 
 }

* {
  box-sizing: border-box;
}

button {
  user-select: none;
}

html {
  font-size: 14px;
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
  
}
`

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg2};
}

body {
  min-height: 100vh;
  background-position: 0 -30vh;
  background-repeat: no-repeat;
  margin: 0;
}
`
// export const ThemedGlobalStyle = createGlobalStyle`
// html {
//   color: ${({ theme }) => theme.text1};
//   background-color: ${({ theme }) => theme.bg2};
// }

// body {
//   min-height: 100vh;
//   background-position: 0 -30vh;
//   background-repeat: no-repeat;
//   background-image: ${({ theme }) =>
//     `radial-gradient(50% 50% at 50% 50%, ${transparentize(0.9, theme.primary1)} 0%, ${transparentize(
//       1,
//       theme.bg1
//     )} 100%)`};
// }
// `
