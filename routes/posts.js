var express = require("express"); // 引入 express
var router = express.Router(); // 使用 express 的 Router

// 錯誤處理的部分
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const handleSuccess = require("../service/handleSuccess");

// 驗證是否登入 & 產生 JWT token
const { isAuth, generateSendJWT } = require("../service/auth");

// Model schema
const Post = require("../models/postsModel"); // 引入 postsModel 模組 schema
const User = require("../models/usersModel"); // 引入 usersModel 模組 schema

// 網址 Router 首頁
router.get(
  "/",
  handleErrorAsync(async function (req, res, next) {
    // const post = await Post.find().populate("user") // 關聯 user 資料;

    // 貼文關鍵字搜尋與篩選
    const timeSort = req.query.timeSort == "asc" ? "createdAt" : "-createdAt";
    const q =
      req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};

    // 關聯 user 資料
    const post = await Post.find(q)
      .populate({
        path: "user",
        select: "name photo",
      })
      .sort(timeSort);

    // asc 遞增(由小到大，由舊到新) createdAt ;
    // desc 遞減(由大到小、由新到舊) "-createdAt"

    handleSuccess(res, post);
  })
);

// 這裡是新增文章，並且要透過 isAuth 來確認是否有登入
// handleErrorAsync 夾帶一個 async function 參數 ，會將錯誤丟到 app.js 的錯誤處理
router.post(
  "/",
  isAuth, // middleware 這裡是確認是否有登入
  handleErrorAsync(async function (req, res, next) {
    const { body } = req;

    if (body.content == undefined) {
      return next(appError(400, "你沒有填寫 content 資料"));
    }

    const newPost = await Post.create({
      user: body.user,
      content: body.content.trim(),
      image: body.photo,
    });

    handleSuccess(res, newPost);
  })
);

// router.delete 刪除單筆
router.delete(
  "/:id",
  isAuth, // middleware 這裡是確認是否有登入
  handleErrorAsync(async function (req, res, next) {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (post !== null) {
      handleSuccess(res, post);
    } else {
      return next(appError(400, "欄位未填寫正確或無此 id"));
    }
  })
);

// router.delete 刪除全部
router.delete(
  "/",
  isAuth, // middleware 這裡是確認是否有登入
  handleErrorAsync(async function (req, res, next) {
    const posts = await Post.deleteMany({});
    handleSuccess(res, posts);
  })
);

// router.patch 修改單筆
router.patch(
  "/:id",
  isAuth, // middleware 這裡是確認是否有登入
  handleErrorAsync(async function (req, res, next) {
    const { body } = req;

    // 取得 id
    const id = req.params.id;

    if (body.content === undefined) {
      return next(appError(400, "欄位未填寫正確"));
    }

    const post = await Post.findByIdAndUpdate(
      id,
      {
        name: body.name,
        content: body.content,
        image: body.photo,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    handleSuccess(res, post);
  })
);

module.exports = router;

// next(appError) 會將錯誤丟到 app.js 的錯誤處理
