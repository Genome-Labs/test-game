from https://zerosum-2.gitbook.io/zerosum-integration-guide/rm4tYOVXNiq3bgKnvVkl/integrating-your-game-with-zerosum


```
db.game.findOne({_id: "game_id_1"})
db.game.updateOne({_id: "game_id_1"}, {$set: {visible: false, active: true}})
```

Please change logins before running the command
```
npx ts-node src/auth.ts dev_login18 dev_login22
```
npm run dev | tee run_dev_8.log