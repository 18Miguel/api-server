import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserRoles from '../Types/Enums/UserRoles';
import { MapProp } from 'ts-simple-automapper';
import MediaCatalogUser from './MediaCatalogUser';

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    @MapProp()
    public id: number;

    @Column({ unique: true })
    @MapProp()
    public username: string;

    @Column()
    @MapProp()
    public password: string;
    
    @Column({ enum: UserRoles })
    @MapProp()
    public role: UserRoles;

    @Column({ unique: true })
    @MapProp()
    public apiToken: string;

    @Column({ default: new Date().toJSON() })
    @MapProp()
    public apiTokenCreateAt: Date;

    @OneToMany(() => MediaCatalogUser, mediaCatalogUser => mediaCatalogUser.user)
    @JoinColumn()
    public mediaCatalogList: Array<MediaCatalogUser>;
}
