export const environment = {
  production: true,
  app_id: 'crd',
  pouch_prefix: 'cards_',
  token_expiery: 300, // how many days
  auth_api: 'https://auth.mlflabs.com',
  couch_db: 'https://cards.mlflabs.com/api_cards',
  dict_db: 'https://dict.mlflabs.com',
  dictApiUrl: 'https://dictapi.mlflabs.com',
  access_meta_key: 'meta_access',
  server_sync_debounce_time: 10000,


  // game settings
  gamePoinsRequired: 4, //if reached these points proficiency level will go up
  gameEndCardsRemaining: 2,
  cardCompletionPoints: 6,
  sidesPointRequired: {1:1, 2:1, 3:1},
  // spaced repetition
  proficiencyLevels: [1,2,5,10,20,30],
  totalStudyStages: 5,
  // how many wrong answers for us to go back on profficiency level
  proficiencyLevelWrongAnswerCountDecrese: 2,

};
