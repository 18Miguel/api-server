import UserAuthDto from "src/Core/DTO/UserAuthDto";
import UserCredentialsDto from "src/Core/DTO/UserCredentialsDto";
import UserUpdateDto from "src/Core/DTO/UserUpdateDto";

export default interface IAuthService {
    registerNewAccount(userCredentialsDto: UserCredentialsDto): Promise<UserAuthDto>;
    login(userCredentialsDto: UserCredentialsDto): Promise<UserAuthDto>;
    updateAccount(userUpdateDto: UserUpdateDto): Promise<UserAuthDto>;
    deleteAccount(id: number, userCredentialsDto: UserCredentialsDto): Promise<void>;
    isAPIKeyValid(apiKey: string): Promise<boolean>;
}
