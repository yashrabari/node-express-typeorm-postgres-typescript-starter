// Subscription.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserProfile } from './userProfile';
import Plan from './plans';

@Entity()
export class Subscription {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserProfile, (userProfile) => userProfile.sub)
    @JoinColumn()
    user: UserProfile;

    @OneToOne(() => Plan)
    @JoinColumn()
    plan: Plan;

    @Column({ nullable: true })
    stripeSubscriptionId: string;

    @CreateDateColumn()
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @Column({ nullable: true })
    status: string;



}
