## Verifiable computing
While verifiable computing is the solution to the problem, it still is definitely unpractical. The increase in computing time by even "only" three orders of magnitude is prohibitive and the increase in the complexity of the application is pretty high. Additionally, the Github repository is not maintained: managing to successfully employ this project seems fairly difficult. Further advancements in research would make this an interesting option but, for now at least, other solutions have to be found.

## Intertwining computations
After our last meeting I though about the idea of having the application being executed to produce some kind of "snapshots" that attested that a specific point of the computation had been reached. These snapshots could then be validated by the publisher to obtain some degree of confidence that the application actually has been run. Obviously, in order to validate these snapshot, the publisher should not have to re-run the entire computation.

This idea was inspired by the way in which some malware works: some viruses have parts of their code encrypted (even multiple times). The keys to decode these parts become available only after a certain point of the execution of the virus is reached. In the beginning, no key is stored in any place: when the virus starts executing, at a certain point of the computation it will reach an intermediate result that is the key required to decrypt the next portion of code. Going on with the new computation part, the virus will reach another intermediate result, that is the key to decrypt the next part and so on. 
This lead me to two ideas:

 * Having also in our system parts of the computation encrypted and having the encryption key for the part `n+1` hidden in some intermediate result of part `n`. In this way, if the farmer manages to reach the end of the computation, we will have a reasonable degree of confidence in him running the application. The "manages to reach the end" part could be tested by asking the list of used keys as a result or by embedding a secret in the last part of the computation and requesting that secret together with the results.

 * Dropping the ecryption idea and just having the application to save some intermediate intermediate results (what would have been the decryption key) as snapshot and then sending these to the publisher for verification.

For both of these alternatives there is the problem of how to generate these secrets without executing the entire computation first. These only way I can see to achieve this result it to have secrets that depend on the computation structure but not on the computation data. The problem is that most approaches depending on the computation structure can probably be computed by the farmer as well.
The only idea I managed to have is to split the final computation in two: the main computation, calculating the desired result; and a smaller computation responsible of generating this intermediate snapshots. This second computation should have the following characteristics:

 * It should produce `n` secrets in a non predictable manner
 * It should be totally independent from the first computation
 * It should be very difficult to reverse engineer
 * It should be significantly shorter (in execution time) than the actual computation we want to perform
 * Keeping it secret probably would not hurt

Before submitting the computation to our service, the publisher would have to merge the two computations. An assembly-level analysis of the binaries of the two applications should allow to create a final computation that is obtained by intertwining the two initial computations: this final result would still generate the desired results alongside with the secrets required to "certify" the execution. Ideally, the two computations would be mixed in a random and non predictable way, making it economically inconveninent for the farmer to try and separate the two in order to cheat.
In this case, the farmer will executed the intertwined computation and then submit back both the result and the snapshots. The publisher can run the "checking" computation separately from the actual one and check wether the snapshots submitted by the farmer match.

However, this idea does not guarantee that the submitted results are correct. If the farmer is only motivated by financial gain, then this idea could work, but as soon as the farmer wants to actually falsify the results there is no system in place to prevent this. This could (prehaps) be solved by intertwining also the results and the snaphots, but this would make the merging of the two applications even more difficult than it would be.
Additionally, this entire system relies on security by obscurity: if the farmer is able to find out exactly how the two computations are mixed or which is the snaphot-generating computation, he can cheat without effort.

## Configuration madness
If we can consider the RAM memory a "safe" space, that is, not readable nor modifiable by the farmer, an idea could be to use the configuration of the environment in which the application is run to generate an encryption key. Before actually beginning the computation, the application could read many configuration parameter of the environment and use them in a seemingly-random fashion to generate an ecryption key for the results. All of the parameters could then be ecrypted with the public key of the publisher and being stored alongside the results. All the results of the computation are then encrypted with the generated key. In this way, the publisher can regenerate the same key and read the results while also knowing that they have been generated by the application.
The publisher could embedd in the computation a description of how the paramets should be used: in this way, this becomes the "secret" that guarantees to the publisher that the result is not forged by the farmer.

However, even this approach has its own problems. It relies again on security by obscurity: if the farmer is able to discover which parameters are collected and in which order they are used, it can cheat. This can be made arbitarily difficult by making the first part of the application more and more complex and difficult to reverse engineer, but, still. (this idea has been inspired by Stuxnet)

## D-DRM
As proposed in the last meeting, I also investigated the space of DRM technologies, focusing especially on Widevine, Google's solution to the problem, currently used by Netflix and other big providers. While really interesting, it turned out to be a delusion. The current solution to the problem is to rely on two trusted components: one is the Widevine plugin, a closed source application bundled with Chrome, and the other is an hardware module that executes code in the Trusted Execution Environment ([TEE](https://genode.org/documentation/articles/trustzone)). The Widevine plugin handles the initial handshake with Google's license servers and forwards the response to the trusted code running in the TEE. This second piece of code then decrypts the video stream and communicates directly with the GPU. The integrity of the TEE module is guaranteed by the productor, which has to sign several agreements with Google before receiving the code to run in the TEE. The integrity of the Widevine plugin for Chrome is probably ensured by Chrome itself alongside with a series of anti-reverse engineering measures (speculation, I don't know).

In our system, however, we do not have any trusted component to rely on.
