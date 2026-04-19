import {
  createPublicClient,
  createWalletClient,
  http,
  getAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import communityRegistryAbi from "./abi/CommunityRegistry.json";
import userProfileNftAbi from "./abi/UserProfileNFT.json";

export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(process.env.ARB_SEPOLIA_RPC_URL),
});

function getWalletClient() {
  const pk = process.env.PRIVATE_KEY as `0x${string}`;
  if (!pk) throw new Error("PRIVATE_KEY not set");
  const account = privateKeyToAccount(pk);
  return createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(process.env.ARB_SEPOLIA_RPC_URL),
  });
}

function registryAddress(): `0x${string}` {
  const addr = process.env.CONTRACT_COMMUNITY_REGISTRY;
  if (!addr) throw new Error("CONTRACT_COMMUNITY_REGISTRY not set");
  return getAddress(addr);
}

function nftAddress(): `0x${string}` {
  const addr = process.env.CONTRACT_USER_PROFILE_NFT;
  if (!addr) throw new Error("CONTRACT_USER_PROFILE_NFT not set");
  return getAddress(addr);
}

export async function mintProfile(
  to: `0x${string}`,
  username: string
): Promise<bigint> {
  const walletClient = getWalletClient();
  const hash = await walletClient.writeContract({
    address: nftAddress(),
    abi: userProfileNftAbi,
    functionName: "mintProfile",
    args: [to, username],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const tokenId = await publicClient.readContract({
    address: nftAddress(),
    abi: userProfileNftAbi,
    functionName: "getTokenIdByWallet",
    args: [to],
  });
  return tokenId as bigint;
}

export async function hasProfileOnChain(wallet: `0x${string}`): Promise<boolean> {
  return (await publicClient.readContract({
    address: nftAddress(),
    abi: userProfileNftAbi,
    functionName: "hasProfile",
    args: [wallet],
  })) as boolean;
}

export async function getReputation(
  wallet: `0x${string}`,
  communityId: bigint
): Promise<bigint> {
  return (await publicClient.readContract({
    address: nftAddress(),
    abi: userProfileNftAbi,
    functionName: "getReputation",
    args: [wallet, communityId],
  })) as bigint;
}

export async function createCommunityOnChain(
  name: string,
  location: string
): Promise<bigint> {
  const walletClient = getWalletClient();
  const hash = await walletClient.writeContract({
    address: registryAddress(),
    abi: communityRegistryAbi,
    functionName: "createCommunity",
    args: [name, location],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const log = receipt.logs.find(
    (l) =>
      l.topics[0] ===
      "0x" +
        Buffer.from(
          "CommunityCreated(uint256,string,address)"
        ).toString("hex")
  );

  const count = (await publicClient.readContract({
    address: registryAddress(),
    abi: communityRegistryAbi,
    functionName: "getCommunityCount",
  })) as bigint;
  return count;
}

export async function joinCommunityOnChain(
  communityId: bigint,
  memberWallet: `0x${string}`
): Promise<void> {
  const walletClient = getWalletClient();
  const hash = await walletClient.writeContract({
    address: registryAddress(),
    abi: communityRegistryAbi,
    functionName: "addMember",
    args: [communityId, memberWallet],
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

export async function createEventOnChain(
  communityId: bigint,
  name: string,
  startTime: bigint,
  endTime: bigint,
  qrHash: `0x${string}`,
  reputationReward: bigint,
  minReputationRequired: bigint
): Promise<bigint> {
  const walletClient = getWalletClient();
  const hash = await walletClient.writeContract({
    address: registryAddress(),
    abi: communityRegistryAbi,
    functionName: "createEvent",
    args: [
      communityId,
      name,
      startTime,
      endTime,
      qrHash,
      reputationReward,
      minReputationRequired,
    ],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const count = (await publicClient.readContract({
    address: registryAddress(),
    abi: communityRegistryAbi,
    functionName: "getEventCount",
  })) as bigint;
  return count;
}

export async function finalizeEventOnChain(
  eventId: bigint,
  attendees: `0x${string}`[]
): Promise<`0x${string}`> {
  const walletClient = getWalletClient();
  const hash = await walletClient.writeContract({
    address: registryAddress(),
    abi: communityRegistryAbi,
    functionName: "finalizeEvent",
    args: [eventId, attendees],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function grantHostOnChain(wallet: `0x${string}`): Promise<void> {
  const walletClient = getWalletClient();
  const hash = await walletClient.writeContract({
    address: registryAddress(),
    abi: communityRegistryAbi,
    functionName: "grantHost",
    args: [wallet],
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

export async function isHostOnChain(wallet: `0x${string}`): Promise<boolean> {
  return (await publicClient.readContract({
    address: registryAddress(),
    abi: communityRegistryAbi,
    functionName: "isHost",
    args: [wallet],
  })) as boolean;
}
