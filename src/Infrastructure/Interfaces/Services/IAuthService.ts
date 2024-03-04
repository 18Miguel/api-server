import UserAuthDto from "src/Core/DTO/UserAuthDto";
import UserCredentialsDto from "src/Core/DTO/UserCredentialsDto";
import UserDto from "src/Core/DTO/UserDto";
import UserUpdateDto from "src/Core/DTO/UserUpdateDto";

export default interface IAuthService {
    registerNewAccount(userCredentialsDto: UserCredentialsDto): Promise<UserAuthDto>;
    login(userCredentialsDto: UserCredentialsDto): Promise<UserAuthDto>;
    updateAccount(id: number, userUpdateDto: UserUpdateDto): Promise<UserAuthDto>;
    deleteAccount(id: number, userCredentialsDto: UserCredentialsDto): Promise<boolean>;
    isAPITokenValid(apiToken: string): Promise<{ validToken: boolean, userId: number }>;
    findUserByApiToken(apiToken: string): Promise<UserDto>;
}
