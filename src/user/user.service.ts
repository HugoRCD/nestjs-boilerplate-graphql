import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateUserInput, CreateUserOutput} from './dto/user-create.input';
import {User} from './entities/user.entity';
import {SortDirection} from "../pagination/dto/pagination.dto";
import {UsersPagination, UsersPaginationArgs} from "./dto/user-pagination.dto";
import {Role} from "../role/entities/role.entity";
import {RoleService} from "../role/role.service";
import {MailingService} from "../mailing/mailing.service";
import {UpdateUserInput, UpdateUserOutput} from "./dto/user-update.input";
import {DeleteUserOutput} from "./dto/user-delete.input";

const bcrypt = require('bcrypt');

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private roleService: RoleService,
        private MailingService: MailingService,
    ) {
    }

    async hashPassword(passwordToHash: string) {
        const saltRounds = 10;
        return bcrypt.hash(passwordToHash, saltRounds);
    }

    async deHashPassword(passwordToDeHash: string, passwordHash: string) {
        return bcrypt.compare(passwordToDeHash, passwordHash);
    }

    async createUser(input: CreateUserInput): Promise<CreateUserOutput> {
        input.password = await this.hashPassword(input.password);
        const user = this.userRepository.create(input);
        await user.save();
        this.MailingService.sendMail(user, 'welcome', 'Welcome !!!');
        return {
            user,
        };
    }

    async updateUser(userId: User['id'], input: UpdateUserInput): Promise<UpdateUserOutput> {
        const user = await this.userRepository.findOne(userId);
        if (input.password) {
            input.password = await this.hashPassword(input.password);
        }
        this.userRepository.merge(user, input);
        await this.userRepository.save(user);
        return {
            user,
        };
    }

    async deleteUser(userId: User['id']): Promise<DeleteUserOutput> {
        const user = await this.userRepository.findOne(userId);
        await this.userRepository.remove(user);
        return {
            userId,
        }
    }

    async userGetByLogin(login: string): Promise<User> {
        return this.userRepository.findOne({where: [{email: login}, {username: login}, {telephone: login}]});
    }

    async getUserById(id: number): Promise<User> {
        return this.userRepository.findOne(id);
    }

    getRoleById(roleId: number): Promise<Role> {
        return this.roleService.getRoleById(roleId);
    }

    async usersPagination(
        args: UsersPaginationArgs,
    ): Promise<UsersPagination> {
        const qb = this.userRepository.createQueryBuilder('user');
        qb.take(args.take);
        qb.skip(args.skip);
        if (args.sortBy) {
            if (args.sortBy.createdAt !== null) {
                qb.addOrderBy(
                    'user.createdAt',
                    args.sortBy.createdAt === SortDirection.ASC ? 'ASC' : 'DESC',
                );
            }
        }
        const [nodes, totalCount] = await qb.getManyAndCount();
        return {nodes, totalCount};
    }
}
