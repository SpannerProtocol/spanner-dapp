import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { ItalicText } from 'components/Text'
import { SpacedSection } from 'components/Wrapper'
import React from 'react'

interface TxFeeProps {
  fee?: string
}

export default function TxFee({ fee }: TxFeeProps) {
  return (
    <>
      {fee && (
        <SpacedSection>
          <RowBetween>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ItalicText>{`Transaction Fee`}</ItalicText>
              <QuestionHelper
                size={12}
                backgroundColor={'transparent'}
                text={`Transaction Fees are used for Blockchain Transactions. Fees are estimated.`}
              />
            </div>
            <ItalicText>
              {fee}
              {` BOLT`}
            </ItalicText>
          </RowBetween>
        </SpacedSection>
      )}
    </>
  )
}
