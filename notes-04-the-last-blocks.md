#Futher readings

> When everything else fails, ask Google
> - cit me, now

So we planned to read something more. In details, there could be interesting findings in some of the references of the [Muggles's papers](related-material/delegating-computation-interactive-proofs-for-muggles-goldwasser-et-al.pdf), in details:

* [44, 45]: they assume that the prover has limited computational power. Maybe they offer a simple soultion than full verifiable computing.
* [52, 16, 17, 25]: they are about committing a prover to their result, which could be achieved with a blockchain.

Results are as follows:

* [44]: This paper offers and interesting introduction to some ideas about zero-knowledge proofs and explains how to make them more efficient. It shows also how to proove in zero-knowledge that a predicate `C` about a series of bytes `x1, x2, ..., xn` is true. It has a particular focus on the predicate `xi = xj`. The predicate has to be encoded in a boolean circuit. It contains some interesting references to other paper that offer other committing mechanisms, they may be an interesting read. However, I think that in our case, we are not interested in proving in zero-knowledge: both the computation and the results are available for all to see. Or do we want to try to setup a committment to the result without actually showing the result? (this would be easier to achieve by simply encrypting the results with the public key of the publisher)
* [45]: Again, probably this does not help us
* [52]: Guess what
* [16]: This paper explains some techniques to come up with more efficient PCPs. It is still related to Boolean circuits. I think that in our case, unless we accept the "full" verifiable computing route, implementing a PCP of some sort is not useful. How would it help us? What statement could we want to prove besides "this is the result of the computation A with input B"? And if we want to simply have the parties to commit to something, there are fairly easier ways using the blockchain, because all the elements are public or semi-public. And if the idea is to go "full" verifiable computing, then I think it would be fairly difficult to beat the results reached by Pepper.
* [17]: This paper introduces the idea of PCPP for NP languages, where the last P stands for proximity. A PCPP proof for a string `x` is rejected with high probability if `x` is not close (in the sense of Hamming distance) to a string of the language. I think that this is not useful to us for considerations similar to those for [16]. To be honest, I did not read anything beyond the introduction and, even if I did, I probably would not have understood anything.
* [25]: This paper offers an alternative proof of the PCP theorem. I only read the abstract and the first part of the introduction, but I feel that the paper will be of no help for our problem.

From what I have read in these paper, the two alternatives remain the same:

* A **soft** solution implemented by using auditing performed by a trusted third party (e.g. the company running the service) and some sort of reputation system. In this case the publisher will commit to the computation by uploading the hash of the container to the blockchain and the farmer will commit to the result by uploading the hash of the result. A trusted third party can then perform some auditing if things go wrong and distribute reputation depending on the result of the auditing.
* A **hard** solution, using the entire verifiable computing machinery. In this case the correctness of the computation will be enforced by the platform but the computation lengths will sky-rocket.

I am planning on implementing the soft solution while keeping in mind the hard one: in this way, I plan on having an implementation that could be easily tweaked to accomodate the hard solution, in the case in which veryfiable computing could become a more viable option in the future.

Ah and, by the way. While i was looking around for the papers, I also found [this](related-materials\a-practical-secure-and-verifiable-cloud-computing-for-mobile-systems-premnath.pdf). I gave it a quick look, I focused mainly on the introduction and on the experimental results explained at the end. They have kinda done what we are trying to achieve, and it works. And is almost practical. Even without blockchain. Yay, I guess.

# Things at stake
Implementing a reputation system similar to, for example, the one of the stackexchange network is probably very weak here. People can change identity with extreme ease and, no matter how the incentive system is structured, it would probably be pretty easy to game.

I just remembered of the concept of "proof of stake". This alternative to PoW demands that who wants to add a block to the chain must put something at stake, usually a part of his own money. If he does not behave properly as a miner, he loses the money he puts at stake. This means that, upon an initial committment that is sostantial enough, the basic game of economics will maintain everything honest. I think that this idea (or at least a variant of it) could be employed here.

My idea is to remove the concept of "reputation" points and to introduce instead a stake amount. Every farmer is able to pay to the smart contract some amount of Ether: this become the stake amount of that farmer. This amount of Ether is kept on hold by the smart contract. The farmer can at any moment increase this amount. The farmer can withdraw this amount at any time, provided that the result of all the computations assigned to him have been accepted (= he has no pending computations). Whenever there is a dispute (that is, a publisher refuses a result), the intervent of the trusted third party is invoked: the company re-runs the computation and decretes who is right. If the publisher has correctly declared that the result should be rejected, the stake amount of the farmer is shared between the publisher and the third party and the farmer loses the right to withdraw that amount. If on the other side the publisher is lying, there is no need for anything to happen. 

I think this system of incentives should encourage a more honest behaviour than something based on traditional reputation point, because there is money involved. In this way, the publisher can also choose the farmer depending on the stake amount they offered, therefore tweaking the level of risk they are willingly to accept.
