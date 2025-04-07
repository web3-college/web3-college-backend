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
        name: createUserDto.name,
        address: createUserDto.address,
        email: createUserDto.email,
        avatar: createUserDto.avatar,
        bio: createUserDto.bio,
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

  async findByAddress(address: string) {
    return this.prismaClient.user.findUnique({
      where: { address },
    });
  }
}
