import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { RatingEntity } from './rating.entity';

@Entity('stores')
@Index('idx_stores_name', ['name'])
@Index('idx_stores_email', ['email'])
@Index('idx_stores_address', ['address'])
@Index('idx_stores_ownerId', ['ownerId'])
export class StoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 60 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 400 })
  address: string;

  @Column({ type: 'int', nullable: true })
  ownerId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.stores, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity | null;

  @OneToMany(() => RatingEntity, (rating) => rating.store)
  ratings: RatingEntity[];
}
