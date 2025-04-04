import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique, OneToMany, ManyToMany } from 'typeorm';
import { Expose } from 'class-transformer';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Entity('tag')
@Unique(['key', 'value'])
export class TagEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  key: string;

  @Expose()
  @Column()
  value: string;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @UpdateDateColumn()
  updatedAt: Date;

  @Expose()
  @ManyToMany(() => DatabaseEntity, (database) => database.tags, {
    onDelete: 'CASCADE',
  })
  databases: DatabaseEntity[];
}
