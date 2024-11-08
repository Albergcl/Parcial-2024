import type { Collection } from "mongodb";
import type { User, UserModel } from "./types.ts";

export const fromModelToUser = async (DBuser: UserModel, usersCollection: Collection<UserModel>): Promise<User> => {
    const amigosUser = await usersCollection.find({_id: { $in: DBuser.amigos }}).toArray();

    return{
        id: DBuser._id!.toString(),
        nombre: DBuser.nombre,
        email: DBuser.email,
        telefono: DBuser.telefono,
        amigos: []//amigosUser.map((a => fromModelToUser(a, usersCollection)))
    }
}