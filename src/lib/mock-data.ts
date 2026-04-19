export type User = {
  id: string;
  username: string;
  address: string;
  memberSince: string;
  nftBadge: string;
};

export type Community = {
  id: string;
  name: string;
  location: string;
  members: number;
  stake: string;
  createdAt: string;
  membershipFee?: string;
  description?: string;
};

export type Membership = {
  communityId: string;
  userId: string;
  rank: number;
  rep: number;
  badges: string[];
  tier: 'free' | 'member';
};

export type Meetup = {
  id: string;
  communityId: string;
  name: string;
  datetime: string;
  location: string;
  attendeeIds: string[];
  repReward: number;
};

export const users: User[] = [
  {
    id: 'u1',
    username: '@cryptoalex',
    address: '0x9f9c2E13B29fEe3a09A9388e8D5F9D2EF18fA431',
    memberSince: '2023-08-11',
    nftBadge: 'Genesis Explorer',
  },
  {
    id: 'u2',
    username: '@ethberlin_sarah',
    address: '0x1ab4B9B4e1E79EF95FC7bb5D233Ff859547B67f0',
    memberSince: '2022-11-03',
    nftBadge: 'Hackathon Hero',
  },
  {
    id: 'u3',
    username: '@web3_marcus',
    address: '0x9bB7E8Ca28EBAf6B4Afa5DA00AAce92A2Dd5D5cA',
    memberSince: '2021-04-15',
    nftBadge: 'Validator Ally',
  },
  {
    id: 'u4',
    username: '@defi_diana',
    address: '0x7D6e4a8f3f6E80fCfa5e54aA63Ab18f9D8B0f6b3',
    memberSince: '2022-05-28',
    nftBadge: 'Liquidity Legend',
  },
  {
    id: 'u5',
    username: '@nft_nikolai',
    address: '0x2f98e4dff73f2c63D6f4B86A4fC4E989E0bA4799',
    memberSince: '2023-01-22',
    nftBadge: 'Collector Prime',
  },
  {
    id: 'u6',
    username: '@sol_olivia',
    address: '0x4a5eCC12aAbfAFe0e8cD56dbD30707617Cd3A1E4',
    memberSince: '2021-12-04',
    nftBadge: 'Bridge Master',
  },
  {
    id: 'u7',
    username: '@dao_jamal',
    address: '0x30D1b9C8f5b9A2Cd3fFfE325f80c6eF21A8aB1E0',
    memberSince: '2024-02-06',
    nftBadge: 'Governance Guru',
  },
  {
    id: 'u8',
    username: '@zk_priya',
    address: '0x72A54EA47eaF8f76b1A2f27DEbA9a4f2B4DD8D21',
    memberSince: '2022-09-09',
    nftBadge: 'Proof Pioneer',
  },
  {
    id: 'u9',
    username: '@l2_tomas',
    address: '0x834Da2F2dFFfC228B73D88cB5357ae35E5D1FD78',
    memberSince: '2023-10-30',
    nftBadge: 'Rollup Ranger',
  },
  {
    id: 'u10',
    username: '@onchain_lina',
    address: '0x6C59cA47C7bBd4f4eF17922EC4D0B4Af4f4dfb43',
    memberSince: '2022-03-18',
    nftBadge: 'Data Oracle',
  },
];

export const currentUserId = 'u1';

export const communities: Community[] = [
  {
    id: 'eth-budapest',
    name: 'ETH Budapest',
    location: 'Budapest, Hungary',
    members: 47,
    stake: '0.05 ETH',
    createdAt: '2022-10-12',
    membershipFee: '2 USDC/mo',
    description: 'Budapest\'s premier Ethereum community — builders, researchers, and enthusiasts.',
  },
  {
    id: 'arbitrum-builders',
    name: 'Arbitrum Builders',
    location: 'Remote / Global',
    members: 124,
    stake: '0.1 ETH',
    createdAt: '2021-06-07',
    membershipFee: '5 USDC/mo',
    description: 'Global community for developers building on Arbitrum L2.',
  },
  {
    id: 'web3-nomads',
    name: 'Web3 Nomads',
    location: 'Lisbon, Portugal',
    members: 31,
    stake: '0.02 ETH',
    createdAt: '2023-04-19',
    membershipFee: '1 USDC/mo',
    description: 'Digital nomads exploring web3 from Lisbon and beyond.',
  },
];

