import { Injectable } from '@nestjs/common';
import {
    PrismaService,
    Prisma,
    SelectSubset,
} from '@kdx-redeemed/prisma-client';


@Injectable()
export class UserWalletService {
    constructor(private prisma: PrismaService) { }

    async create<T extends Prisma.UserWalletCreateArgs>(data: SelectSubset<T, Prisma.UserWalletCreateArgs>) {
        return this.prisma.userWallet.create<T>(data);
    }

    async findUnique<T extends Prisma.UserWalletFindUniqueArgs>(data: SelectSubset<T, Prisma.UserWalletFindUniqueArgs>) {
        return this.prisma.userWallet.findUnique<T>(data);
    }

    async findMany<T extends Prisma.UserWalletFindManyArgs>(data?: SelectSubset<T, Prisma.UserWalletFindManyArgs>) {
        return this.prisma.userWallet.findMany<T>(data);
    }

    async update<T extends Prisma.UserWalletUpdateArgs>(data: SelectSubset<T, Prisma.UserWalletUpdateArgs>) {
        return this.prisma.userWallet.update<T>(data);
    }

    async delete<T extends Prisma.UserWalletDeleteArgs>(data: SelectSubset<T, Prisma.UserWalletDeleteArgs>) {
        return this.prisma.userWallet.delete<T>(data);
    }
}