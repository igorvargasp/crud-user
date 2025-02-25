
# crud-user

## Project setup

# Backend

```
1 - npm install ou npm install --force (caso de algum conflito de dependências)
2 - docker-compose -f docker-compose.yml up -d
3 - Assim que o container for iniciado, npx prisma migrate db-init dev init.
4 - Dê um nome para a migration para criar a tabela de usuários.
4 - npm run start o backend.
5 - acesse http://localhost:3001/api para ver a documentação da api


```

# Frontend

```
1 - npm install
2 - npm run dev
```

## OBS

- Para executar o backend, é necessário ter o docker-compose.yml em execução para rodar o postgres e o redis localmente
- Para executar o frontend, é necessário ter o backend em execução para fazer as requisições
- Mantive as envs em caso de algum problema, mas o certo é deixar no .gitignore