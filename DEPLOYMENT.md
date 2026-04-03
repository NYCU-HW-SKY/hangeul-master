# 部署指南

## GitHub Pages 自動部署設置

本專案已配置 GitHub Actions 自動部署到 GitHub Pages。

### 一次性設置步驟

#### 1. 推送代碼到 GitHub

```bash
# 如果還沒推送，執行以下命令
git add .
git commit -m "Add GitHub Actions workflow"
git push -u origin main
```

#### 2. 啟用 GitHub Pages

1. 前往你的 GitHub 倉庫：https://github.com/NYCU-HW-SKY/hangeul-master
2. 點擊 `Settings`（設置）
3. 在左側選單找到 `Pages`
4. 在 `Source` 下拉選單中選擇 `GitHub Actions`
5. 保存設置

#### 3. 等待首次部署

- 推送代碼後，GitHub Actions 會自動開始構建
- 前往 `Actions` 標籤查看部署進度
- 首次部署大約需要 1-2 分鐘
- 部署完成後，你的網站將在以下地址可用：
  ```
  https://nycu-hw-sky.github.io/hangeul-master/
  ```

### 自動部署流程

每次你推送代碼到 `main` 分支時：

1. ✅ GitHub Actions 自動觸發
2. ✅ 使用 Bun 安裝依賴
3. ✅ 執行 `bun run build` 構建項目
4. ✅ 將 `dist` 目錄部署到 GitHub Pages
5. ✅ 網站自動更新

### 手動觸發部署

如果需要手動重新部署：

1. 前往倉庫的 `Actions` 標籤
2. 選擇 `Deploy to GitHub Pages` 工作流
3. 點擊 `Run workflow` 按鈕
4. 選擇 `main` 分支
5. 點擊綠色的 `Run workflow` 按鈕

### 查看部署狀態

- 前往 `Actions` 標籤查看所有部署記錄
- 綠色勾號 ✅ 表示部署成功
- 紅色叉號 ❌ 表示部署失敗（點擊查看錯誤日誌）
- 黃色圓圈 🟡 表示正在部署中

### 部署徽章

你可以在 README.md 中添加部署狀態徽章：

```markdown
![Deploy Status](https://github.com/NYCU-HW-SKY/hangeul-master/actions/workflows/deploy.yml/badge.svg)
```

### 故障排除

#### 問題：部署失敗

1. 檢查 Actions 日誌中的錯誤訊息
2. 確認 `bun run build` 在本地可以成功執行
3. 確認所有依賴都在 `package.json` 中正確列出

#### 問題：網站顯示 404

1. 確認 GitHub Pages 已啟用
2. 確認 Source 設置為 `GitHub Actions`
3. 等待幾分鐘讓 DNS 生效
4. 清除瀏覽器緩存

#### 問題：網站內容沒有更新

1. 清除瀏覽器緩存（Ctrl + Shift + R）
2. 確認最新的部署已成功完成
3. 檢查是否有緩存問題

### 本地測試部署版本

在推送前，你可以本地測試構建結果：

```bash
# 構建項目
bun run build

# 預覽構建結果
bun run preview
```

然後在瀏覽器中打開 http://localhost:4173 查看。

### 工作流配置文件

工作流配置文件位於：`.github/workflows/deploy.yml`

主要配置：
- 觸發條件：推送到 `main` 分支或手動觸發
- 構建環境：Ubuntu 最新版
- Node 環境：使用 Bun
- 部署目標：GitHub Pages

### 自定義域名（可選）

如果你有自己的域名：

1. 在倉庫 `Settings` > `Pages` 中設置自定義域名
2. 在你的域名提供商處添加 CNAME 記錄
3. 等待 DNS 生效（可能需要幾小時）

### 安全性

- 工作流使用 GitHub 提供的 token，無需額外配置
- 所有權限都是最小化的
- 只有推送到 `main` 分支的代碼會被部署

---

## 快速參考

```bash
# 本地開發
bun run dev

# 本地構建
bun run build

# 預覽構建結果
bun run preview

# 推送並自動部署
git add .
git commit -m "更新內容"
git push
```

部署完成後訪問：https://nycu-hw-sky.github.io/hangeul-master/
