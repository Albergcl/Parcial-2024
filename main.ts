import { MongoClient, type WithId } from "mongodb";
import { UserModel } from "./types.ts";
import { fromModelToUser } from "./utils.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if(!MONGO_URL){
  console.error("No se ha encontrado la MONGO_URL");
  Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Conectado a mongo");

const dbName = "red social";
const db = client.db(dbName);

const usersCollection = db.collection<UserModel>("usuarios");

const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  if(method === "GET"){
    if(path === "/personas"){
      const nombre = url.searchParams.get("nombre");
      if(name){
        const dbUsers = await usersCollection.find({ name });
        const users = await Promise.all(dbUsers.map((u => fromModelToUser(u, usersCollection))));
        return new Response(JSON.stringify(users), {status: 200});
      }
      const dbUsers = await usersCollection.find();
      const users = await Promise.all(dbUsers.map((u => fromModelToUser(u, usersCollection))));
      return new Response(JSON.stringify(users), {status: 200});
    }else if(path === "/persona"){
      const email = url.searchParams.get("email");
      if(!email) return new Response("Bad request", {status: 400});
      const dbUser = await usersCollection.findOne({ email });
      if(!dbUser) return new Response("User not found", {status: 404});
      const user = await fromModelToUser(dbUser, usersCollection);
      return new Response(JSON.stringify(user), {status: 200});
    }    
  }else if(method === "POST"){
    if(path === "/personas"){
      const user = await req.json();
      if(!user.name || !user.email || !user.telefono){
        return new Response("Bad request", {status: 400});
      }

      const DBuser = await usersCollection.findOne({ email: user.email });
      if(DBuser) return new Response("User already exists", {status: 400});
      const { userId } = await usersCollection.insertOne({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        amigos: []
      });

      return new Response(JSON.stringify({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        amigos: [],
        id: userId
      }), {status: 200});
    }
  }else if(method === "PUT"){
    if(path === "/persona"){
      const user = await req.json();
      if(!user.name || !user.email || !user.telefono || !user.amigos){
        return new Response("Bad request", {status: 400});
      }

      const { modificado } = await usersCollection.updateOne(
        {email: user.email},
        {$set: {nombre: user.nombre, telefono: user.telefono, amigos: user.amigos}}
      );

      if(modificado === 0){
        return new Response("User not found", {status: 404});
      }

      return new Response("OK", {status: 200});
    }

  }else if(method === "DELETE"){

  }
  
  return new Response("Endopoint not found", {status: 404});
}

Deno.serve({port: 3000}, handler);