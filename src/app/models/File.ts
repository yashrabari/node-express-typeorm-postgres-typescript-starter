import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import { UserProfile } from './userProfile';
import Folder from './Folder';

@Entity()
export class File extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    ext: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    key: string;

    @ManyToOne(type => Folder, folder => folder.files)
    folder: Folder;

    @ManyToOne(type => UserProfile, user => user.files)
    owner: UserProfile;

    @Column()
    size: string;
}


export default File;