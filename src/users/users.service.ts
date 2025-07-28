import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { User } from 'src/auth/entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAllUsers(reqQuery) {
    const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.role != :adminRole', { adminRole: 'admin' })
      .andWhere('user.deleted != :deleted', { deleted: true });

    if (reqQuery.role && reqQuery.role !== 'admin' && reqQuery.role !== '') {
      queryBuilder.andWhere('user.role = :role', { role: reqQuery.role });
    }

    if (reqQuery.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.name ILIKE :search)',
        { search: `%${reqQuery.search}%` },
      );
    }

    const [users, totalCount] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    for (const user of users) {
      if (user.profilePic && user.profilePic !== '') {
        user.profilePic =
          `${process.env.IMAGE_HOST_URL}${user.profilePic}` || '';
      }
    }

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page;

    return {
      totalCount,
      totalPages,
      currentPage,
      list: users,
    };
  }

  async findById(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async isExist(query) {
    return await this.userRepository.find({ where: query });
  }

  async findByQuery(query) {
    return await this.userRepository.findOne({ where: query });
  }

  async findByQueryAndPopulate(query, relations: string[]) {
    return await this.userRepository.findOne({ where: query, relations });
  }

  async updateById(id: string, reqBody) {
    const update = await this.userRepository.update(id, reqBody);
    console.log('🚀 ~ UsersService ~ updateById ~ data:', update);
    const data = await this.findById(id);
    return data;
  }

  async deleteById(id: string, reqBody) {
    return await this.userRepository.update(id, reqBody);
  }

  async userCounts(query) {
    const data = await this.userRepository.count(query);
    return data;
  }

  async findAll(query) {
    return await this.userRepository.find({ where: query });
  }
  /**
   * Find all users that match the given query.
   * @param query Query object that is passed to the repository
   * @returns Array of users that match the query
   */
}
