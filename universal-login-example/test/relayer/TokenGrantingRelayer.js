import chai, {expect} from 'chai';
import {defaultAccounts, getWallets, createMockProvider, deployContract} from 'ethereum-waffle';
import TokenGrantingRelayer from '../../src/relayer/TokenGrantingRelayer';
import EthereumIdentitySDK from 'universal-login-sdk';
import Token from '../../build/Token';
import {utils} from 'ethers';
import ENSBuilder from 'ens-builder';

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));


describe('Token Granting Relayer - tests', async () => {
  let provider;
  let deployerPrivateKey;
  let wallet;
  let relayer;
  let tokenContract;
  let sdk;
  let identityPrivateKey;
  let identityContractAddress;
  let ensDeployer;
  let expectedIdentityTokenBalance;

  const relayerUrl = 'http://localhost:3311';

  before(async () => {
    provider = createMockProvider();
    [wallet] = await getWallets(provider);
    deployerPrivateKey = wallet.privateKey;
    console.log(wallet.address);
    tokenContract = await deployContract(wallet, Token, []);
    const defaultDomain = 'mylogin.eth';
    const ensBuilder = new ENSBuilder(wallet);
    const [label, tld] = defaultDomain.split('.');
    const ensAddress = await ensBuilder.bootstrapWith(label, tld);
    sdk = new EthereumIdentitySDK(relayerUrl, provider);
    const config = Object.freeze({
      jsonRpcUrl: 'http://localhost:18545',
      port: 3311,
      privateKey: wallet.privateKey,
      chainSpec: {
        ensAddress,
        chainId: 0},
      ensRegistrars: {
        'mylogin.eth': {
          registrarAddress: ensBuilder.registrars[defaultDomain].address,
          resolverAddress: ensBuilder.resolver.address,
          privateKey: deployerPrivateKey
        }
      }
    });
    relayer = new TokenGrantingRelayer(provider, config, deployerPrivateKey, tokenContract.address);
    relayer.start();
    relayer.addHooks();
    [identityPrivateKey, identityContractAddress] = await sdk.create('ja.mylogin.eth');
    expectedIdentityTokenBalance = (await tokenContract.balanceOf(identityContractAddress)).add(utils.parseEther('100'));
  });

 
  describe('Token granting', async () => {
    it('Should transfer tokens, when identity created.', async () => {
      let identityTokenBalance;
      sleep(5000).then(async () => {console.log(await tokenContract.balanceOf(identityContractAddress))});
      console.log(identityTokenBalance);
    });
  });

  after(async () => {
    relayer.stop();
  });
});