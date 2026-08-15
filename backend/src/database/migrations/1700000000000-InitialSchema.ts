import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(60) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`address\` varchar(400) NOT NULL,
        \`role\` enum('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL_USER',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_users_email\` (\`email\`),
        INDEX \`idx_users_name\` (\`name\`),
        INDEX \`idx_users_address\` (\`address\`),
        INDEX \`idx_users_role\` (\`role\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`stores\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(60) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`address\` varchar(400) NOT NULL,
        \`ownerId\` int NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`idx_stores_name\` (\`name\`),
        INDEX \`idx_stores_email\` (\`email\`),
        INDEX \`idx_stores_address\` (\`address\`),
        INDEX \`idx_stores_ownerId\` (\`ownerId\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_stores_owner\` FOREIGN KEY (\`ownerId\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE \`ratings\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userId\` int NOT NULL,
        \`storeId\` int NOT NULL,
        \`rating\` int NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`unique_user_store\` (\`userId\`, \`storeId\`),
        INDEX \`idx_ratings_userId\` (\`userId\`),
        INDEX \`idx_ratings_storeId\` (\`storeId\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_ratings_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_ratings_store\` FOREIGN KEY (\`storeId\`) REFERENCES \`stores\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`ratings\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`stores\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}
