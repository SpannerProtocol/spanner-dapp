import React from 'react'
import SwapConsole from './SwapConsole'
import LpAddConsole from './LpAddConsole'
import LpRemoveConsole from './LpRemoveConsole'

interface DexConsoleProps {
  activeConsole: string
}

export default function MainConsole(props: DexConsoleProps) {
  const { activeConsole } = props

  if (activeConsole === 'lp-add') {
    return <LpAddConsole />
  } else if (activeConsole === 'lp-remove') {
    return <LpRemoveConsole />
  } else {
    return <SwapConsole />
  }
}
