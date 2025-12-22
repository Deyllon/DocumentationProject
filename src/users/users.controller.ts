import { Controller, Get, Post, Body, Put, Param, UseGuards, UsePipes, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createUserSchema, CreateUserDto } from './dto/create-user.dto';
import { ApiDescription } from '../common/decorators/api-description.decorator';
import { testSchema, TestDto } from './dto/test.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiDescription('Registra um novo usuário no sistema')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiDescription('Lista todos os usuários cadastrados no sistema')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  @ApiDescription('Busca usuários por nome ou email usando filtros opcionais')
  async search(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.search({ name, email, limit: limit ? parseInt(limit) : 10 });
  }

  @Put(':id')
  @ApiDescription('Atualiza os dados de um usuário existente')
  @UsePipes(new ZodValidationPipe(createUserSchema.partial()))
  async update(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.usersService.update(+id, updateUserDto);
  }


  @Get('test/query')
  @ApiDescription('Endpoint de teste com query params de diferentes tipos')
  async testQuery(
    @Query('age') age?: string,
    @Query('isActive') isActive?: string,
    @Query('score') score?: string,
  ) {
    return {
      age: age ? parseInt(age) : undefined,
      isActive: isActive === 'true',
      score: score ? parseFloat(score) : undefined,
    };
  }

  @Post('test/body')
  @ApiDescription('Endpoint de teste com body contendo number e boolean')
  @UsePipes(new ZodValidationPipe(testSchema))
  async testBody(@Body() testDto: TestDto) {
    return {
      message: 'Test successful',
      data: testDto,
    };
  }
}
