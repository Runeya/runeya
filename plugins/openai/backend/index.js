const plugin = require('./Openai');

module.exports = plugin;


/**
 * @typedef {Partial<
* import('openai').OpenAI.ChatCompletionMessage &
* import('openai').OpenAI.CompletionUsage &
* {
*  url?:string
*  contentId?:string
*  revised_prompt?:string
*  created_at: string,
* _id: string
* }
* >} OpenAiChat
*/
