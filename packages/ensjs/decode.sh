#!/usr/bin/env bash
set -euo pipefail

ADDRESS="0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf"
EVENT_SIG='LabelRegistered(uint256,bytes32,string,address,uint64,address)'

cast logs --address "$ADDRESS" "$EVENT_SIG" --json |
jq -c '.[]' |
while read -r log; do
  topic1=$(jq -r '.topics[1]' <<<"$log")
  topic2=$(jq -r '.topics[2]' <<<"$log")
  topic3=$(jq -r '.topics[3]' <<<"$log")
  data=$(jq -r '.data' <<<"$log")

  tokenId=$(cast to-dec "$topic1")
  labelHash="$topic2"
  sender=$(cast parse-bytes32-address "$topic3")

  decoded=$(cast abi-decode "f()(string,address,uint64)" "$data")

  label=$(sed -E 's/^\("([^"]*)", .*/\1/' <<<"$decoded")
  owner=$(sed -E 's/^\("[^"]*", (0x[0-9a-fA-F]{40}), [0-9]+\)$/\1/' <<<"$decoded")
  expiry=$(sed -E 's/^.* ,?([0-9]+)\)$/\1/' <<<"$decoded")

  echo "----------------------------------------"
  echo "tokenId   : $tokenId"
  echo "labelHash : $labelHash"
  echo "label     : $label"
  echo "owner     : $owner"
  echo "expiry    : $expiry"
  echo "sender    : $sender"
done
