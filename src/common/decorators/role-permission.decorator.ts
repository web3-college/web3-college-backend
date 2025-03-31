import { SetMetadata } from "@nestjs/common";
import { Actions } from "../enum/actions.enum";
import { Reflector } from "@nestjs/core";

export const PERMISSION_KEY = 'permission';

const accumulateMetadata = (key: string, permission: string) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    const reflector = new Reflector();
    if(descriptor && descriptor.value){
      const existingPermissions = reflector.get<string[]>(key, descriptor.value) || [];
      const newPermissions = [...existingPermissions, permission];
      SetMetadata(key, newPermissions)(target, propertyKey, descriptor);
    }else{
      const existingPermissions = reflector.get<string[]>(key, target) || [];
      const newPermissions = [...existingPermissions, permission];
      SetMetadata(key, newPermissions)(target);
    }
  }
}

export const Permission = (permission: string) => accumulateMetadata(PERMISSION_KEY, permission);

export const Create = () => accumulateMetadata(PERMISSION_KEY, Actions.Create.toLocaleLowerCase());
export const Read = () => accumulateMetadata(PERMISSION_KEY, Actions.Read.toLocaleLowerCase());
export const Update = () => accumulateMetadata(PERMISSION_KEY, Actions.Update.toLocaleLowerCase());
export const Delete = () => accumulateMetadata(PERMISSION_KEY, Actions.Delete.toLocaleLowerCase());
export const Manage = () => accumulateMetadata(PERMISSION_KEY, Actions.Manage.toLocaleLowerCase());

