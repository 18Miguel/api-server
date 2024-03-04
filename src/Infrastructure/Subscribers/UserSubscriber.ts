import { DataSource, EntitySubscriberInterface, EventSubscriber, RemoveEvent, UpdateEvent } from "typeorm";
import { Inject } from "@nestjs/common";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import User from "src/Core/Domains/User";

@EventSubscriber()
export default class UserSubscriber implements EntitySubscriberInterface<User> {
    constructor(
        dataSource: DataSource,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return User;
    }

    private async removeTokenFromCache(event: UpdateEvent<User> | RemoveEvent<User>) {
        const user = event.entity;
        const entityManager = event.manager;
        const existingUser = await entityManager.findOneBy(User, { id: user.id });

        if (existingUser) {
            await this.cacheManager.del(existingUser.apiToken);
        }
    }

    async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
        await this.removeTokenFromCache(event);
    }

    async beforeRemove(event: RemoveEvent<User>): Promise<void> {
        await this.removeTokenFromCache(event);
    }
}
