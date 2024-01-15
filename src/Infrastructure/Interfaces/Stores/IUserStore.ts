import UserDto from 'src/Core/DTO/UserDto';

export default interface IUserStore {
    findAll(): Promise<Array<UserDto>>;
    findOne(id: number): Promise<UserDto>;
    create(userDto: UserDto): Promise<UserDto>;
    update(id: number, userDto: UserDto): Promise<UserDto>;
    remove(id: number): Promise<void>;
}