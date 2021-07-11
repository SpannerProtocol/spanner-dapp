import React from 'react'
import { DpoInfo } from 'spanner-interfaces/types'
import Collaboration from './Collaboration'
import Members from './Members'

export default function Organization({ dpoInfo }: { dpoInfo: DpoInfo }): JSX.Element {
  return (
    <>
      <Collaboration dpoInfo={dpoInfo} />
      <Members dpoInfo={dpoInfo} />
    </>
  )
}
