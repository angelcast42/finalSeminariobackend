export interface CreateUserRequest {
	email: string;
	password: string;
	nombre: string;
	apellido: string;
	rol: string;
	estado: boolean;
}