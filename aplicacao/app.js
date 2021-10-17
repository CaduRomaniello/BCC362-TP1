const { MongoClient } = require('mongodb');
const stream = require('stream');
async function main() {
    nomes_de_cachorro = ["Bolaco", "Toby", "Bolinha", "Scooby-Doo", "Chupisco", "Snoopy", "Spike", "Rex", "Lulu", "Krypto", "Ace"]
    racas_de_cachorro = ["Pinscher", "Husky", "Pastor Alemão", "Pitbull", "Rottweiler", "Doberman", "São Bernardo", "Chihuahua", "Dachshund", "Labrador", "Chow-Chow"]
    const uri = 'mongodb://10.182.0.14:60000/cachorros'
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const pipeline = [];
        console.log("Conectado");
        console.log("\n");
        var result_delete = await client.db("cachorrosDB").collection("cachorros").deleteMany({});
        //console.log(result_delete.deletedCount)

        // Criando
        var id = 0;
        while (true){
            var nomeAleatorio = nomes_de_cachorro[Math.floor(Math.random() * nomes_de_cachorro.length)];
            var racaAleatoria = racas_de_cachorro[Math.floor(Math.random() * racas_de_cachorro.length)];
            var cachorro = {
                nome: nomeAleatorio,
                raca: racaAleatoria,
                _id: id
            }

            var result_created = await client.db("cachorrosDB").collection("cachorros").insertOne(cachorro);
            console.log(`Cachoro criado com id: ${result_created.insertedId}, nome: ${cachorro.nome}, raça: ${cachorro.raca}`);

            var chanceDelete = Math.random();
            if (chanceDelete <= 0.25){
                var result_delete = await client.db("cachorrosDB").collection("cachorros").deleteOne({_id: result_created.insertedId});
                console.log(`${result_delete.deletedCount} documentos deletados.`);
            }
            console.log("\n");
            
            id += 1
            await sleep(2000);
        }
    } finally {
        await client.close();
    }
}

main().catch(console.error);

function closeChangeStream(timeInMs = 60000, changeStream) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Closing the change stream");
            changeStream.close();
            resolve();
        }, timeInMs)
    })
};

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}