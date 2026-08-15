import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAuditLogsSchema1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'userName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'userEmail',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'module',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'SUCCESS'",
          },
          {
            name: 'createdAt',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
        ],
      }),
      true
    );

    const indices = [
      { name: 'idx_audit_logs_action', columnNames: ['action'] },
      { name: 'idx_audit_logs_module', columnNames: ['module'] },
      { name: 'idx_audit_logs_status', columnNames: ['status'] },
      { name: 'idx_audit_logs_createdAt', columnNames: ['createdAt'] },
    ];

    for (const idx of indices) {
      try {
        await queryRunner.createIndex('audit_logs', new TableIndex(idx));
      } catch (err) {
        // Ignore duplicate index creation if table already had index defined
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs', true);
  }
}
