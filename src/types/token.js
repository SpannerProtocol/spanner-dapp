"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPresetToken = getPresetToken;
exports.sortTokens = sortTokens;
exports.token2CurrencyId = token2CurrencyId;
exports.currencyId2Token = currencyId2Token;
exports.PRESET_TOKENS = exports.Token = exports.TokenAmount = exports.presetTokensConfig = void 0;

var _fixedPointNumber = require("../types/FixedPointNumber");

// common tokens config in acala network and polkadot
const presetTokensConfig = {
  acala: {
    ACA: {
      chain: 'acala',
      name: 'ACA',
      symbol: 'ACA',
      precision: 18
    },
    AUSD: {
      chain: 'acala',
      name: 'AUSD',
      symbol: 'aUSD',
      precision: 18
    },
    DOT: {
      chain: 'acala',
      name: 'DOT',
      symbol: 'DOT',
      precision: 18
    },
    RENBTC: {
      chain: 'acala',
      name: 'RENBTC',
      symbol: 'renBTC',
      precision: 18
    },
    LDOT: {
      chain: 'acala',
      name: 'LDOT',
      symbol: 'LDOT',
      precision: 18
    },
    XBTC: {
      chain: 'acala',
      name: 'XBTC',
      symbol: 'XBTC',
      precision: 18
    }
  },
  polkadot: {
    DOT: {
      chain: 'polkadot',
      name: 'DOT',
      symbol: 'DOT',
      precision: 10
    }
  },
  kurara: {},
  kusama: {
    KSM: {
      chain: 'kusama',
      name: 'KSM',
      symbol: 'KSM',
      precision: 12
    }
  }
};
exports.presetTokensConfig = presetTokensConfig;
const TokenAmount = _fixedPointNumber.FixedPointNumber;
exports.TokenAmount = TokenAmount;

class Token {
  // keep all properties about token readonly
  constructor(config) {
    this.chain = void 0;
    this.name = void 0;
    this.symbol = void 0;
    this.precision = void 0;
    this.amount = void 0;
    this.name = config.name;
    this.symbol = config.symbol || config.name;
    this.precision = config.precision || 18;
    this.chain = config.chain || 'acala';

    if (config.amount) {
      if (config.amount instanceof _fixedPointNumber.FixedPointNumber) {
        this.amount = config.amount;
      } else {
        this.amount = new TokenAmount(config.amount || 0, this.precision);
      }
    }
  }
  /**
   * @name isEqual
   * @description check if `token` equal current
   */


  isEqual(token) {
    return this.chain === token.chain && this.name === token.name;
  }

  toString() {
    return this.name;
  }

  toChainData() {
    if (this.chain === 'acala') {
      return {
        Token: this.name
      };
    }

    return this.name;
  }

  clone(newConfig) {
    return new Token({
      name: (newConfig === null || newConfig === void 0 ? void 0 : newConfig.name) || this.name || '',
      chain: (newConfig === null || newConfig === void 0 ? void 0 : newConfig.chain) || this.chain || '',
      precision: (newConfig === null || newConfig === void 0 ? void 0 : newConfig.precision) || this.precision || 0,
      amount: (newConfig === null || newConfig === void 0 ? void 0 : newConfig.amount) || this.amount || new _fixedPointNumber.FixedPointNumber(0),
      symbol: (newConfig === null || newConfig === void 0 ? void 0 : newConfig.symbol) || this.symbol || ''
    });
  }

}

exports.Token = Token;

function convert(config) {
  return Object.keys(config).reduce((prev, chain) => {
    prev[chain] = Object.keys(config[chain]).reduce((prev, name) => {
      prev[name] = new Token(config[chain][name]);
      return prev;
    }, {});
    return prev;
  }, {});
}

const PRESET_TOKENS = convert(presetTokensConfig);
exports.PRESET_TOKENS = PRESET_TOKENS;

function getPresetToken(name, chain = 'acala') {
  return PRESET_TOKENS[chain][name];
}

const TOKEN_SORT = {
  ACA: 0,
  AUSD: 1,
  DOT: 2,
  XBTC: 3,
  LDOT: 4,
  RENBTC: 5
};

function sortTokens(token1, token2, ...other) {
  const result = [token1, token2, ...other];
  return result.sort((a, b) => TOKEN_SORT[a.name] - TOKEN_SORT[b.name]);
}

function token2CurrencyId(api, token) {
  return api.createType('CurrencyId', token.toChainData());
}

function currencyId2Token(token) {
  return getPresetToken(token.asToken.toString());
}