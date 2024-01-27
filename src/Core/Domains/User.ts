import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import UserRoles from '../Types/Enums/UserRoles';

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;
    
    @Column({ enum: UserRoles })
    role: UserRoles;

    @Column({ unique: true })
    apiKey: string;

    @Column({ default: new Date().toJSON() })
    apiKeyCreateAt: Date;
}
