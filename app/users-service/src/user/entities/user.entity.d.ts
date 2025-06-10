declare enum UserRole {
    EXTERNO = "externo",
    ADMIN = "admin",
    SUPERVISOR = "supervisor",
    TECNICO = "tecnico"
}
export declare class User {
    id: number;
    name: string;
    lastName: string;
    email: string;
    password: string;
    cargo: UserRole;
    createdAt: Date;
    updatedAt: Date;
    phone: string;
    celphone: string;
    hora$: number;
    minutos$: number;
    userName: string;
    status: boolean;
}
export {};
