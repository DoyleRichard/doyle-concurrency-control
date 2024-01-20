"use strict";

/**
 * ConcurrencyControl
 * @description Promise<Array<any>>
 * @param {Array<Function>} promiseReqArray
 * @param {Number} limitNum default 3
 * @returns {Array} response
 */
async function ConcurrencyControl(promiseReqArray, limitNum = 3) {
    let legalParam = paramJudge(promiseReqArray, limitNum);
    if (!legalParam) {
        return [];
    }

    const res = [];
    // 包装一下，可以返回 index 标识，方便知道每次最先完成的 Promise 是谁
    const _promiseReqArray = promiseReqArray.map((_, index) => {
        return {
            promiseIdx: index,
            promiseReq: async () => {
                const promiseRes = await _();
                return { idx: index, promiseRes };
            },
        };
    });
    const pool = [];
    const pollKeyMap = [];

    for (let idx = 0; idx < promiseReqArray.length; idx++) {
        if (pool.length < limitNum) {
            updatePool({ pool, pollKeyMap, currentIdx: idx, _promiseReqArray });
        } else {
            const { idx: preIdx, promiseRes } = await Promise.race(pool);
            updatePool({
                pool,
                pollKeyMap,
                preIdx,
                currentIdx: idx,
                _promiseReqArray,
            });
            res.push(promiseRes);
        }
    }

    while (pool.length) {
        const { idx: preIdx, promiseRes } = await Promise.race(pool);
        updatePool({ pool, pollKeyMap, preIdx });
        res.push(promiseRes);
    }

    return res;
}

/**
 * 参数校验
 */
function paramJudge(promiseReqArray, limitNum) {
    if (Object.prototype.toString.call(promiseReqArray) !== "[object Array]") {
        console.error(
            "The first parameter should be an array of functions (Array<Function>)."
        );
        return false;
    } else {
        for (let index = 0; index < promiseReqArray.length; index++) {
            const item = promiseReqArray[index];
            if (Object.prototype.toString.call(item) !== "[object Function]") {
                console.error(
                    "The first parameter should be an array of functions (Array<Function>)."
                );
                return false;
            }
        }
    }
    if (Object.prototype.toString.call(limitNum) !== "[object Number]") {
        console.error(
            "The second parameter should be a number greater than 0."
        );
        return false;
    } else {
        if (limitNum <= 0) {
            console.error(
                "The second parameter should be a number greater than 0."
            );
            return false;
        }
    }
    return true;
}

/**
 * 更新 pool <并发池>
 * 通过 preIdx 找到并剔除已完成的请求
 * 通过 currentIdx 加入新的请求
 */
function updatePool({
    pool,
    pollKeyMap,
    preIdx,
    currentIdx,
    _promiseReqArray,
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

module.exports = ConcurrencyControl;
