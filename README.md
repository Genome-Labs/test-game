from https://zerosum-2.gitbook.io/zerosum-integration-guide/rm4tYOVXNiq3bgKnvVkl/integrating-your-game-with-zerosum


```
db.game.findOne({_id: "game_id_1"})
db.game.updateOne({_id: "game_id_1"}, {$set: {visible: true, active: true}})
```


npx ts-node src/auth.ts login1 login2 login3