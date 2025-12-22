import { Module } from '@nestjs/common';
import { DocumentationService } from './documentation.service'; 
import { DocumentationController } from './documentation.controller'; 
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DiscoveryModule],
  providers: [DocumentationService],
  controllers: [DocumentationController],
  exports: [DocumentationService],
})
export class DocumentationModule {}
