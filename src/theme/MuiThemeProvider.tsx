import React from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
// Using unstable because the stable version throws warnings that don't comply with recent react guidelines
import { unstable_createMuiStrictModeTheme as createMuiTheme } from '@material-ui/core'

const theme = createMuiTheme({
  overrides: {
    MuiStepIcon: {
      root: {
        '&$active': {
          color: '#FFA521',
        },
        '&$completed': {
          color: '#dfdfe1',
        },
      },
    },
  },
})

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
