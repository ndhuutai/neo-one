import { common, crypto, ECPoint } from '@neo-one/client-common';

const result = 'NYmMriQPYAiNxHC7tziV4ABJku5Yqe79N4';

const DEFAULT_VALIDATORS = [
  '03009b7540e10f2562e5fd8fac9eaec25166a58b26e412348ff5a86927bfac22a2',
  '023e9b32ea89b94d066e649b124fd50e396ee91369e8e2a6ae1b11c170d022256d',
  '03408dcd416396f64783ac587ea1e1593c57d9fea880c8a6a1920e92a259477806',
  '02a7834be9b32e2981d157cb5bbd3acb42cfd11ea5c3b10224d7a44e98c5910f1b',
  '02ba2c70f5996f357a43198705859fae2cfea13e1172962800772b3d588a9d4abd',
  '03daca45da7acf52602c630e58af4f45a894a427fa274544cadac5335a9a293d4e',
  '02f889ecd43c5126ff1932d75fa87dea34fc95325fb724db93c8f79fe32cc3f180',
].map((value) => common.stringToECPoint(value));
const DEFAULT_EXTRA_MEMBERS = [
  '023a36c72844610b4d34d1968662424011bf783ca9d984efa19a20babf5582f3fe',
  '03708b860c1de5d87f5b151a12c2a99feebd2e8b315ee8e7cf8aa19692a9e18379',
  '03c6aa6e12638b36e88adc1ccdceac4db9929575c3e03576c617c49cce7114a050',
  '03204223f8c86b8cd5c89ef12e4f0dbb314172e9241e30c9ef2293790793537cf0',
  '02a62c915cf19c7f19a50ec217e79fac2439bbaad658493de0c7d8ffa92ab0aa62',
  '03409f31f0d66bdc2f70a9730b66fe186658f84a8018204db01c106edc36553cd0',
  '0288342b141c30dc8ffcde0204929bb46aed5756b41ef4a56778d15ada8f0c6654',
  '020f2887f41474cfeb11fd262e982051c1541418137c02a0f4961af911045de639',
  '0222038884bbd1d8ff109ed3bdef3542e768eef76c1247aea8bc8171f532928c30',
  '03d281b42002647f0113f36c7b8efb30db66078dfaaa9ab3ff76d043a98d512fde',
  '02504acbc1f4b3bdad1d86d6e1a08603771db135a73e61c9d565ae06a1938cd2ad',
  '0226933336f1b75baa42d42b71d9091508b638046d19abd67f4e119bf64a7cfb4d',
  '03cdcea66032b82f5c30450e381e5295cae85c5e6943af716cc6b646352a6067dc',
  '02cd5a5547119e24feaa7c2a0f37b8c9366216bab7054de0065c9be42084003c8a',
].map((value) => common.stringToECPoint(value));

const runTest = (vals: readonly ECPoint[]) => {
  const multiSigRedeemScript = crypto.createMultiSignatureRedeemScript(vals.length - (vals.length - 1) / 3, vals);
  const consensusAddress = crypto.getBFTAddress(vals);
  const address = crypto.scriptHashToAddress({
    addressVersion: 0x35,
    scriptHash: consensusAddress,
  });

  console.log(`NEO•ONE sig redeem script:`);
  console.log(multiSigRedeemScript.toString('hex'));
  // 150c2103009b7540e10f2562e5fd8fac9eaec25166a58b26e412348ff5a86927bfac22a20c21023e9b32ea89b94d066e649b124fd50e396ee91369e8e2a6ae1b11c170d022256d0c2103408dcd416396f64783ac587ea1e1593c57d9fea880c8a6a1920e92a2594778060c2102a7834be9b32e2981d157cb5bbd3acb42cfd11ea5c3b10224d7a44e98c5910f1b0c2102ba2c70f5996f357a43198705859fae2cfea13e1172962800772b3d588a9d4abd0c2103daca45da7acf52602c630e58af4f45a894a427fa274544cadac5335a9a293d4e0c2102f889ecd43c5126ff1932d75fa87dea34fc95325fb724db93c8f79fe32cc3f18017417bce6ca5
  console.log(`C# sig redeem script:`);
  console.log(
    '150c2102486fd15702c4490a26703112a5cc1d0923fd697a33406bd5a1c00e0013b09a700c21024c7b7fb6c310fccf1ba33b082519d82964ea93868d676662d4a59ad548df0e7d0c2102aaec38470f6aad0042c6e877cfd8087d2676b0f516fddd362801b9bd3936399e0c2103b209fd4f53a7170ea4444e0cb0a6bb6a53c2bd016926989cf85f9b0fba17a70c0c2103b8d9d5771d8f513aa0869b9cc8d50986403b78c6da36890638c3d46a5adce04a0c2102ca0e27697b9c248f6f16e085fd0061e26f44da85b58ee835c110caa5ec3ba5540c2102df48f60e8f3e01c48ff40b9b7f1310d7a8b2a193188befe1c2e3df740e89509317417bce6ca5',
  );

  console.log(`Address: ${address}`);
  console.log(`Should be: ${result}`);
};

describe('Settings', () => {
  test('consensus address one', () => {
    runTest(DEFAULT_VALIDATORS);
  });

  test('address two', () => {
    runTest(DEFAULT_VALIDATORS.concat(DEFAULT_EXTRA_MEMBERS));
  });
});
