import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { UserProfile } from './userProfile';
import File from './File';

@Entity()
export class Folder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(type => Folder, folder => folder.children)
    parent: Folder;

    @OneToMany(type => Folder, folder => folder.parent)
    children: Folder[];

    @OneToMany(type => File, files => files.folder)
    files: File[];

    @ManyToOne(type => UserProfile, user => user.folders)
    owner: UserProfile;
}


export default Folder;