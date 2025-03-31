import { UseInterceptors } from "@nestjs/common";
import { SerializeInterceptor } from "../interceptors/serialize.interceptor";

interface ClassConstructor {
  new (...args: any[]): {}
}

export function Serialize(dto: ClassConstructor, flag: boolean = false) {
  return UseInterceptors(new SerializeInterceptor(dto, flag));
}