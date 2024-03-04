import { EntitySubscriberInterface, EventSubscriber, RemoveEvent } from "typeorm";
import UserMediaCatalog from "src/Core/Domains/UserMediaCatalog";
import Media from "src/Core/Domains/Media";

@EventSubscriber()
export default class UserMediaCatalogSubscriber implements EntitySubscriberInterface<UserMediaCatalog> {
    listenTo() {
        return UserMediaCatalog;
    }

    async afterRemove(event: RemoveEvent<UserMediaCatalog>) {
        const entityManager = event.manager;
        const userMediaCatalog = event.entity;

        const count = await entityManager.count(UserMediaCatalog, {
            where: {
                media: userMediaCatalog.media
            }
        });

        if (count === 0) {
            await entityManager.remove(Media, userMediaCatalog.media);
        }
    }
}
