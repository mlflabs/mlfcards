// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  app_id: 'crd',
  pouch_prefix: 'cards_',
  token_expiery: 300, // how many days
  auth_api: 'https://auth.mlflabs.com',
  couch_db: 'http://localhost:3001/api_cards',
  dict_db: 'https://dict.mlflabs.com/mlf_dict',
  access_meta_key: 'meta_access',
  server_sync_debounce_time: 10000,

  translateApiUrl: 'http://localhost:3050',

  //game settings
  gamePoinsRequired: 2, //how many points before removing card
  gameEndCardsRemaining: 2,// not all cards need to be studied, how many can be left
  cardCompletionPoints: 5, //how many points before removing card
  //spaced repetition
  proficiencyLevels: [1,2,4,5],//number of days between studying
  // how many wrong answers for us to go back on profficiency level
  proficiencyLevelWrongAnswerCountDecrese: 2,


};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
