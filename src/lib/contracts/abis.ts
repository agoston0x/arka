// Auto-extracted from Erik's Solidity contracts
// packages/contracts/src/identity/UserProfileNFT.sol
// packages/contracts/src/registry/CommunityRegistry.sol

export const UserProfileNFT_ABI = [
  // Read
  { type: 'function', name: 'hasProfile', inputs: [{ name: 'wallet', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getProfile', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'tuple', components: [{ name: 'username', type: 'string' }, { name: 'memberSince', type: 'uint256' }] }], stateMutability: 'view' },
  { type: 'function', name: 'walletToTokenId', inputs: [{ name: 'wallet', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getReputation', inputs: [{ name: 'wallet', type: 'address' }, { name: 'communityId', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getBadges', inputs: [{ name: 'wallet', type: 'address' }], outputs: [{ type: 'tuple[]', components: [{ name: 'communityId', type: 'uint256' }, { name: 'awardedAt', type: 'uint256' }, { name: 'reason', type: 'string' }] }], stateMutability: 'view' },
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  // Write
  { type: 'function', name: 'mintProfile', inputs: [{ name: 'to', type: 'address' }, { name: 'username', type: 'string' }], outputs: [{ type: 'uint256' }], stateMutability: 'nonpayable' },
  // Events
  { type: 'event', name: 'ProfileMinted', inputs: [{ name: 'wallet', type: 'address', indexed: true }, { name: 'tokenId', type: 'uint256', indexed: true }, { name: 'username', type: 'string', indexed: false }] },
  { type: 'event', name: 'ReputationAdded', inputs: [{ name: 'wallet', type: 'address', indexed: true }, { name: 'communityId', type: 'uint256', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }, { name: 'newTotal', type: 'uint256', indexed: false }] },
] as const;

export const CommunityRegistry_ABI = [
  // Read
  { type: 'function', name: 'getCommunity', inputs: [{ name: 'communityId', type: 'uint256' }], outputs: [{ type: 'tuple', components: [{ name: 'id', type: 'uint256' }, { name: 'name', type: 'string' }, { name: 'location', type: 'string' }, { name: 'host', type: 'address' }, { name: 'createdAt', type: 'uint256' }, { name: 'active', type: 'bool' }] }], stateMutability: 'view' },
  { type: 'function', name: 'getEvent', inputs: [{ name: 'eventId', type: 'uint256' }], outputs: [{ type: 'tuple', components: [{ name: 'id', type: 'uint256' }, { name: 'communityId', type: 'uint256' }, { name: 'name', type: 'string' }, { name: 'startTime', type: 'uint256' }, { name: 'endTime', type: 'uint256' }, { name: 'qrHash', type: 'bytes32' }, { name: 'reputationReward', type: 'uint256' }, { name: 'minReputationRequired', type: 'uint256' }, { name: 'host', type: 'address' }, { name: 'finalized', type: 'bool' }, { name: 'attendeeCount', type: 'uint256' }] }], stateMutability: 'view' },
  { type: 'function', name: 'isMember', inputs: [{ name: 'communityId', type: 'uint256' }, { name: 'member', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'isHost', inputs: [{ name: 'wallet', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getCommunityMembers', inputs: [{ name: 'communityId', type: 'uint256' }], outputs: [{ type: 'address[]' }], stateMutability: 'view' },
  { type: 'function', name: 'getCommunityEvents', inputs: [{ name: 'communityId', type: 'uint256' }], outputs: [{ type: 'uint256[]' }], stateMutability: 'view' },
  { type: 'function', name: 'getEventAttendees', inputs: [{ name: 'eventId', type: 'uint256' }], outputs: [{ type: 'address[]' }], stateMutability: 'view' },
  { type: 'function', name: 'getCommunityCount', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'communityStake', inputs: [{ name: 'communityId', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'hasAttended', inputs: [{ name: 'eventId', type: 'uint256' }, { name: 'attendee', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'MIN_COMMUNITY_STAKE', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  // Write
  { type: 'function', name: 'joinCommunity', inputs: [{ name: 'communityId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'createCommunity', inputs: [{ name: 'name', type: 'string' }, { name: 'location', type: 'string' }], outputs: [{ type: 'uint256' }], stateMutability: 'payable' },
  { type: 'function', name: 'createEvent', inputs: [{ name: 'communityId', type: 'uint256' }, { name: 'name', type: 'string' }, { name: 'startTime', type: 'uint256' }, { name: 'endTime', type: 'uint256' }, { name: 'qrHash', type: 'bytes32' }, { name: 'reputationReward', type: 'uint256' }, { name: 'minReputationRequired', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'finalizeEvent', inputs: [{ name: 'eventId', type: 'uint256' }, { name: 'attendees', type: 'address[]' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'deactivateCommunity', inputs: [{ name: 'communityId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'withdrawStake', inputs: [{ name: 'communityId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  // Events
  { type: 'event', name: 'CommunityCreated', inputs: [{ name: 'communityId', type: 'uint256', indexed: true }, { name: 'name', type: 'string', indexed: false }, { name: 'host', type: 'address', indexed: true }] },
  { type: 'event', name: 'MemberJoined', inputs: [{ name: 'communityId', type: 'uint256', indexed: true }, { name: 'member', type: 'address', indexed: true }] },
  { type: 'event', name: 'AttendanceRecorded', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'eventId', type: 'uint256', indexed: true }] },
] as const;

// Arbitrum Sepolia (chain ID 421614)
export const CONTRACTS = {
  chainId: 421614,
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  UserProfileNFT: '0xa69236efd3fb58c9c58c0eacc6336b423235bcf2' as `0x${string}`,
  CommunityRegistry: '0xe98e5e346eb2bd88177980860ff08242c6273edc' as `0x${string}`,
  deployer: '0xfC6e72A7CC4f3DB0F30F04C8c59CdF83C8177B05' as `0x${string}`,
} as const;
