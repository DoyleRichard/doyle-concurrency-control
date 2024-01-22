type resType<T> = { res: T, status: 'fulfilled' | 'reject' }
type _promiseReqType<T> = { promiseIdx: number, promiseReq: () => _promiseReq<T> }
type _promiseReq<T> = Promise<{ idx: number, promiseRes: resType<T> }>
/**
 * ConcurrencyControl
 * @description Promise<Array<any>>
 * @param {Array< () => Promise<T> >} promiseReqArray
 * @param {number} limitNum default 3
 * @returns {Array<{ res: T, status: 'fulfilled' | 'reject' }>} response
 */
async function ConcurrencyControl<T>(promiseReqArray: (() => Promise<T>)[], limitNum: number = 3): Promise<resType<T>[]> {
    let legalParam = paramJudge(promiseReqArray, limitNum);
    if (!legalParam) {
        return [];
    }

    // 包装一下，可以返回 index 标识，方便知道每次最先完成的 Promise 是谁
    const _promiseReqArray: _promiseReqType<T>[] = promiseReqArray.map((_, index) => {
        return {
            promiseIdx: index,
            promiseReq: async () => {
                let promiseRes: resType<T> = null
                try {
                    promiseRes = {
                        res: await _(),
                        status: 'fulfilled'
                    }
                } catch (error) {
                    promiseRes = {
                        res: error,
                        status: 'reject'
                    }
                }
                return { idx: index, promiseRes };
            },
        };
    });

    const pool: _promiseReq<T>[] = [];
    const pollKeyMap: number[] = [];
    const res = new Array(promiseReqArray.length).fill(null) as unknown as resType<T>[];

    for (let idx = 0; idx < promiseReqArray.length; idx++) {
        if (pool.length < limitNum) {
            updatePool<T>({ pool, pollKeyMap, currentIdx: idx, _promiseReqArray });
        } else {
            let pollRes = null
            try {
                pollRes = await Promise.race(pool)
            } catch (e) {
                pollRes = e
            }
            const { idx: preIdx, promiseRes } = pollRes
            updatePool<T>({
                pool,
                pollKeyMap,
                preIdx,
                currentIdx: idx,
                _promiseReqArray,
            });
            res[preIdx] = promiseRes;
        }
    }

    while (pool.length) {
        let pollRes = null
        try {
            pollRes = await Promise.race(pool)
        } catch (e) {
            pollRes = e
        }
        const { idx: preIdx, promiseRes } = pollRes
        updatePool<T>({ pool, pollKeyMap, preIdx });
        res[preIdx] = promiseRes;
    }

    return res;
}

/**
 * 参数校验
 */
function paramJudge(promiseReqArray, limitNum) {
    let errMessage = ''
    if (Object.prototype.toString.call(promiseReqArray) !== "[object Array]") {
        errMessage = "The first parameter should be an array of functions '(() => Promise<T>)[]'."
    } else {
        for (let index = 0; index < promiseReqArray.length; index++) {
            const item = promiseReqArray[index];
            if (Object.prototype.toString.call(item) !== "[object Function]") {
                errMessage = "The first parameter should be an array of functions '(() => Promise<T>)[]'."
            }
        }
    }
    if (Object.prototype.toString.call(limitNum) !== "[object Number]") {
        errMessage = "The second parameter should be a number greater than 0."
    } else {
        if (limitNum <= 0) {
            errMessage = "The second parameter should be a number greater than 0."
        }
    }

    if ( errMessage ) {
        throw new Error(errMessage);
    } else {
        return true
    }
}

/**
 * 更新 pool <并发池>
 * 通过 preIdx 找到并剔除已完成的请求
 * 通过 currentIdx 加入新的请求
 */
function updatePool<T>({
    pool,
    pollKeyMap,
    preIdx,
    currentIdx,
    _promiseReqArray,
}: {
    pool: _promiseReq<T>[],
    pollKeyMap?: number[],
    currentIdx?: number,
    preIdx?: number,
    _promiseReqArray?: _promiseReqType<T>[]
}) {
    if (preIdx !== undefined) {
        const pollIdx = pollKeyMap.findIndex((pollKey) => pollKey === preIdx);
        pool.splice(pollIdx, 1);
        pollKeyMap.splice(pollIdx, 1);
    }
    if (currentIdx !== undefined) {
        pool.push(_promiseReqArray[currentIdx].promiseReq());
        pollKeyMap.push(currentIdx);
    }
}

export default ConcurrencyControl
