import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { StoreEntity } from './store.entity';
import { RatingEntity } from './rating.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
@Index('idx_users_name', ['name'])
@Index('idx_users_address', ['address'])
@Index('idx_users_role', ['role'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 60 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ type: 'varchar', length: 400 })
  address: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.NORMAL_USER,
  })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => StoreEntity, (store) => store.owner)
  stores: StoreEntity[];

  @OneToMany(() => RatingEntity, (rating) => rating.user)
  ratings: RatingEntity[];
}
