const mongoose = require('mongoose')
const postSchema = new mongoose.Schema(
    {
      content: {
        type: String,
        required: [true, 'Content 未填寫']
      },
      image: {
        type:String,
        default:""
      },
      createdAt: {
        type: Date,
        default: Date.now,
        select: false
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref:"user",
        required: [true, '貼文 ID 未填寫']
    },
      likes: {
          type:Number,
          default:0
        }
    },
    {
      versionKey: false,
    }
);

// model export 模組化
// 1. 建立 schema
// 2. 建立 model
// 3. 引入 mongoose
// 4. 匯出 model

// model 開頭字變小寫
// 建立 Model 時後面會強制加上 s (英文規則)

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
