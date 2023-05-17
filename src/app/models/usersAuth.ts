import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class UserAuth {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true, unique: true })
    mobile: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    lastLogin: Date;

    @Column({ default: false })
    isGoogle: boolean;

    @Column({ default: false })
    isFacebook: boolean;

    @Column({ default: false })
    isApple: boolean;

    @Column({ nullable: true })
    googleId: string;

    @Column({ nullable: true })
    facebookId: string;

    @Column({ nullable: true })
    appleId: string;

    @Column({ nullable: true })
    otp: string;

    @Column({ default: false })
    is2FA: boolean;

    @Column({ default: false })
    isVerfied: boolean
}
