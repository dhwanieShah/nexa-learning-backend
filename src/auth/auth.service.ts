import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async save(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findByQuery(query: Partial<User>): Promise<User | undefined> {
    return this.userRepository.findOne({ where: query });
  }

  async updateById(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.userRepository.findOne({ where: { id } });
  }

  async deleteById(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async customFind(
    query,
    select: (keyof User)[] = [],
    relations: string[] = [],
  ): Promise<User | undefined> {
    const options: FindOneOptions<User> = {
      where: query,
      relations,
      select: select.length ? select : undefined,
    };
    return this.userRepository.findOne(options);
  }
}
