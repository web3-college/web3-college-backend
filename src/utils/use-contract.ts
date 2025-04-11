import { queryContract } from "./contract-reader";

const hasCourseAbi = {
  "inputs": [
    {
      "internalType": "address",
      "name": "user",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "web2CourseId",
      "type": "string"
    }
  ],
  "name": "hasCourse",
  "outputs": [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

export const hasCourse = async (address: string, courseId: string) => {
  const result = await queryContract(process.env.COURSE_MARKET_ADDRESS, hasCourseAbi, 'hasCourse', [address, courseId]);
  return result;
}