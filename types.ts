import type { ObjectId } from "mongodb";

export type UserModel = {
    _id?: ObjectId,
    nombre: string,
    email: string,
    telefono: string,
    amigos: ObjectId[]
}

export type User = {
    id: string,
    nombre: string,
    email: string,
    telefono: string,
    amigos: User[]
}