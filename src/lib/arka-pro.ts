import { ethers } from 'ethers';

const ARKA_PRO_ABI = [
  "function subscribe() external payable",
  "function isProHost(address user) external view returns (bool)",
  "function createCommunity(string calldata name) external",
  "function subscriptionPrice() external view returns (uint256)",
  "function subscriptionExpiry(address) external view returns (uint256)",
  "function communityOf(address) external view returns (string)",
  "event Subscribed(address indexed user, uint256 tokenId, uint256 expiry)",
  "event CommunityCreated(address indexed host, string name)"
];

// Contract address - will be set after deployment
const ARKA_PRO_ADDRESS = process.env.NEXT_PUBLIC_ARKA_PRO_CONTRACT || '';

const ARB_SEPOLIA_CHAIN_ID = 421614;
const ARB_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc';

export async function connectMetaMask(): Promise<ethers.providers.Web3Provider | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    alert('MetaMask is not installed!');
    return null;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Check/switch to Arbitrum Sepolia
    const network = await provider.getNetwork();
    if (network.chainId !== ARB_SEPOLIA_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${ARB_SEPOLIA_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${ARB_SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: 'Arbitrum Sepolia',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [ARB_SEPOLIA_RPC],
              blockExplorerUrls: ['https://sepolia.arbiscan.io/']
            }]
          });
        } else {
          throw switchError;
        }
      }
    }

    return provider;
  } catch (error) {
    console.error('MetaMask connection failed:', error);
    return null;
  }
}

export async function subscribeWithMetaMask(): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const provider = await connectMetaMask();
  if (!provider) return { success: false, error: 'MetaMask connection failed' };

  if (!ARKA_PRO_ADDRESS) {
    return { success: false, error: 'Contract not deployed yet. Please contact support.' };
  }

  try {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(ARKA_PRO_ADDRESS, ARKA_PRO_ABI, signer);
    
    const price = await contract.subscriptionPrice();
    const tx = await contract.subscribe({ value: price });
    await tx.wait();
    
    return { success: true, txHash: tx.hash };
  } catch (error: any) {
    console.error('Subscription failed:', error);
    return { success: false, error: error.message || 'Transaction failed' };
  }
}

export async function createCommunityOnChain(name: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const provider = await connectMetaMask();
  if (!provider) return { success: false, error: 'MetaMask connection failed' };

  if (!ARKA_PRO_ADDRESS) {
    return { success: false, error: 'Contract not deployed yet' };
  }

  try {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(ARKA_PRO_ADDRESS, ARKA_PRO_ABI, signer);
    
    const tx = await contract.createCommunity(name);
    await tx.wait();
    
    return { success: true, txHash: tx.hash };
  } catch (error: any) {
    console.error('Community creation failed:', error);
    return { success: false, error: error.message || 'Transaction failed' };
  }
}

export async function checkIsProHost(address: string): Promise<boolean> {
  if (!ARKA_PRO_ADDRESS) return false;

  try {
    const provider = new ethers.providers.JsonRpcProvider(ARB_SEPOLIA_RPC);
    const contract = new ethers.Contract(ARKA_PRO_ADDRESS, ARKA_PRO_ABI, provider);
    return await contract.isProHost(address);
  } catch (error) {
    console.error('Failed to check pro status:', error);
    return false;
  }
}

export async function getSubscriptionExpiry(address: string): Promise<number> {
  if (!ARKA_PRO_ADDRESS) return 0;

  try {
    const provider = new ethers.providers.JsonRpcProvider(ARB_SEPOLIA_RPC);
    const contract = new ethers.Contract(ARKA_PRO_ADDRESS, ARKA_PRO_ABI, provider);
    const expiry = await contract.subscriptionExpiry(address);
    return expiry.toNumber();
  } catch (error) {
    console.error('Failed to get expiry:', error);
    return 0;
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
