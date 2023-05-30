import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany, UpdateDateColumn } from 'typeorm';
import { Admin } from './admin';
import { UserProfile } from './userProfile';
import Pricing from './pricing';



@Entity('plans')
class Plan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'float' })
    storage: number;

    @Column()
    buddies: number;

    @Column()
    description: string;


    @ManyToOne(type => Admin)
    addedBy: Admin;

    @Column({ type: 'float' })
    fileSizeLimit: number;

    @Column()
    files: number;

    @Column({ nullable: true })
    stripeProductId: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Pricing, pricing => pricing.plan)
    prices: Pricing[];

}

export default Plan; 