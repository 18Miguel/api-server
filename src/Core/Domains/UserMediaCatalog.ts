import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./User";
import Media from "./Media";

@Entity()
export default class UserMediaCatalog {
    @PrimaryGeneratedColumn()
    public id?: number;

    @ManyToOne(() => Media, media => media.users, { onDelete: 'CASCADE' })
    public media: Media;

    @ManyToOne(() => User, user => user.mediaCatalog, { onDelete: 'CASCADE' })
    public user: User;

    @Column()
    public watched: boolean;
}
