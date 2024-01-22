
## 安装

```bash
npm i doyle-concurrency-control
```


## 功能简述

可以用来控制 Promise 的并发数量



## 应用场景

可以限制请求的并发数



## 使用示例

```javascript
import ConcurrencyControl from "doyle-concurrency-control";
const promiseReqArray = [
    () => { return fetch("/api/example1"); },
    // ...
    () => fetch("/api/exampleN")
];
// 自定义最大并发 2
ConcurrencyControl(promiseReqArray, 2).then((res) => {
    // res: Array<{ res: any, status: 'fulfilled' | 'reject' }>
    console.log(res);
});

// 默认最大并发 3
ConcurrencyControl(promiseReqArray).then((res) => {
    // res: Array<{ res: any, status: 'fulfilled' | 'reject' }>
    console.log(res);
});
```

![Alt text](./image/example-1.png)

![Alt text](./image/example-2.png)
