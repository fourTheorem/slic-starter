import { readFileSync } from 'node:fs';
import { handleTransformer } from '../services/checklists/transformer.js';

const eventJson = readFileSync('./test-events/firehose-event.json');
const event = JSON.parse(eventJson);

function callback() {}

handleTransformer(event, {}, callback);
