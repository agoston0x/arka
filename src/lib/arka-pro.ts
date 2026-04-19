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

const ARKA_PRO_ADDRESS = process.env.NEXT_PUBLIC_ARKA_PRO_CONTRACT || '0x549A60bbcC8110A5334ED7e435990378B00146d3';
const ARB_SEPOLIA_CHAIN_ID = 421614;
const ARB_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc';

// Use Dynamic embedded wallet to get a signer
export async function getDynamicSigner(primaryWallet: any): Promise<ethers.Signer | null> {
  if (!primaryWallet) return null;

  try {
    // Switch to Arbitrum Sepolia if needed
    const currentChainId = await primaryWallet.getNetwork();
    if (currentChainId !== ARB_SEPOLIA_CHAIN_ID) {
      await primaryWallet.switchNetwork(ARB_SEPOLIA_CHAIN_ID);
    }

    // Get the wallet client (ethers provider/signer)
    const walletClient = await (primaryWallet as any).getWalletClient();
    
    // For Dynamic embedded wallets, we can get an ethers signer
    if (walletClient?.account) {
      // viem wallet client — wrap in ethers
      const provider = new ethers.providers.JsonRpcProvider(ARB_SEPOLIA_RPC);
      // Use the embedded wallet's private signing capability via window.ethereum
      if (typeof window !== 'undefined' && window.ethereum) {
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = ethersProvider.getSigner();
        return signer;
      }
    }

    // Fallback: try direct ethers provider from window.ethereum
    if (typeof window !== 'undefined' && window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Switch chain if needed
      const network = await provider.getNetwork();
      if (network.chainId !== ARB_SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${ARB_SEPOLIA_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
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
          }
        }
      }
      return provider.getSigner();
    }

    return null;
  } catch (error) {
    console.error('Failed to get signer:', error);
    return null;
  }
}

export async function subscribeWithDynamic(primaryWallet: any): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const signer = await getDynamicSigner(primaryWallet);
  if (!signer) return { success: false, error: 'Could not connect wallet' };

  if (!ARKA_PRO_ADDRESS) {
    return { success: false, error: 'Contract not deployed yet' };
  }

  try {
    const contract = new ethers.Contract(ARKA_PRO_ADDRESS, ARKA_PRO_ABI, signer);
    const price = await contract.subscriptionPrice();
    const tx = await contract.subscribe({ value: price });
    await tx.wait();
    return { success: true, txHash: tx.hash };
  } catch (error: any) {
    console.error('Subscription failed:', error);
    return { success: false, error: error.reason || error.message || 'Transaction failed' };
  }
}

export async function createCommunityOnChain(primaryWallet: any, name: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const signer = await getDynamicSigner(primaryWallet);
  if (!signer) return { success: false, error: 'Could not connect wallet' };

  if (!ARKA_PRO_ADDRESS) {
    return { success: false, error: 'Contract not deployed yet' };
  }

  try {
    const contract = new ethers.Contract(ARKA_PRO_ADDRESS, ARKA_PRO_ABI, signer);
    const tx = await contract.createCommunity(name);
    await tx.wait();
    return { success: true, txHash: tx.hash };
  } catch (error: any) {
    console.error('Community creation failed:', error);
    return { success: false, error: error.reason || error.message || 'Transaction failed' };
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

export { ARKA_PRO_ADDRESS, ARB_SEPOLIA_CHAIN_ID };

declare global {
  interface Window {
    ethereum?: any;
  }
}
