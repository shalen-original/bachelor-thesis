# Various notes

### The main flow
See diagams in folder `diagrams/sequence`.

### Project achitecture
This project will be split in several different modules as detailed below.

**The DAO**
The DAO (decentralized autonomous organisation) is the main component: this is a set of smart contracts living on the public Ethereum blockchain. The main contract will be fairly small and act only as a gateway: since smart contracts are immutable, they have to be as bug free as possible and to be as flexible as possible. I plan to achieve this result by dividing the DAO in many small smart contracts and to use the *delegate call* functionality of the EVM. The user will send transaction to the main gateway, which will in turn dispatch them to the appropriate submodules. The gateway will be able to change the submodules address it points to (e.g. deploy a new version of some modules) if at leas `n` out of `k` trusted members approves the change. Additionally, the gateway will have the possibility to self-destruct.

**Publishing computations**
[TBD, the publisher needs to be an Ethereum node? If not, REST endpoint with web frontend]

**Accepting computations**
This can achieved in a Docker container in privileged mode running Geth and some custom software: the computer becomes a light node of the Ethereum blockchain and starts listening for the various event. Whenever a computation is assigned to this computer, the priviledged container spawns the new container for the computation and monitors it. When it ends, the appropriate transaction will be submitted through the Geth instance.

### Issues
These are the main issues I have noticed:

* **Result is rejected**. What happens when the result of a computation is rejected? This has to be considered as part of a bigger problem, that is, to obtain a proof that a generic computation occoured without having to redo the computation. This seems to be an open problem in zero-knowlodge proofs, I am still investigating. Partial solutions that I came up with are:

    * Creating a **reputation system**. Each computer will gain reputation points for every result that it publishes and that is accepted and will lose them for every rejected result. Similarly, computation publishers will gain reputation for each result they accept. Users with higher reputation may gain priviledges in a way that is similar to the one followed by the Stackoverflow community. This is interesting and has already given successfull results on the entire Stackexchange network.
    * **Duplicating computations**. Every computation can be offered for up to `n` computers. Each computer will provide its result and these will be confronted. Less interesting, increases the cost to perform each computation and can be easily overridden if, for example, all the `n` computers are different Ethereum accounts created by the same physical person or association.

* **None accepts a computation (starvation)**. This is a potential issue, but I would not dwelve too much on it. The aim of the project is not to offer any guarantee on the computation acutally happening.

* **Where are results stored?**. Surely not on the blockchain, because it is too costly. This has to be investigated, but the potential solutions seem to be:
    
    * The duty is on the publisher: as part of the computation, it has to upload the data somewhere. This requires that containers have Internet access
    * The platform standardises the output format, the computer submits a cryptographic proof (hash?) as part of the "computation completed" transaction. The data is then uploaded on a storage handled by the platform outside the blockchain.
    * The platform standardises the output format, the computer submits a cryptographic proof (hash?) as part of the "computation completed" transaction. The data is then uploaded on a storage handled by the computer and is made available to the publisher.

* **How do we bill?**. The first approach could be a flat amount decided by the publisher: this is the easier approach, because the Ether involved in the transaction can be sent with the initial request and be holded by the DAO as a middleman for the duration of the computation. However, this approach is fairly naive and very different from the standard billing model for "computation as a service" offers. A more appropriate way would be to measure the duration of the computation and apply a price "per second" or similar. The problem here is obtaining this duration: we could rely on the computer to submit the duration, but this approach involves trust. Another idea may be to bill the computer based on the time between the "computation assigned" and the "computation completed" transactions: this does not require any trust in the computer, but bills for times that are higher than the actual computation time. In this case, the payment could be modelled on how Ethereum does (gasPrice + maxGas) or on something similar. In this case, the publisher gives `gasPrice * maxGas` Ether to the DAO: when the computation is completed, the DAO gives `gasPrice * usedGas` Ether to the miner and `gasPrice * (maxGas - usedGas)` back to the publisher. The problem with this approach is that the farmer is incentivised to wait as long as possible before sending the computation completed event, so that it can get the most out of the computation.

