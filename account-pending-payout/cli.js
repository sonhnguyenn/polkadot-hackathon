const fetch = require("node-fetch");

TOKEN_DISPLAY_SYMBOL = "KSM";
TOKEN_DECIMAL = 12;
DEFAULT_DEPTH = 5;
DEFAULT_SIDECAR_URL = "http://127.0.0.1:8080";
DEFAULT_ERA = -1;
DEFAULT_UNCLAIMED_ONLY = true;

async function getSideCar(url) {
  return (sidecar_response = await fetch(url).then((res) =>
    res.json()
  ));
}

function payoutFormatToken(payout) {
  oneToken = Math.pow(10, TOKEN_DECIMAL);
  one_milli_token = Math.pow(10, TOKEN_DECIMAL - 3);
  if (payout >= oneToken)
    return `${(payout / oneToken)} ${TOKEN_DISPLAY_SYMBOL}`;
  return `${payout / one_milli_token} ${TOKEN_DISPLAY_SYMBOL} `;
}

async function main() {
  const params = process.argv.slice(2);
  let [
    accountId = "",
    sideCarUrl = DEFAULT_SIDECAR_URL,
    depth = DEFAULT_DEPTH,
    era = DEFAULT_ERA,
    unclaimedOnly = DEFAULT_UNCLAIMED_ONLY,
  ] = params;

  console.log("AccountId : ", accountId);
  console.log("Sidecar URL : ", sideCarUrl);
  console.log("Depth : ", depth);
  console.log("Era : ", era);
  console.log("Unclaimed only : ", unclaimedOnly);

  if (!accountId) {
    console.log("Show last block result");
    const res = await getSideCar(`${sideCarUrl}/blocks/head`);
    accountId = res.authorId;
  }

  requestParams = `depth=${depth}&unclaimedOnly=${String(
    unclaimedOnly
  ).toLowerCase()}`;
  if (era != -1) {
    requestParams += `&era=${era}`;
  }
  const stakingPayouts = await getSideCar(
    `${sideCarUrl}/accounts/${accountId}/staking-payouts?${requestParams}`
  );

  let erasPayouts = stakingPayouts["erasPayouts"];
  let claimedTotalPayout = 0;
  let unclaimedTotalPayout = 0;
  let totalPayout = 0;
  let payoutsNumber = 0;

  for (era_payout of erasPayouts) {
    payouts = era_payout["payouts"];
    for (payout of payouts) {
      payout_value = Number(payout["nominatorStakingPayout"]);
      payoutsNumber += 1;
      totalPayout += payout_value;
      if (payout["claimed"]) {
        claimedTotalPayout += payout_value;
      } else {
        unclaimedTotalPayout += payout_value;
      }
    }
  }

  console.log(
    `Account ${accountId} received ${payoutsNumber} payouts for ${depth} era(s).`
  );

  if (unclaimedOnly) {
    console.log(
      `Total payout unclaimed: ${payoutFormatToken(unclaimedTotalPayout)}`
    );
  } else {
    console.log(`Total payout: ${payoutFormatToken(totalPayout)}`);
    console.log(`Claimed: ${payoutFormatToken(claimedTotalPayout)} has been`);
    console.log(`Unclaimed: ${payoutFormatToken(unclaimedTotalPayout)}`);
  }
}

main().catch(console.error);
