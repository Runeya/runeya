const express = require('express');
const pathfs = require('path');
const OpenAIApi = require('openai').OpenAI;
const {
  existsSync, mkdirSync, createReadStream,
  writeFileSync,
  readFileSync,
} = require('fs');
const { encode } = require('gpt-3-encoder');
const { v4 } = require('uuid');
const { writeFile, unlink } = require('fs/promises');
const homedir = require('os').homedir();
const axios = require('axios').default;
const PromiseB = require('bluebird');
const ports = require('../../../servers/server/models/ports');

const router = express.Router();
const confDir = pathfs.resolve(homedir, '.runeya');

if (!existsSync(confDir)) mkdirSync(confDir);
const openaiConfPath = pathfs.resolve(confDir, 'openaiconf.json');
if (!existsSync(openaiConfPath)) writeFileSync(openaiConfPath, '{}', 'utf-8');
const openaiStoragePath = pathfs.resolve(confDir, 'storage');
if (!existsSync(openaiStoragePath)) mkdirSync(openaiStoragePath);
const openaiconf = JSON.parse(readFileSync(openaiConfPath, 'utf-8'));
/** @type {OpenAIApi | null} */
let openai = process.env.RUNEYA_OPENAI_APIKEY ? new OpenAIApi({
  apiKey: process.env.RUNEYA_OPENAI_APIKEY,
}) : null;

