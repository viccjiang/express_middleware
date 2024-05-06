const mongoose = require('mongoose');

const dotenv = require('dotenv'); // dotenv 用來讀取 .env 檔案
dotenv.config({ path: './config.env' }); // 設定 .env 檔案路徑 ，需先設定環境變數

// 連接 mongoDB 雲端資料庫
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB)
  .then(() => {
    console.log('資料庫連線成功')
  })
  .catch((error) => {
    console.log(error);
  });

// mongodb://127.0.0.1:27017/post 本地端測試用
// mongoose.connect('mongodb://127.0.0.1:27017/postTest')
//   .then(() => {
//     console.log('資料庫連線成功')
//   })
//   .catch((error) => {
//     console.log(error);
//   });

// config.env
// DATABASE=mongodb+srv://你的帳號:<password>@cluster0.1guftmy.mongodb.net/week2?retryWrites=true&w=majority&appName=Cluster0
// DATABASE_PASSWORD=你的密碼