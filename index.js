
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname, "index.html"));
});

// Route GET non utilisée pour le pseudo
app.post('/process_post', urlencodedParser, function (req, res) {
   // Préparer la réponse avec le pseudo
   const response = {
      first_name: req.body.first_name,
      last_name: req.body.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
});

const server = app.listen(5000, function () {
   console.log("Express App running at http://127.0.0.1:5000/");
});

export default app;