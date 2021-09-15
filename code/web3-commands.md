# Some useful Web3 stuff

Get the details of a given transaction:

```
web3.eth.getTransaction('0x2b...').then(res => console.log(JSON.stringify(res, null, 1)))
```

Get the balance of an account

```
web3.eth.getBalance("0x407d73d8a49eeb85d32cf465507dd71d507100c1")
.then(console.log);
```

```
let transaction = await instance.requestComputation("myDocker/test:dev", 200, {from: publisher});
console.log(`Oh, and, by the way, the transaction costed ${transaction.receipt.gasUsed} gas`);
```
