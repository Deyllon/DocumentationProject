import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DocumentationModule } from './documentation/documentation.module';


@Module({
  imports: [UsersModule, AuthModule, DocumentationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
