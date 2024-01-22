"use strict";
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ConcurrencyControl
 * @description Promise<Array<any>>
 * @param {Array< () => Promise<T> >} promiseReqArray
 * @param {number} limitNum default 3
 * @returns {Array<{ res: T, status: 'fulfilled' | 'reject' }>} response
 */
function ConcurrencyControl(promiseReqArray, limitNum) {
    if (limitNum === void 0) { limitNum = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var legalParam, _promiseReqArray, pool, pollKeyMap, res, idx, pollRes, e_1, preIdx, promiseRes, pollRes, e_2, preIdx, promiseRes;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    legalParam = paramJudge(promiseReqArray, limitNum);
                    if (!legalParam) {
                        return [2 /*return*/, []];
                    }
                    _promiseReqArray = promiseReqArray.map(function (_, index) {
                        return {
                            promiseIdx: index,
                            promiseReq: function () { return __awaiter(_this, void 0, void 0, function () {
                                var promiseRes, error_1;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            promiseRes = null;
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 3, , 4]);
                                            _a = {};
                                            return [4 /*yield*/, _()];
                                        case 2:
                                            promiseRes = (_a.res = _b.sent(),
                                                _a.status = 'fulfilled',
                                                _a);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_1 = _b.sent();
                                            promiseRes = {
                                                res: error_1,
                                                status: 'reject'
                                            };
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/, { idx: index, promiseRes: promiseRes }];
                                    }
                                });
                            }); },
                        };
                    });
                    pool = [];
                    pollKeyMap = [];
                    res = new Array(promiseReqArray.length).fill(null);
                    idx = 0;
                    _a.label = 1;
                case 1:
                    if (!(idx < promiseReqArray.length)) return [3 /*break*/, 8];
                    if (!(pool.length < limitNum)) return [3 /*break*/, 2];
                    updatePool({ pool: pool, pollKeyMap: pollKeyMap, currentIdx: idx, _promiseReqArray: _promiseReqArray });
                    return [3 /*break*/, 7];
                case 2:
                    pollRes = null;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, Promise.race(pool)];
                case 4:
                    pollRes = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    pollRes = e_1;
                    return [3 /*break*/, 6];
                case 6:
                    preIdx = pollRes.idx, promiseRes = pollRes.promiseRes;
                    updatePool({
                        pool: pool,
                        pollKeyMap: pollKeyMap,
                        preIdx: preIdx,
                        currentIdx: idx,
                        _promiseReqArray: _promiseReqArray,
                    });
                    res[preIdx] = promiseRes;
                    _a.label = 7;
                case 7:
                    idx++;
                    return [3 /*break*/, 1];
                case 8:
                    if (!pool.length) return [3 /*break*/, 13];
                    pollRes = null;
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, Promise.race(pool)];
                case 10:
                    pollRes = _a.sent();
                    return [3 /*break*/, 12];
                case 11:
                    e_2 = _a.sent();
                    pollRes = e_2;
                    return [3 /*break*/, 12];
                case 12:
                    preIdx = pollRes.idx, promiseRes = pollRes.promiseRes;
                    updatePool({ pool: pool, pollKeyMap: pollKeyMap, preIdx: preIdx });
                    res[preIdx] = promiseRes;
                    return [3 /*break*/, 8];
                case 13: return [2 /*return*/, res];
            }
        });
    });
}
/**
 * 参数校验
 */
function paramJudge(promiseReqArray, limitNum) {
    var errMessage = '';
    if (Object.prototype.toString.call(promiseReqArray) !== "[object Array]") {
        errMessage = "The first parameter should be an array of functions '(() => Promise<T>)[]'.";
    }
    else {
        for (var index = 0; index < promiseReqArray.length; index++) {
            var item = promiseReqArray[index];
            if (Object.prototype.toString.call(item) !== "[object Function]") {
                errMessage = "The first parameter should be an array of functions '(() => Promise<T>)[]'.";
            }
        }
    }
    if (Object.prototype.toString.call(limitNum) !== "[object Number]") {
        errMessage = "The second parameter should be a number greater than 0.";
    }
    else {
        if (limitNum <= 0) {
            errMessage = "The second parameter should be a number greater than 0.";
        }
    }
    if (errMessage) {
        throw new Error(errMessage);
    }
    else {
        return true;
    }
}
/**
 * 更新 pool <并发池>
 * 通过 preIdx 找到并剔除已完成的请求
 * 通过 currentIdx 加入新的请求
 */
function updatePool(_a) {
    var pool = _a.pool, pollKeyMap = _a.pollKeyMap, preIdx = _a.preIdx, currentIdx = _a.currentIdx, _promiseReqArray = _a._promiseReqArray;
    if (preIdx !== undefined) {
        var pollIdx = pollKeyMap.findIndex(function (pollKey) { return pollKey === preIdx; });
        pool.splice(pollIdx, 1);
        pollKeyMap.splice(pollIdx, 1);
    }
    if (currentIdx !== undefined) {
        pool.push(_promiseReqArray[currentIdx].promiseReq());
        pollKeyMap.push(currentIdx);
    }
}
exports.default = ConcurrencyControl;
