import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1705356247682 implements MigrationInterface {
    name = 'Migration1705356247682'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "youtube_notifier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "channelsToPost" varchar NOT NULL DEFAULT ('[]'))`);
        await queryRunner.query(`CREATE TABLE "guild" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "birthdayRole" varchar, "birthdayChannel" varchar)`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "birthdayDate" datetime)`);
        await queryRunner.query(`CREATE TABLE "media_catalog" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "title" varchar NOT NULL, "releaseDate" datetime NOT NULL, "genres" varchar NOT NULL, "numberOfEpisodes" integer, "watched" boolean NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "guild_users_user" ("guildId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("guildId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2136b3410992b420dd7872e582" ON "guild_users_user" ("guildId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ac86f3a3e939611408d1eab9ff" ON "guild_users_user" ("userId") `);
        await queryRunner.query(`DROP INDEX "IDX_2136b3410992b420dd7872e582"`);
        await queryRunner.query(`DROP INDEX "IDX_ac86f3a3e939611408d1eab9ff"`);
        await queryRunner.query(`CREATE TABLE "temporary_guild_users_user" ("guildId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "FK_2136b3410992b420dd7872e5820" FOREIGN KEY ("guildId") REFERENCES "guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_ac86f3a3e939611408d1eab9ff3" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("guildId", "userId"))`);
        await queryRunner.query(`INSERT INTO "temporary_guild_users_user"("guildId", "userId") SELECT "guildId", "userId" FROM "guild_users_user"`);
        await queryRunner.query(`DROP TABLE "guild_users_user"`);
        await queryRunner.query(`ALTER TABLE "temporary_guild_users_user" RENAME TO "guild_users_user"`);
        await queryRunner.query(`CREATE INDEX "IDX_2136b3410992b420dd7872e582" ON "guild_users_user" ("guildId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ac86f3a3e939611408d1eab9ff" ON "guild_users_user" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_ac86f3a3e939611408d1eab9ff"`);
        await queryRunner.query(`DROP INDEX "IDX_2136b3410992b420dd7872e582"`);
        await queryRunner.query(`ALTER TABLE "guild_users_user" RENAME TO "temporary_guild_users_user"`);
        await queryRunner.query(`CREATE TABLE "guild_users_user" ("guildId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("guildId", "userId"))`);
        await queryRunner.query(`INSERT INTO "guild_users_user"("guildId", "userId") SELECT "guildId", "userId" FROM "temporary_guild_users_user"`);
        await queryRunner.query(`DROP TABLE "temporary_guild_users_user"`);
        await queryRunner.query(`CREATE INDEX "IDX_ac86f3a3e939611408d1eab9ff" ON "guild_users_user" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2136b3410992b420dd7872e582" ON "guild_users_user" ("guildId") `);
        await queryRunner.query(`DROP INDEX "IDX_ac86f3a3e939611408d1eab9ff"`);
        await queryRunner.query(`DROP INDEX "IDX_2136b3410992b420dd7872e582"`);
        await queryRunner.query(`DROP TABLE "guild_users_user"`);
        await queryRunner.query(`DROP TABLE "media_catalog"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "guild"`);
        await queryRunner.query(`DROP TABLE "youtube_notifier"`);
    }

}
