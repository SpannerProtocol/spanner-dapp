import Circle from 'assets/svg/yellow-loader.svg'
import { CustomLightSpinner } from 'theme/components'

export function LocalSpinner({ size }: { size?: string }) {
  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
      <CustomLightSpinner src={Circle} alt="loader" size={size ? size : '40px'} />
    </div>
  )
}
