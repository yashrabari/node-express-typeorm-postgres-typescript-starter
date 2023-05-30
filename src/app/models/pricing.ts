import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany, UpdateDateColumn } from 'typeorm';
import Plan from './plans';


@Entity('pricing')
class Pricing {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'float' })
    price: number;

    @Column()
    description: string;

    @Column()
    type: string;

    @ManyToOne(() => Plan, (plan) => plan.prices)
    plan: Plan

    @Column({ nullable: true })
    stripePriceId: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default Pricing;