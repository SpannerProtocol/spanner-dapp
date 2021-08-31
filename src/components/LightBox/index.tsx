import { useState } from 'react'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css' // This only needs to be imported once in your app
import styled from 'styled-components'

const LightBoxWrapper = styled.div`
  cursor: pointer;
  width: 100%;
  padding: 0.5rem;
`

export default function ImageLightBox({ imageSrc }: { imageSrc: string }) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  return (
    <>
      <LightBoxWrapper onClick={() => setIsOpen(true)}>
        <img alt="lightbox" style={{ width: '100%' }} src={imageSrc} />
        {isOpen && <Lightbox mainSrc={imageSrc} onCloseRequest={() => setIsOpen(false)} />}
      </LightBoxWrapper>
    </>
  )
}
