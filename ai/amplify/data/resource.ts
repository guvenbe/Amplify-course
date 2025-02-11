import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { getWeather } from '../functions/weather/resource';


const schema = a.schema({
  getWeather: a.query()
  .arguments({city: a.string().required()})
  .returns(a.customType({
    value: a.float().required(),
    unit: a.string().required(),
  }))
  .handler(a.handler.function(getWeather))
  .authorization((allow) => allow.authenticated()),
  chat: a.conversation({
    aiModel: a.ai.model('Claude 3 Haiku'),
    systemPrompt: 'You are helpful assistant',
    tools:[{
      name: 'getWeatherTool',
      description: 'Provide the current weather for the city',
      query: a.ref('getWeather')
    }]
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
