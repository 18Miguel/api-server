import UserDto from 'src/Core/DTO/UserDto';

export default interface IUserStore {
   findAll(): Promise<Array<UserDto>>;
   findOneById(id: number): Promise<UserDto>;
   findOneByUsername(username: string): Promise<UserDto>;
   findOneByApiToken(apiToken: string): Promise<UserDto>;
   create(userDto: UserDto): Promise<UserDto>;
   update(id: number, userDto: UserDto): Promise<UserDto>;
   remove(id: number): Promise<boolean>;
}
