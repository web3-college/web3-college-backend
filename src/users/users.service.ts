import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PRISMA_DATABASE } from '@/database/database.constants';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(@Inject(PRISMA_DATABASE) private prismaClient: PrismaClient) {}

  create(createUserDto: CreateUserDto) {
    return this.prismaClient.user.create({
      data: {
        username: createUserDto.username,
        walletAddress: createUserDto.walletAddress,
      },
    });
  }

  findAll() {
    return this.prismaClient.user.findMany();
  }

  findOne(id: number) {
    return this.prismaClient.user.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prismaClient.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prismaClient.user.delete({
      where: {
        id,
      },
    });
  }

  async findByWalletAddress(walletAddress: string) {
    return this.prismaClient.user.findUnique({
      where: { walletAddress },
    });
  }
}
