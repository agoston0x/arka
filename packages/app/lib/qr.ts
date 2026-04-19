import { randomBytes } from "crypto";
import { keccak256, encodePacked, getAddress } from "viem";

export function generateMasterNonce(): `0x${string}` {
  return `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
}

export function computeQrHash(
  communityId: bigint,
  masterNonce: `0x${string}`
): `0x${string}` {
  return keccak256(
    encodePacked(["uint256", "bytes32"], [communityId, masterNonce as `0x${string}`])
  );
}

export function deriveMemberNonce(
  masterNonce: `0x${string}`,
  memberWallet: `0x${string}`
): `0x${string}` {
  return keccak256(
    encodePacked(
      ["bytes32", "address"],
      [masterNonce as `0x${string}`, getAddress(memberWallet)]
    )
  );
}

export function verifyMemberNonce(
  masterNonce: `0x${string}`,
  memberWallet: `0x${string}`,
  providedNonce: `0x${string}`
): boolean {
  return deriveMemberNonce(masterNonce, memberWallet) === providedNonce;
}
