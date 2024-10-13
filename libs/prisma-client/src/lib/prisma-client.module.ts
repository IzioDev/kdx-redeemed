import { Module } from '@nestjs/common';
import { PrismaService } from './prisma-client.service';

@Module({
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaClientModule { }
