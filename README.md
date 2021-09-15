
# Bachelor Thesis
## Matteo Nardini

### Environment configuration
In order to be build, this project requires:

* [NodeJs](https://nodejs.org/en/), version 9.5.0 or higher.
* [Yarn](https://yarnpkg.com/lang/en/), version 1.3.2 or higher. Alternatively, you can use npm.
* [Umlet](http://www.umlet.com/), version 14.2 or higher. This should be on your `PATH`.
* [PhantomJS](http://phantomjs.org/), version 2.1.1. This should be on your `PATH`.


#### Compiling the thesis
In order to produce a PDF of the thesis, the diagrams have to be converted from `uxf` to `PNG`. This can be done with the following command, issued while being in the root folder of the project.

```
yarn build-diagrams
```

After this step, the PDF of the thesis can be generated by doing:

```
cd tex && sh ./compile-thesis.sh compile thesis.tex
```

or alternatively, for Windows:

```
cd tex && compile-thesis-windows.bat
```

This will generate a `thesis.pdf` file in the `tex` folder.

## The DAPP
The DAPP is contained in the `/code/dapp` folder. It is a separated NPM package. All the following commands should be given in that folder, otherwise this will not work.

#### Initial configuration
If you are on Windows, in order to install the dependencies, you will need to run this with Administrator priviledges (I know, Windows):

```
yarn global add windows-build-tools
```

After this, you can install the remaining dependencies:

```
yarn
```

#### Starting the development environment
As a first step, run a local test Ethereum blockchain on which the DApp can live:

```
yarn blockchain
```

Ater this, you can compile the smart contracts:

```
yarn compile
```

Then you can execute the various tests with:

```
yarn test
```

## The client (farmer)
The client is contained in the `/code/client` folder. It is a separated NPM package. All the following commands should be given in that folder, otherwise this will not work.

#### Initial configuration
If you are on Windows, in order to install the dependencies, you will need to run this with Administrator priviledges (I know, Windows):

```
yarn global add windows-build-tools
```

After this, you can install the remaining dependencies:

```
yarn
```

#### Starting the development environment
This time there is some configuration involved. First of all, go to the dapp folder and start a local blockchain:

```
yarn blockchain
```

Then, in the same folder, deploy a copy of the smart contract on it:

```
yarn compile && yarn deploy
```

This will write on the console the address of the `Main` smart contract. Save it. Now go to the client folder and edit the file `src/config.js`: substitute the value of the key `dapp_address` with the address of the `Main` smart contract you got after the deploy. 
Additionally, modify the `result.folder` key in the JSON file and point it to and existent folder in which the results of the computations will be stored.
Now you can start the client:

```
yarn dev
```

Access with a modern browser the URL [localhost:8080](localhost:8080) to access the running instance of the client.

