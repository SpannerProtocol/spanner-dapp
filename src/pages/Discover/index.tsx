import { FlatCardPlate } from 'components/Card'
import React from 'react'

// function ProjectGrid() {
//   return (
//     <CardGrid>
//       <PinkFillCard>
//         <CardHeader>
//           <CardHeading>Project Zero</CardHeading>
//         </CardHeader>
//         <CardBody>
//           <CardText>Proof of concept to test DeFi smart contracts built with Spanner components.</CardText>
//         </CardBody>
//       </PinkFillCard>
//       <SLink to={{ pathname: '/catalogue' }}>
//         <PinkFillCard>
//           <CardHeader>
//             <CardHeading>Spanner</CardHeading>
//           </CardHeader>
//           <CardBody>
//             <CardText>
//               Protocol for creating secure, economical self-governing smart contracts with components.
//             </CardText>
//           </CardBody>
//         </PinkFillCard>
//       </SLink>
//     </CardGrid>
//   )
// }

export default function Discover() {
  return (
    <>
      <FlatCardPlate style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        Launchpad Layout is under development.
      </FlatCardPlate>
    </>
  )
}
