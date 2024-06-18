import {randomBytes, createHash} from "crypto";

function generatePKCEPair() {
    const NUM_OF_BYTES = 22; // Total of 44 characters (1 Bytes = 2 char) (standard states that: 43 chars <= verifier <= 128 chars)
    const HASH_ALG = "sha256";
    const randomVerifier = randomBytes(NUM_OF_BYTES).toString('hex')
    const hash = createHash(HASH_ALG).update(randomVerifier).digest('base64');
    const challenge = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); // Clean base64 to make it URL safe
    return {verifier: randomVerifier, challenge}
}

export default generatePKCEPair