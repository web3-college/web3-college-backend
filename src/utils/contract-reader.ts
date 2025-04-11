import { ethers } from 'ethers';

/**
 * 读取合约状态
 * @param contractAddress 合约地址
 * @param abi 合约ABI
 * @param providerUrl 以太坊提供者URL
 * @param functionName 要调用的函数名
 * @param args 函数参数
 * @returns 合约调用结果
 */
export const readContractState = async (
  contractAddress: string,
  abi: any[],
  providerUrl: string,
  functionName: string,
  args: any[] = []
): Promise<any> => {
  try {
    // 创建提供者
    const provider = new ethers.JsonRpcProvider(providerUrl);

    // 创建合约实例
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // 检查函数是否存在
    if (!contract[functionName]) {
      throw new Error(`合约不存在函数 ${functionName}`);
    }

    // 调用合约函数并返回结果
    return await contract[functionName](...args);
  } catch (error) {
    console.error(`读取合约状态失败: ${error.message}`);
    throw error;
  }
};

/**
 * 最简洁的合约读取函数 - 直接提供ABI
 * @param contractAddress 合约地址
 * @param abi 合约ABI (直接提供ABI数组或单个函数ABI对象)
 * @param functionName 函数名
 * @param args 函数参数
 * @param providerUrl 提供者URL (可选)
 * @returns 合约调用结果
 */
export const queryContract = async (
  contractAddress: string,
  abi: any[] | any,
  functionName: string,
  args: any[] = [],
  providerUrl: string = process.env.ETHEREUM_PROVIDER_URL || 'https://ethereum.publicnode.com'
): Promise<any> => {
  // 如果提供了单个函数ABI，将其转换为数组
  const abiArray = Array.isArray(abi) ? abi : [abi];

  // 调用合约
  return readContractState(
    contractAddress,
    abiArray,
    providerUrl,
    functionName,
    args
  );
};