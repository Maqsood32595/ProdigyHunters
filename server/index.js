import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { kernel } from './kernel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5090;

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../public')));

kernel.boot(app, server, './features').then(() => {
    // Built-in API to check features
    app.get('/api/features', (req, res) => {
        const features = kernel.getAllFeatures().map(f => ({
            id: f.id,
            name: f.name,
            basePath: f.basePath,
            loaded: f.loaded
        }));
        res.json({ count: features.length, features });
    });

    server.listen(PORT, () => {
        console.log(`\n======================================================================`);
        console.log(`🎙️ [Job Agency AI Recruiter (Neha)] Listening on http://localhost:${PORT}`);
        console.log(`   - Candidate Call Interface:  http://localhost:${PORT}/call.html`);
        console.log(`   - Recruiter Admin Dashboard: http://localhost:${PORT}/index.html`);
        console.log(`======================================================================\n`);
    });
});