/** @param {import('@runeya/common-typings').Runeya} runeya */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Openai = (runeya) => {
  function save() {
    writeFileSync(openaiConfPath, JSON.stringify(openaiconf), 'utf-8');
  }

  return {
    // Get basic info
    async getInfo() {
      return 'hello';
    },

    // Get image by ID
    async getImage(id) {
      const path = pathfs.resolve(openaiStoragePath, `${id}.png`);
      if (existsSync(path)) {
        return createReadStream(path);
      } else {
        throw new Error('File not found');
      }
    },

    // Get available models
    async getModels() {
      if (!openai) throw new Error('Openai not initialized');
      const models = await openai.models.list({});
      return models.data;
    },

    // Tokenize text
    async tokenize(data) {
      const encoded = encode(data);
      return {
        nbTokens: encoded.length,
        price: (encoded.length * 0.002) / 1000,
      };
    },

    // Review code/diff with AI
    async review(data) {
      if (!openai) throw new Error('Openai not initialized');
      const result = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0,
        n: 1,
        max_tokens: Infinity,
        messages: [
          { role: 'system', content: 'You are a developer for 10 years. You are expert in git and you should write a commit. I gave you a git diff after. Write me a resume of this diff and write me a commit for this diff in this format: "<fix|feat|major>: <your message not exceeding 60 characters>"' },
          { role: 'assistant', content: data },
        ],
      }).catch((err) => {
        console.error(err.response.data);
        return Promise.reject(err);
      });
      return result.choices[0]?.message?.content || 'Cannot respond';
    },

    // Analyze error with AI
    async analyzeError(data) {
      if (!openai) throw new Error('Openai not initialized');
      const result = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0,
        n: 1,
        max_tokens: Infinity,
        messages: [
          { role: 'system', content: 'You are a developer for 20 years. You are expert in it and you should find a solution to this following error. Resume the following error and try to fix it' },
          { role: 'assistant', content: data },
        ],
      }).catch((err) => {
        console.error(err.response.data);
        return Promise.reject(err);
      });
      return result.choices[0]?.message?.content || 'Cannot respond';
    },

    // Generate image in chat room
    async generateImage(room, message, quality, resolution) {
      if (!openai) throw new Error('Openai not initialized');
      if (!openaiconf?.chat) openaiconf.chat = {};
      if (!openaiconf?.chat?.[room]) openaiconf.chat[room] = {};
      if (!openaiconf?.chat?.[room]?.messages) {
        openaiconf.chat[room].messages = [
          { role: 'system', content: 'Tu es un assistant utile.' },
        ];
      }
      /** @type {import('./index').OpenAiChat[]} */
      const messages = openaiconf?.chat[room]?.messages || [];
      messages.push({
        _id: v4(),
        // @ts-ignore
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      });
      const response = await openai.images.generate({
        quality,
        model: 'dall-e-3',
        prompt: message,
        n: 1,
        size: resolution,
      });

      if (response?.data?.[0]?.url) {
        const { url, revised_prompt } = response.data[0];
        const uuid = v4();
        const { data: fileBuffer } = await axios.get(url, {
          responseType: 'arraybuffer',
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
        await writeFile(pathfs.resolve(openaiStoragePath, `${uuid}.png`), fileBuffer);

        messages.push({
          url: `http://localhost:${ports.http}/openai/image/${uuid}`,
          contentId: uuid,
          revised_prompt,
          _id: v4(),
          created_at: new Date().toISOString(),
        });
        save();
      }
      return response.data?.[0]?.url;
    },

    // Send message to chat room
    async sendMessage(room, message, model, temperature) {
      if (!openai) throw new Error('Openai not initialized');
      if (!openaiconf?.chat) openaiconf.chat = {};
      if (!openaiconf?.chat?.[room]) openaiconf.chat[room] = {};
      if (!openaiconf?.chat?.[room]?.messages) {
        openaiconf.chat[room].messages = [
          { role: 'system', content: 'Tu es un assistant utile.' },
        ];
      }
      /** @type {import('./index').OpenAiChat[]} */
      const messages = openaiconf?.chat[room]?.messages || [];
      messages.push({
        _id: v4(),
        // @ts-ignore
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      });
      const result = await openai.chat.completions.create({
        model: model || 'gpt-3.5-turbo',
        temperature: Number.isNaN(+temperature) ? 0 : +temperature,
        n: 1,
        max_tokens: Infinity,
        // @ts-ignore
        messages: messages
          .filter((f) => f?.content)
          .map((a) => ({ role: a.role || 'user', content: a.content || '' }))
          .slice(-15),
      }).catch((err) => Promise.reject(err));
      if (result?.choices?.[0]?.message) {
        const { usage } = result;
        const { message } = result.choices[0];
        messages.push({
          ...message,
          ...usage,
          _id: v4(),
          created_at: new Date().toISOString(),
        });
      }
      save();
      return messages;
    },

    // Get list of chat rooms
    async getRooms() {
      return Object.keys(openaiconf?.chat || {});
    },

    // Create new chat room
    async createRoom(room) {
      if (!openaiconf?.chat?.[room]) {
        if (!openaiconf?.chat) openaiconf.chat = {};
        if (!openaiconf?.chat?.[room]) openaiconf.chat[room] = {};
      }
      save();
      return Object.keys(openaiconf?.chat || {});
    },

    // Delete chat room
    async deleteRoom(room) {
      if (openaiconf?.chat?.[room]) {
        await PromiseB.map(openaiconf?.chat?.[room].messages || [], async (message) => {
          if (message.contentId && existsSync(pathfs.resolve(openaiStoragePath, `${message.contentId}.png`))) {
            await unlink(pathfs.resolve(openaiStoragePath, `${message.contentId}.png`));
          }
        }, { concurrency: 4 });
        delete openaiconf.chat[room];
      }
      save();
      return Object.keys(openaiconf?.chat || {});
    },

    // Get chat room messages
    async getChatMessages(room) {
      return openaiconf?.chat?.[room]?.messages;
    },

    // Set API key
    async setApiKey(apikey) {
      process.env.RUNEYA_OPENAI_APIKEY = apikey;
      save();
      openai = process.env.RUNEYA_OPENAI_APIKEY ? new OpenAIApi({
        apiKey: process.env.RUNEYA_OPENAI_APIKEY,
      }) : null;
      return true;
    },

    // Check if OpenAI is ready
    async isReady() {
      if (!openai) return false;
      console.log(process.env.RUNEYA_OPENAI_APIKEY, openaiconf?.apikey);
      try {
        const { data } = await openai.models.list({});
        return !!data?.length;
      } catch (error) {
        return false;
      }
    }
  };
};

module.exports = Openai;
