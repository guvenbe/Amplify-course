import { type ClientSchema, a, defineData } from '@aws-amplify/backend';


const schema = a.schema({
  chat: a.conversation({
    aiModel: a.ai.model('Claude 3 Haiku'),
    systemPrompt: 'You are helpful assistant'
  }).authorization(
    (allow) => allow.owner()
  )
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});
