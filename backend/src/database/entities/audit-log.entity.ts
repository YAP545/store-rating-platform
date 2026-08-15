import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index('idx_audit_logs_action', ['action'])
@Index('idx_audit_logs_module', ['module'])
@Index('idx_audit_logs_status', ['status'])
@Index('idx_audit_logs_createdAt', ['createdAt'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 100 })
  module: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 20, default: 'SUCCESS' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
