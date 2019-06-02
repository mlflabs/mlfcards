export const environment = {
  production: true,
  app_id: 'crd',
  pouch_prefix: 'cards_',
  token_expiery: 300, // how many days
  auth_api: 'https://auth.mlflabs.com',
  couch_db: 'https://api.mlflabs.com/mlfapi',
  dict_db: 'https://dict.mlflabs.com',
  access_meta_key: 'meta_access',
  server_sync_debounce_time: 10000,
  translateApiUrl: 'http://localhost:3050',


  // game settings
  gamePoinsRequired: 2, //how many points before removing card
  gameEndCardsRemaining: 3,
  cardCompletionPoints: 5,
  // spaced repetition
  proficiencyLevels: [1,2,5,10,20,30],
  // how many wrong answers for us to go back on profficiency level
  proficiencyLevelWrongAnswerCountDecrese: 2,

};
