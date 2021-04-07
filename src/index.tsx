import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { ApiProvider } from 'contexts/ApiProvider'
import { SubstrateProvider } from 'contexts/SubstrateProvider'
import { ToastProvider } from 'contexts/ToastContext'
import { Web3InjectedProvider } from 'contexts/WalletProvider'
import 'inter-ui'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { NetworkContextName } from './constants'
import './i18n'
import App from './pages/App'
import store from './state'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import getLibrary from './utils/getLibrary'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if ('ethereum' in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <ApiProvider>
          <Web3InjectedProvider>
            <SubstrateProvider>
              <Provider store={store}>
                <ThemeProvider>
                  <ThemedGlobalStyle />
                  <HashRouter>
                    <ToastProvider>
                      <App />
                    </ToastProvider>
                  </HashRouter>
                </ThemeProvider>
              </Provider>
            </SubstrateProvider>
          </Web3InjectedProvider>
        </ApiProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </StrictMode>,
  document.getElementById('root')
)