export const memberships: Membership[] = [
  {
    communityId: 'eth-budapest',
    userId: 'u1',
    rank: 12,
    rep: 450,
    badges: ['IRL Connector', 'Builder'],
    tier: 'member',
  },
  {
    communityId: 'arbitrum-builders',
    userId: 'u1',
    rank: 3,
    rep: 2100,
    badges: ['Core Contributor', 'Speaker'],
    tier: 'member',
  },
  { communityId: 'eth-budapest', userId: 'u2', rank: 2, rep: 2400, badges: ['Organizer'], tier: 'member' },
  { communityId: 'eth-budapest', userId: 'u3', rank: 5, rep: 1650, badges: ['Mentor'], tier: 'member' },
  { communityId: 'eth-budapest', userId: 'u4', rank: 1, rep: 2800, badges: ['Champion'], tier: 'member' },
  { communityId: 'eth-budapest', userId: 'u5', rank: 8, rep: 780, badges: ['Helper'], tier: 'free' },
  { communityId: 'arbitrum-builders', userId: 'u2', rank: 6, rep: 1200, badges: ['Auditor'], tier: 'member' },
  { communityId: 'arbitrum-builders', userId: 'u3', rank: 2, rep: 2350, badges: ['Architect'], tier: 'member' },
  { communityId: 'arbitrum-builders', userId: 'u4', rank: 7, rep: 1120, badges: ['Mentor'], tier: 'free' },
  { communityId: 'arbitrum-builders', userId: 'u6', rank: 1, rep: 2600, badges: ['Lead'], tier: 'member' },
  { communityId: 'web3-nomads', userId: 'u7', rank: 1, rep: 1200, badges: ['Host'], tier: 'member' },
  { communityId: 'web3-nomads', userId: 'u8', rank: 2, rep: 990, badges: ['Scout'], tier: 'member' },
  { communityId: 'web3-nomads', userId: 'u9', rank: 3, rep: 850, badges: ['Explorer'], tier: 'free' },
  { communityId: 'web3-nomads', userId: 'u10', rank: 4, rep: 640, badges: ['Navigator'], tier: 'free' },
];

export const meetups: Meetup[] = [
  {
    id: 'm1',
    communityId: 'eth-budapest',
    name: 'Zero-Knowledge Night',
    datetime: '2026-05-03T18:30:00Z',
    location: 'Graphisoft Park, Budapest',
    attendeeIds: ['u1', 'u2', 'u3', 'u8', 'u9'],
    repReward: 120,
  },
  {
    id: 'm2',
    communityId: 'eth-budapest',
    name: 'Onchain Governance Workshop',
    datetime: '2026-05-21T16:00:00Z',
    location: 'Budapest Tech Hub',
    attendeeIds: ['u1', 'u2', 'u4', 'u5', 'u10'],
    repReward: 90,
  },
  {
    id: 'm3',
    communityId: 'arbitrum-builders',
    name: 'Arbitrum Dev Sprint',
    datetime: '2026-04-28T17:00:00Z',
    location: 'Online (Telegram Live)',
    attendeeIds: ['u1', 'u3', 'u6', 'u7', 'u8', 'u9'],
    repReward: 130,
  },
  {
    id: 'm4',
    communityId: 'arbitrum-builders',
    name: 'Smart Contract Security Clinic',
    datetime: '2026-04-02T18:00:00Z',
    location: 'Lisbon Innovation Dock',
    attendeeIds: ['u1', 'u2', 'u3', 'u4', 'u6'],
    repReward: 140,
  },
  {
    id: 'm5',
    communityId: 'web3-nomads',
    name: 'Nomad Builders Brunch',
    datetime: '2026-05-10T10:30:00Z',
    location: 'Miradouro Terrace, Lisbon',
    attendeeIds: ['u7', 'u8', 'u9', 'u10'],
    repReward: 75,
  },
  {
    id: 'm6',
    communityId: 'web3-nomads',
    name: 'Cross-chain Storytelling',
    datetime: '2026-03-20T14:00:00Z',
    location: 'LX Factory, Lisbon',
    attendeeIds: ['u7', 'u8', 'u9', 'u10', 'u3'],
    repReward: 80,
  },
  {
    id: 'm7',
    communityId: 'eth-budapest',
    name: 'Layer 2 Founders Circle',
    datetime: '2026-02-16T17:30:00Z',
    location: 'Danube Cowork, Budapest',
    attendeeIds: ['u1', 'u2', 'u4', 'u5', 'u6'],
    repReward: 110,
  },
  {
    id: 'm8',
    communityId: 'arbitrum-builders',
    name: 'Bridge UX Roundtable',
    datetime: '2026-05-26T15:30:00Z',
    location: 'Online (Telegram Space)',
    attendeeIds: ['u1', 'u3', 'u4', 'u6', 'u8', 'u10'],
    repReward: 95,
  },
];

export const getCurrentUser = () => users.find((user) => user.id === currentUserId)!;

export const getCommunityById = (communityId: string) =>
  communities.find((community) => community.id === communityId);

export const getMeetupById = (meetupId: string) =>
  meetups.find((meetup) => meetup.id === meetupId);

export const getUserById = (userId: string) => users.find((user) => user.id === userId);

export const getMembershipForUser = (communityId: string, userId = currentUserId) =>
  memberships.find((entry) => entry.communityId === communityId && entry.userId === userId);

export const getCommunityLeaderboard = (communityId: string) => {
  const relevant = memberships
    .filter((entry) => entry.communityId === communityId)
    .sort((a, b) => a.rank - b.rank);

  return relevant
    .map((entry) => {
      const user = getUserById(entry.userId);
      if (!user) return null;
      return {
        user,
        rep: entry.rep,
        rank: entry.rank,
      };
    })
    .filter((entry): entry is { user: User; rep: number; rank: number } => entry !== null)
    .sort((a, b) => a.rank - b.rank);
};

export const getMeetupsForCommunity = (communityId: string) =>
  meetups.filter((meetup) => meetup.communityId === communityId);

export const isUpcomingMeetup = (datetime: string) => new Date(datetime).getTime() > Date.now();

export const formatDateTime = (datetime: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(datetime));

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(date));

export const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
