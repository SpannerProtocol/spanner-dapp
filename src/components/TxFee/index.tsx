import QuestionHelper from 'components/QuestionHelper'
import { RowBetween } from 'components/Row'
import { ItalicText } from 'components/Text'
import { SpacedSection } from 'components/Wrapper'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface TxFeeProps {
  fee?: string
}

export default function TxFee({ fee }: TxFeeProps) {
  const { t } = useTranslation()
  return (
    <>
      {fee && (
        <SpacedSection>
          <RowBetween>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ItalicText>{t(`Transaction Fee`)}</ItalicText>
              <QuestionHelper
                size={12}
                backgroundColor={'transparent'}
                text={t(`Transaction Fees are used for Blockchain Transactions. Fees are estimated.`)}
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
