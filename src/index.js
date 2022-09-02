import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import dayjs from 'dayjs';

dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI)

let db;

mongoClient.connect().then(() => {
    db = mongoClient.db('batepapo_uol');
});


const participantSchema = joi.object({
    name: joi.string().required()
});

const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid('message').valid('private_message').required()
});

/*
setInterval (async () => {
    const participants = await db.collection('participants').find().toArray();

    participants.map(({ name, lastStatus }) => {
        const now = Date.now();
        const sec_10 = 10000;

        if ((now - lastStatus) > sec_10) {
            db.collection('participants').deleteOne({ name, lastStatus });

            db.collection('messages').insertOne({
                from: name,
                to: 'Todos',
                text: 'sai na sala...',
                type: 'status',
                time: dayjs(new Date()).format('HH:mm:ss')
            });
        }
    });
}, 15000);*/
 
server.post('/participants', async (req, res) => {
    const { name } = req.body;

    const validation = participantSchema.validate({ name });

    if (validation.error) {
        res.status(422).send({ message:validation.error.details[0].message });
        return;
    }

    let hasName;

    try {
        hasName = await db.collection('participants').find({ name }).toArray();
        
    } catch (error) {
        console.log('Erro ao verificar se usuário já existe: ' + error);
        res.sendStatus(500);
        return;
    }

    if (hasName.length > 0) {
        res.status(409).send({ message:'Nome já existente!' });
        return;
    }

    try {
        db.collection('participants').insertOne({ name, lastStatus: Date.now() });

    } catch (error) {
        console.log('Erro ao adicionar usuário: ' + error);
        res.sendStatus(500);
        return;
    }

    try {
        db.collection('messages').insertOne({
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs(new Date()).format('HH:mm:ss')
        });

    } catch (error) {
        console.log('Erro ao adicionar mensagem de status: ' + error);
        res.sendStatus(500);
        return;
    }

    res.status(201).send({ message:'Usuário criado' });
});

server.get('/participants', async (req, res) => {
    let participants;

    try {
        participants = await db.collection('participants').find().toArray();
    } catch (error) {
        console.log('Erro ao buscar participantes: ' + error);
        res.sendStatus(500);
        return;
    }

    participants = participants.map(({ name, lastStatus }) => ({ name, lastStatus }));

    res.send(participants);
});

server.post('/messages', async (req, res) => {
    const { user } = req.headers;
    const { to, text, type } = req.body;

    const validation = messageSchema.validate(req.body, { abortEarly:false });

    if (validation.error) {
        const message = validation.error.details.map(({ message }) => message);

        res.status(422).send({ message });
        return;
    }

    let hasUser;

    try {
        hasUser = await db.collection('participants').find({ name:user }).toArray();

    } catch (error) {
        console.log('Erro ao buscar remetente: ' + error);
        res.sendStatus(500);
        return;
    }

    if (hasUser.length === 0) {
        res.status(422).send({ message:'Remetente inválido!' });
        return;
    }

    try {
        db.collection('messages').insertOne({
            from: user,
            to,
            text,
            type,
            time: dayjs(new Date()).format('HH:mm:ss')
        });

    } catch (error) {
        console.log('Erro ao enviar mensagem: ' + error);
        res.sendStatus(500);
        return;
    }

    res.status(201).send({ message:'Mensagem enviada' });
});

server.get('/messages', async (req, res) => {
    const { user } = req.headers;
    const limit = req.query.limit;

    if (!user) {
        res.status(400).send({ message:'Informe o usuário!' });
        return;
    }

    if (limit && limit < 1) {
        res.status(400).send({ message:'Limite de mensagens inválido!' });
        return;
    }

    let messages;

    try {
        messages = await db.collection('messages').find().toArray();

    } catch (error) {
        console.log('Erro ao buscar mensagens: ' + error);
        res.sendStatus(500);
        return;
    }
    
    messages = messages.filter(({ from, to, type }) => 
        from === user ||
        to === user ||
        to === 'Todos' ||
        type === 'message'
    );

    res.send(messages.reverse().slice(0, limit));
});

server.post('/status', async (req, res) => {
    const { user } = req.headers;
    
    if (!user) {
        res.status(400).send({ message:'Informe o usuário!' });
        return;
    }

    let participant;

    try {
        participant = await db.collection('participants').find({ name:user }).toArray();

    } catch (error) {
        console.log('Erro ao buscar participante: ' + error);
        res.sendStatus(500);
        return;
    }

    if (participant.length === 0) {
        res.status(404).send({ message:'Usuário não encontrado.' });
        return;
    }
    
    db.collection('participants').updateOne({ name:user }, { $set: { lastStatus: Date.now() } });

    res.sendStatus(200);
});

server.delete('/messages/:id', async (req, res) => {
    const { user } = req.headers;
    const { id } = req.params;

    if (!user) {
        res.status(400).send({ message:'Informe o usuário!' });
        return;
    }

    let message;

    try {
        message = await db.collection('messages').find({ _id: ObjectId(id) }).toArray();

    } catch (error) {
        console.log('Erro ao buscar mensagem: ' + error);
        res.sendStatus(500);
        return;
    }

    if (message.length === 0) {
        res.status(404).send({ message:'Mensagem não encontrada.' });
        return;
    }

    if (message[0].from !== user) {
        res.sendStatus(401);
        return;
    }

    try {
        await db.collection('messages').deleteOne({ _id: ObjectId(id) });

    } catch (error) {
        console.log('Erro ao apagar mensagem: ' + error);
        res.sendStatus(500);
        return;
    }

    res.send({ message:'Mensagem apagada.' });
});

server.listen(5000, () => console.log('Listening on port 5000...'));