import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';

import { UserAuth } from './usersAuth';

import File from './File';
import Folder from './Folder';
import { Subscription } from './subscription';



@Entity()
export class UserProfile {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    stripeCustomer: string;

    @Column({ nullable: true, type: "float" })
    storage: number;

    @Column({ nullable: true, type: "float" })
    storageLeft: number;


    @Column({ nullable: true })
    profilePicture: string;

    @Column({ nullable: true })
    profilePictureKey: string;

    @Column({ default: 0 })
    fileCount: number;

    @Column({ default: 0 })
    folderCount: number;

    @Column({ default: 0 })
    buddiesCount: number;

    @CreateDateColumn()
    dateJoined: Date;

    @OneToMany(type => File, file => file.owner)
    files: File[];

    @OneToMany(type => Folder, folder => folder.owner)
    folders: Folder[];

    @Column({ nullable: true })
    verficationPeriod: string;

    @OneToOne(() => UserAuth, (userAuth) => userAuth.userProfile)
    @JoinColumn()
    userAuth: UserAuth;



    @OneToOne(() => Subscription, (sub) => sub.user)
    sub: Subscription;

}