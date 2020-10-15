#!/usr/bin/env node
const { ApiPromise, WsProvider } = require("@polkadot/api");

async function main() {
  const params = process.argv.slice(2);
  console.log(params);

  if (params.length > 2) {
    throw Error("wrong number of arguments");
  }
  const api = await ApiPromise.create();
  if (params.length == 1 && params[0] == 'get_latest_block') {
    const header = await api.rpc.chain.getHeader();
    console.log(`Latest block number is ${header.number}`)
  } else if (params.length == 2 && params[0] == 'get_block') {
    const block = await api.rpc.chain.getBlock(params[1]);
    console.log(`Block ${params[1]}:`, JSON.stringify(block, null, 2));
  } else {
    throw Error("invalid arguments")
  }
}
main().catch(console.error);
