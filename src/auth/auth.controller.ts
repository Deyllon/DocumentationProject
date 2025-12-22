import { Controller, Request, Post, UseGuards, Body, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { loginSchema, LoginDto } from './dto/login.dto';
import { ApiDescription } from '../common/decorators/api-description.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiDescription('Autentica um usuário com email e senha, retornando um token JWT para acesso aos endpoints protegidos')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      return { message: 'Unauthorized' };
    }
    return this.authService.login(user);
  }
}
