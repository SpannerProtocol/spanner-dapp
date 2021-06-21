import React from 'react'
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'

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