* **Handling crashes**. What happens if the computation crashes? How to ensure that the computer still is rewarded?

* **Privacy**. The content of the container could be inspected by the farmer: this means that the container cannot contain sensitive data, closed-source application or any other information that should not be public.


### Alternative approaches
Thinking about the other proposal, that is, allowing publishers to "buy" access to a Docker deamon for certain amount of time, I found the following problems:

* **How to ensure that the access is granted?** The publisher and the farmer agree on the blockchain that the pulbisher should be able to access the Docker deamon in a certaing interval of time and that he is allowed to spawn up to `n` containers with given constraints. What if then the farmer does not effectively offer the access to its system? Or that the constraints actually imposed on the publisher are those agreed publicly? Also here, I cannot think of a "complete" solution and the best "soft" solution I can think of is again some sort of reputation system.

### Solving one to solve them all
Basically, almost every problem pointed out in the previous points is reconducible to the following problem:

> How can I ensure that something agreed on the blockchain actually happens outside the blockchain?

Or, similarly:

> Is there a way to be able to trust some piece of information that comes from the farmer?

If the enviroment was in some way able to trust that a piece of information coming from the farmer has been generated directly from the computation being performed and has not been tampered, many of the problems outlined above could be solved. For example, if the blockchain was able to trust the fact that the result provided by the farmer was actually generated by the computation, there would be no way in which the result could be altered. Or, if the blockchain was able to trust the timestamp of beginning and end of computation then there would be no billing problem.

With my limited knowledge of cryptography, I tried to think of some ways in which this could be achieved. I found this very diffcult to achieve, mainly because the result should be "signed" by the application, but the farmer has entire access to the application code, including the memory in which the application is being executed. A farmer with sufficient time and resources could attack the memory itself, accessing any secret hidden there that could be used to sign the result. This could maybe (?) be mitigated with obfuscation techniques similar to those used by malawares to hide from antiviruses, but I have absolutely no knowledge of that environment.

Similar considerations apply to filesystem and any other resource available: either we find a way to access some resource in a cryptographically secure manner or we cannot trust responses coming from the farmer.

Here is my reasoning about this problem:

* **Easy mode, the farmer cannot access the process memory nor the container's content**. The naive idea would be to use public-key cryptography, but there is a problem: everything that is stored on the blockchain is public, which means that we cannot store private keys on blockchain. An idea could be that the publisher generates a copy of private-public keys and stores the private key inside the container and the public key on the blockchain. The application will encrypt every information that has to be sent to the blockchain with the private key and the blockchain will be able to validate that the message actually comes from the application and not from the farmer.

* **Hard mode, the farmer cannot access the process memory but can read the container's content**. A similar idea could be used, but I do not know where the private key/secret could be stored this time. If it is stored anywhere inside the container, it could be retrieved. If it is stored encrypted inside the container, then the application would need to decrypt it first, so it has to retrived a secret from somewhere else and we are back to the original problem. If it has to be retrieved from outside, how could the outside oracle be sure that the request is coming from the application and not from the farmer (again, this is the original problem)?

* **Don't even try mode, the farmer can access the process memory**. Absolutely no idea.

This situation resembles very closely that of the physical "tamper-proof" box introduced during professor Helmer's lectures: in order to trust data coming from the application, this has to be cryptographically signed. In order to sign it, the container must contain a private key or some sort of similar secret. This secret must be stored somewhere in a totally hostile environment: in order to solve this problem we would need a tamper-proof, non inspectable container. This is something definitely not provided by Docker and, I think, something very difficult to produce. If the farmer has to execute the computation, it needs to access the instruction and the memory manipulated by those instruction, thus it has access to any secret stored there (?).

Recently I discovered the existance of *verifiable computing*, a field of computer science trying to solve the problem of reliably outsourcing a computation to an untrusted party. This seems very promissing, the discussion continues on the next chapter, `notes-02`.

