import express from 'express';
import cors from 'cors';

const server = express();

server.use(cors());
server.use(express.json());

const participants = [];
const messages = [];

server.post('/participants', (req, res) => {
    const { name } = req.body;
    const hasName = participants.find(participant => name === participant.name);

    if (!name) {
        res.sendStatus(422);
        return;
    }

    if (hasName) {
        res.status(409).send({ message:'Nome já existente!' });
        return;
    }

    participants.push({ name, lastStatus: Date.now() });
    messages.push({ from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: new Date().toLocaleTimeString('pt-br') });
    
    res.status(201).send({ message:'Usuário criado', messages });
});

server.listen(5000, () => console.log('Servidor rodando na porta 5000'));