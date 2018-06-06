const proofOfWork = (lastNonce = 0) => {
  let nonce = lastNonce + 1;
  while (nonce % 9 !== 0 && nonce % lastNonce !== 0) {
    nonce += 1;
  }
  return nonce;
};

module.exports = {
  proofOfWork,
};
