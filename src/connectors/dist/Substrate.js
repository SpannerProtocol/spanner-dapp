"use strict";
// import { ConnectorUpdate } from '@web3-react/types';
// import { AbstractConnector } from '@web3-react/abstract-connector';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.SubstrateConnector = exports.OVERLAY_READY = void 0;
var api_1 = require("@polkadot/api");
var extension_dapp_1 = require("@polkadot/extension-dapp");
// export declare abstract class SubstrateAbstractConnector extends EventEmitter {
//   constructor({provider, customTypes}: SubstrateConnectorArguments);
//   substrate: any;
//   abstract activate(): Promise<ConnectorUpdate>;
//   abstract getProvider(): Promise<any>;
//   // abstract getChainId(): Promise<number | string>;
//   abstract getAccount(): Promise<null | string>;
//   abstract deactivate(): void;
//   protected emitUpdate(update: ConnectorUpdate): void;
//   protected emitError(error: Error): void;
//   protected emitDeactivate(): void;
// }
// export declare class SubstrateConnectorCore extends SubstrateAbstractConnector {
//   constructor({provider, customTypes}: SubstrateConnectorArguments);
//   // private handleChainChanged;
//   // private handleAccountsChanged;
//   // private handleClose;
//   // private handleNetworkChanged;
//   substrate: any;
//   activate(): Promise<ConnectorUpdate>;
//   getProvider(): Promise<any>;
//   getChainId(): Promise<number | string>;
//   getAccount(): Promise<null | string>;
//   deactivate(): void;
// }
// interface SubstrateAbstractConnector {
//   substrate?: any;
//   provider: any;
//   customTypes: object | undefined;
//   activate(): Promise<any>;
//   getProvider(): Promise<any>;
//   getAccount(): Promise<any>;
//   deactivate(): void;
// }
exports.OVERLAY_READY = 'OVERLAY_READY';
// export class SubstrateConnector implements SubstrateAbstractConnector {
//   public provider: any;
//   public customTypes: object | undefined;
//   public substrate: any;
//   constructor(provider: any, customTypes: object | undefined) {
//     this.provider = provider
//     this.customTypes = customTypes
//   }
//   async deactivate() {}
//   async getProvider() {}
//   async getAccount() { return '' }
//   async activate() {
//     if (!this.substrate) {
//       console.log('not substrate!')
//       // const { default: Substrate } = await import('substrate')
//       // const { provider, customTypes } = this as any
//       // if (chainId in CHAIN_ID_NETWORK_ARGUMENT) {
//       //   this.fortmatic = new Fortmatic(apiKey, CHAIN_ID_NETWORK_ARGUMENT[chainId as FormaticSupportedChains])
//       // } else {
//       //   throw new Error(`Unsupported network ID: ${chainId}`)
//       // }
//     }
//     const provider = this.substrate.getProvider()
//     const pollForOverlayReady = new Promise(resolve => {
//       const interval = setInterval(() => {
//         if (provider.overlayReady) {
//           clearInterval(interval)
//           this.emit(OVERLAY_READY)
//           resolve()
//         }
//       }, 200)
//     })
//     const [account] = await Promise.all([
//       provider.enable().then((accounts: string[]) => accounts[0]),
//       pollForOverlayReady
//     ])
//     return { provider: this.substrate.getProvider(), chainId: (this as any).chainId, account }
//   }
// }
var generateConfig = function () {
    var APP_NAME = process.env.REACT_APP_APP_NAME;
    var PROVIDER_SOCKET = process.env.REACT_APP_SUBSTRATE_PROVIDER_SOCKET;
    var DEVELOPMENT_KEYRING = process.env.REACT_APP_DEVELOPMENT_KEYRING;
    var customFile = require("../substrate/customTypes.json");
    var RPC = customFile.customRPCs;
    var CUSTOM_TYPES = customFile.customTypes;
    return __assign(__assign({ APP_NAME: APP_NAME, DEVELOPMENT_KEYRING: DEVELOPMENT_KEYRING, PROVIDER_SOCKET: PROVIDER_SOCKET }, CUSTOM_TYPES), RPC);
};
var SubstrateConnector = /** @class */ (function () {
    // private readonly customTypes: any;
    function SubstrateConnector(_a) {
        var provider = _a.provider, customTypes = _a.customTypes;
        this.config = generateConfig();
        this.providers = new api_1.WsProvider(provider);
        this.customTypes = customTypes;
    }
    SubstrateConnector.prototype.activate = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, extension_dapp_1.web3Enable(this.config.APP_NAME)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SubstrateConnector.prototype.getProvider = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.providers];
            });
        });
    };
    // public async getChainId(): Promise<number> {
    //   return this.currentChainId
    // }
    SubstrateConnector.prototype.getAccount = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, null];
            });
        });
    };
    SubstrateConnector.prototype.deactivate = function () {
        return;
    };
    return SubstrateConnector;
}());
exports.SubstrateConnector = SubstrateConnector;
