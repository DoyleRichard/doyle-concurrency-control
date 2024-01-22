type resType<T> = {
    res: T;
    status: 'fulfilled' | 'reject';
};
/**
 * ConcurrencyControl
 * @description Promise<Array<any>>
 * @param {Array< () => Promise<T> >} promiseReqArray
 * @param {number} limitNum default 3
 * @returns {Array<{ res: T, status: 'fulfilled' | 'reject' }>} response
 */
declare function ConcurrencyControl<T>(promiseReqArray: (() => Promise<T>)[], limitNum?: number): Promise<resType<T>[]>;
export default ConcurrencyControl;
