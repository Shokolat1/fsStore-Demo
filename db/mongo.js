const { MongoClient, ObjectId } = require("mongodb");

const dbName = "fsStoreDemo";
const collName = "prods";
const url = "mongodb://127.0.0.1:27017";

const client = new MongoClient(url);

const connectToMongo = async () => {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collName);

    console.log("Connected To Mongo");

    return {
        collection,
        db,
    };
};

const allProds = async () => {
    const { collection } = await connectToMongo()
    let resp = await collection.find().toArray()
    await client.close()
    if (!resp) throw 'Error: No hay productos'
    else {
        return resp
    }
}

const findProd = async (id) => {
    const { collection } = await connectToMongo()
    let resp = await collection.findOne(new ObjectId(id))
    await client.close()
    if (!resp) throw 'Error: No existe el producto'
    else {
        return resp
    }
}

const agregaProd = async (doc) => {
    const { collection } = await connectToMongo()
    let resp1 = await collection.findOne({ aliasImg: doc.alias })
    if (resp1) {
        await client.close()
        throw 'Error: Producto ya existe'
    }
    else {
        await collection.insertOne(doc)
        await client.close()
        return 'Producto añadido!'
    }
}

const editProd = async (doc) => {
    const { collection } = await connectToMongo()
    await collection.findOneAndUpdate({ _id: new ObjectId(doc.prodID) }, {
        $set: {
            nom: doc.nom,
            precio: doc.precio,
            descrip: doc.descrip,
            aliasImg: doc.aliasImg
        }
    })
}

const quitaProd = async (id) => {
    const { collection } = await connectToMongo()
    await collection.findOneAndDelete({ _id: new ObjectId(id) })
    await client.close()
    return 'Producto Elimindado!'
}

module.exports = {
    connectToMongo,
    client,
    dbName,
    url,
    findProd,
    allProds,
    agregaProd,
    editProd,
    quitaProd,
}