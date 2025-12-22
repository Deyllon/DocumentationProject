import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

export type User = {
  id: number;
  name: string;
  email: string;
  password?: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  private idCounter = 1;

  async create(user: CreateUserDto): Promise<User> {
    const newUser = { id: this.idCounter++, ...user };
    this.users.push(newUser);
    const { password, ...result } = newUser;
    return result as User;
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findAll(): Promise<User[]> {
    return this.users.map(({ password, ...user }) => user as User);
  }

  async search(filters: { name?: string; email?: string; limit?: number }) {
    let results = this.users;

    if (filters.name) {
      results = results.filter(user => 
        user.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    if (filters.email) {
      results = results.filter(user => 
        user.email.toLowerCase().includes(filters.email!.toLowerCase())
      );
    }

    const limit = filters.limit || 10;
    return results.slice(0, limit).map(({ password, ...user }) => user as User);
  }

  async update(id: number, updateUser: Partial<User>): Promise<User | undefined> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex > -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updateUser };
      const { password, ...result } = this.users[userIndex];
      return result as User;
    }
    return undefined;
  }
}
