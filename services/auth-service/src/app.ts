import express, {type Application} from 'express';
import cors from 'cors';
const app: Application = express();

app.use(express.json());
app.use(cors());



app.use('/api/v2/auth', )

export { app };
