type resType<T> = {
    res: T;
    status: 'fulfilled' | 'reject';
};
/**
 * ConcurrencyControl
 * @description 限制同时发生的 Promise 数量
 * @param promiseReqArray Promise Require Function List
 * @param limitNum [optional] default 3
 * @returns Promise Result List
 */
declare function ConcurrencyControl<T>(promiseReqArray: (() => Promise<T>)[], limitNum?: number): Promise<resType<T>[]>;
export default ConcurrencyControl;
