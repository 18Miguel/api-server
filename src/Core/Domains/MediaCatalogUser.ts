import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./User";
import MediaCatalog from "./MediaCatalog";

@Entity()
export default class MediaCatalogUser {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => MediaCatalog, mediaCatalog => mediaCatalog.usersList, { cascade: true })
    public mediaCatalog: MediaCatalog;

    @ManyToOne(() => User, user => user.mediaCatalogList, { cascade: true })
    public user: User;

    @Column()
    public watched: boolean;
}
