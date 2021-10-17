# Como configurar as máquinas passo a passo

## Config servers

O config server foi criado utilizando replica set para evitar erros caso uma máquina fique fora do ar. Para isso foram criados 3 containers utilizando docker na mesma VM do google cloud. Os três containers foram conectados entre si para funcionarem com replica set.

Para subir os containers basta digitar o comando abaixo modificando apenas o diretório do arquivo `.yaml` caso necessário.
```
docker-compose -f config-server/docker-compose.yaml up -d
```

Para iniciar o replica set é necessário se conectar com algum dos containers.
```
mongo mongodb://<ip da máquina do config server>:<porta do container 1>
```

Feito isso, é necessário linkar as 3 máquinas em um replica set.
```
rs.initiate(
  {
    _id: "cfgrs",
    configsvr: true,
    members: [
      { _id : 0, host : "<ip da máquina do config server>:<porta do container 1>" },
      { _id : 1, host : "<ip da máquina do config server>:<porta do container 2>" },
      { _id : 2, host : "<ip da máquina do config server>:<porta do container 3>" }
    ]
  }
)
```

Para verificar se o replica set foi configurado corretamente digite:
```
rs.status()
```

## Shard 1
O sharding foi utilizado para permitir o escalonamento horizontal do banco. As shards também utilizam replica set para evitar problemas caso alguma máquina fique fora do ar, do mesmo modo que o config server.

Para subir os containers basta digitar o comando abaixo modificando apenas o diretório do arquivo `.yaml` caso necessário.
```
docker-compose -f shard1/docker-compose.yaml up -d
```

Para iniciar o replica set é necessário se conectar com algum dos containers.
```
mongo mongodb://<ip da máquina>:<porta do container 1>
```

Feito isso, é necessário linkar as 3 máquinas em um replica set.
```
rs.initiate(
  {
    _id: "shard1rs",
    members: [
      { _id : 0, host : "<ip da máquina do shard 1>:<porta do container 1>" },
      { _id : 1, host : "<ip da máquina do shard 1>:<porta do container 2>" },
      { _id : 2, host : "<ip da máquina do shard 1>:<porta do container 3>" }
    ]
  }
)
```

Para verificar se o replica set foi configurado corretamente digite:
```
rs.status()
```

O shard será configurado posteriormente quando todos os shards estiverem configurados e em execução.

## Mongos Router
O mongos também foi criado utilizando container para permitir sua portabilidade.

Para subir o container basta digitar o comando abaixo modificando apenas o diretório do arquivo `.yaml` caso necessário.
```
docker-compose -f mongos/docker-compose.yaml up -d
```

## Adicionando um shard ao cluster
Agora deve-se configurar o cluster. Primeiramente é necessário se conectar com o mongos.
```
mongo mongodb://<ip da máquina do mongos>:<porta do container do mongos>
```

Agora deve-se adicionar o shard criado anteriormente ao cluster.
```
mongos> sh.addShard("<nome do replica set do shard 1>/<ip da maquina do shard 1>:<porta do containe 1>,<ip da maquina do shard 1>:<porta do containe 2>,<ip da maquina do shard 1>:<porta do containe 3>")
```

Para verificar o status do shard e verificar se ele foi adicionado ao cluster digite:
```
mongos> sh.status()
```

## Shard 2
Agora para configurar o segundo shard deve-se seguir os mesmos passos da configuração do primeiro shard.

Para subir os containers basta digitar o comando abaixo modificando apenas o diretório do arquivo `.yaml` caso necessário.
```
docker-compose -f shard2/docker-compose.yaml up -d
```

Para iniciar o replica set é necessário se conectar com algum dos containers.
```
mongo mongodb://<ip da máquina do shard 2>:<porta do container 1>
```

Feito isso, é necessário linkar as 3 máquinas em um replica set.
```
rs.initiate(
  {
    _id: "shard2rs",
    members: [
      { _id : 0, host : "<ip da máquina do shard 2>:<porta do container 1>" },
      { _id : 1, host : "<ip da máquina do shard 2>:<porta do container 2>" },
      { _id : 2, host : "<ip da máquina do shard 2>:<porta do container 3>" }
    ]
  }
)
```

Para verificar se o replica set foi configurado corretamente digite:
```
rs.status()
```

## Adicionando o segundo shard ao cluster
Agora deve-se configurar o cluster. Primeiramente é necessário se conectar com o mongos.
```
mongo mongodb://<ip da máquina do mongos>:<porta do container do mongos>
```

Agora deve-se adicionar o shard criado anteriormente ao cluster.
```
mongos> sh.addShard("<nome do replica set do shard 2>/<ip da maquina do shard 2>:<porta do containe 1>,<ip da maquina do shard 2>:<porta do containe 2>,<ip da maquina do shard 2>:<porta do containe 3>")
```

Para verificar o status do shard e verificar se ele foi adicionado ao cluster digite:
```
mongos> sh.status()
```

## Habilitando shard em um banco de dados e em uma coleção
Após realizar os passos anteriores, o cluster já está funcionando. Porémm, é necessário habilitar e aplicar o sharding no banco de dados e na coleção em questão. Para tal, siga os seguintes passos:

Conectar com o mongos:
```
mongo mongodb://<ip da máquina do mongos>:<porta do container do mongos>
```

Permitir o sharding em um banco de dados MongoDB:
```
mongos> sh.enableSharding("<nome do banco de dados>") 
```

Permitir o sharding em uma coleção MongoDB. Nessa etapa é necessário escolher qual será a hash key desse banco. É recomendado ler a [documentação](https://docs.mongodb.com/manual/core/sharding-shard-key/). Para esse trabalho o campo `_id` foi escolhido para ser a shard key utilizando um hash.
```
mongos> sh.shardCollection("<nome do banco de dados>.<nome da coleção>", {"_id": "hashed"}) 
```

Com o sharding habilitado para verificá-lo digite:
```
mongos> sh.getShardDistribution()
```
