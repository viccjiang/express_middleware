const express = require("express");
const router = express.Router();

// 套件
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");

// 錯誤處理的部分
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const handleSuccess = require("../service/handleSuccess");

// Model schema
const User = require("../models/usersModel");

// 驗證是否登入 & 產生 JWT token
const { isAuth, generateSendJWT } = require("../service/auth");

// 註冊
router.post(
  "/sign_up",
  handleErrorAsync(async (req, res, next) => {
    let { email, password, confirmPassword, name } = req.body;
    // 內容不可為空
    if (!email || !password || !confirmPassword || !name) {
      return next(appError("400", "欄位未填寫正確！", next));
    }
    // 密碼正確
    if (password !== confirmPassword) {
      return next(appError("400", "密碼不一致！", next));
    }
    // 密碼 8 碼以上
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError("400", "密碼字數低於 8 碼", next));
    }
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(appError("400", "Email 格式不正確", next));
    }

    // 加密密碼 bcrypt
    password = await bcrypt.hash(req.body.password, 12);
    // 創建新使用者
    const newUser = await User.create({
      email,
      password,
      name,
    });

    generateSendJWT(newUser, 201, res); // 201: 新增成功
  })
);

// 登入
router.post(
  "/sign_in",
  handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, "帳號密碼不可為空", next));
    }
    // 找出使用者，把密碼取出來改為顯示
    const user = await User.findOne({ email }).select("+password");
    // bcrypt.compare 比對密碼
    // 顯示之後再比對，前台傳過來的密碼與資料庫的密碼是否相同 (做比對)
    const auth = await bcrypt.compare(password, user.password);
    // 如果不相同
    if (!auth) {
      return next(appError(400, "您的密碼不正確", next));
    }
    // 如果相同則執行以下產生 token 回傳
    generateSendJWT(user, 200, res);
  })
);

// 檢視個人資訊
router.get(
  "/profile",
  isAuth, // middleware 這裡是確認是否有登入
  handleErrorAsync(async (req, res, next) => {
    // res.status(200).json({
    //   status: "success",
    //   user: req.user,
    // });
    handleSuccess(res, req.user); // req.user 是我們在 auth.js 裡面自訂放入的使用者資料
  })
);

// 更新個人資訊
router.patch(
  "/profile",
  isAuth, // middleware 這裡是確認是否有登入
  handleErrorAsync(async (req, res, next) => {
    const { photo, name, sex } = req.body;
    // 檢查是否有資料
    if (!name) {
      return next(appError("400", "請輸入您的名字", next));
    }
    // 檢查sex是否有填寫
    if (!sex) {
      return next(appError("400", "請選擇性別", next));
    }
    // 檢查photo是否有填寫
    if (!photo) {
      return next(appError("400", "請上傳大頭貼", next));
    }
    // 更新使用者資料
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, sex, photo },
      { new: true, runValidators: true }
    );
    handleSuccess(res, user);
  })
);

// 更新密碼
router.post(
  "/updatePassword",
  isAuth, // middleware 這裡是確認是否有登入
  handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return next(appError("400", "密碼不一致！", next));
    }

    if (!validator.isLength(password, { min: 8 })) {
      return next(appError(400, "密碼字數低於 8 碼", next));
    }

    // 密碼若正確一致，bcrypt.hash 將會把密碼加密
    newPassword = await bcrypt.hash(password, 12); // 加密密碼

    // 更新密碼，透過 req.user.id 找到使用者，並且更新密碼
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });

    generateSendJWT(user, 200, res);
  })
);

module.exports = router;
