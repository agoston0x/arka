# Proof-of-commitment Treasury on Blockchain

## Tech Stack
- **Smart contracts**: Solidity + Foundry (Anvil local dev → Sepolia)
- **Frontend**: Next.js (App Router)
- **Database**: SQLite via `@libsql/client` (Turso-compatible, works with Next.js on Vercel)
- **AI**: Claude API (Anthropic SDK)
- **Wallet**: wagmi v2 + viem + @tanstack/react-query

## Architecture

### Blockchain (Contracts)

#### `UserProfileNFT.sol` (ERC721)
- Each user mints a profile NFT on first login
- On-chain stored: `trustScore` (uint256), `totalRespect` (uint256), `memberSince` (timestamp)
- Token URI points to metadata with stats, badges, rank

#### `MeetingContract.sol`
- Meeting owner deploys a new contract instance per meeting
- Stores: `meetingId`, `startTime`, `endTime`, `attendeeCount`, `QRCodeHash`
- Attendees call `checkIn(bytes32 qrHash)` during window → their presence is recorded
- After meeting, `finalize()` writes aggregated presence to UserProfileNFT

#### `TreasuryContract.sol`
- Holds ETH for the community
- AI proposes "member of the month" → creates `Proposal`
- Community votes (`support` / `oppose`)
- At 51% support → payout triggered (70% to winner, 30% to vault)
- 3 voting rounds max → after 3 fails, AI suggestion auto-executes
- Emergency fund requests: separate `EmergencyProposal` with higher threshold

### Off-chain Database (SQLite via libsql)

Tables:
- `users` — `id`, `wallet_address`, `username`, `profile_nft_token_id`, `offchain_points`, `created_at`
- `meetings` — `id`, `contract_address`, `host_wallet`, `title`, `start_time`, `end_time`, `qr_code_hash`, `status`, `min_attendance`
- `check_ins` — `id`, `meeting_id`, `user_id`, `scanned_at`, `onchain_confirmed`
- `proposals` — `id`, `treasury_contract`, `proposed_user_id`, `round`, `votes_for`, `votes_against`, `status`
- `ai_suggestions` — `id`, `user_id`, `reasoning`, `proposed_at`

### Frontend (Next.js)

**Pages:**
- `/` — Landing / hero
- `/dashboard` — Main user dashboard
- `/admin` — Host meeting creation + treasury management
- `/meeting/[id]` — Live meeting page with QR scanner
- `/profile/[wallet]` — Public profile view (NFT metadata)
- `/treasury` — Treasury overview, active proposals, voting

**Key UI components:**
- Wallet connect button (wagmi)
- QR scanner using `html5-qrcode`
- Real-time vote tally (SSE or polling)
- AI suggestion card with reasoning
- Leaderboard with trust scores

## Demo Flow (for hackathon demo)

1. Host creates a meeting → contract deployed → QR code generated
2. Attendees scan QR during meeting window → check-ins stored off-chain
3. After meeting → presence pushed on-chain
4. AI reads on-chain + off-chain data → proposes member of month
5. Community votes → 51% triggers payout
6. User dashboard shows points, reputation NFT, pending proposals

## Key UX for Demo

- **QR scanning** must work in-browser (no mobile wallet app required)
- **Voting** must be one-click (supports/oppose buttons)
- **AI suggestion** shows reasoning text (Claude API)
- **On-chain confirmation** shows transaction status with block explorer link
- **Leaderboard** updates in real-time after on-chain writes

## Environment Variables

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
PRIVATE_KEY=            # Deployer key (safe in backend only)
CLAUDE_API_KEY=         # For AI proposals
TURSO_DATABASE_URL=     # libsql DB URL
TURSO_AUTH_TOKEN=
```