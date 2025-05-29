# Moodle MCP Server

[![CI/CD](https://github.com/ShinonomeLabo/moodle-mcp/actions/workflows/docker.yml/badge.svg)](https://github.com/ShinonomeLabo/moodle-mcp/actions/workflows/docker.yml)
[![CI](https://github.com/ShinonomeLabo/moodle-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/ShinonomeLabo/moodle-mcp/actions/workflows/ci.yml)
[![Docker Hub](https://img.shields.io/docker/cloud/build/shinonomelaboratory/moodle-mcp)](https://hub.docker.com/r/shinonomelaboratory/moodle-mcp)
[![Docker Pulls](https://img.shields.io/docker/pulls/shinonomelaboratory/moodle-mcp)](https://hub.docker.com/r/shinonomelaboratory/moodle-mcp)
[![Docker Image Size](https://img.shields.io/docker/image-size/shinonomelaboratory/moodle-mcp/latest)](https://hub.docker.com/r/shinonomelaboratory/moodle-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Model Context Protocol (MCP) server for Moodle Web Service API integration.

## 概要

このプロジェクトは、Moodleの Web Service API と通信するためのMCPサーバーをNode.jsで実装したものです。MoodleのさまざまなAPIエンドポイントにアクセスし、コース情報、ユーザー情報、アサインメント、Analytics API等のデータを取得・操作できます。

## 機能

### コア機能
- 🎓 **コース管理**: コース一覧、コンテンツ、ユーザー登録状況の取得
- 👥 **ユーザー管理**: ユーザー検索、作成、更新、削除
- 📝 **アサインメント**: 課題の一覧取得
- 🏢 **サイト情報**: Moodleサイトの基本情報取得
- 🔧 **汎用API呼び出し**: 任意のMoodle Web Service関数の直接呼び出し

### 拡張機能
- 📊 **成績管理**: 成績の取得、レポート生成
- 💬 **フォーラム**: フォーラムとディスカッションの管理
- 📧 **メッセージング**: メッセージの送受信、通知管理
- 📁 **ファイル管理**: ファイルのアップロード、取得
- 📈 **Analytics API**: 予測モデル、インサイト、機械学習の統合
- 🎯 **小テスト**: クイズの管理、試行の追跡
- 📚 **SCORM**: SCORMパッケージの管理とトラッキング
- 👥 **コホート**: ユーザーグループの管理
- 🏷️ **タグシステム**: タグの管理と検索
- 📝 **ブログ**: ブログエントリの管理
- 🔐 **ロール管理**: ロールの割り当てと権限管理

### Analytics API機能 ([Moodle Analytics API](https://moodledev.io/docs/5.1/apis/subsystems/analytics)対応)
- 予測モデルの管理（作成、トレーニング、評価）
- インサイトの取得と管理
- インジケーターとターゲットの設定
- 時間分割方法の管理
- モデルの統計情報とレポート

## 必要条件

- Node.js 18以上、またはDocker
- MoodleサイトでWeb Servicesが有効になっていること
- 有効なWeb Service Token

## インストール

### Option 1: Docker を使用（推奨）

#### Docker Hubから実行

```bash
# Docker Hubから最新版をプル
docker pull shinonomelaboratory/moodle-mcp:latest

# 環境変数を設定して実行
docker run -it --rm \
  -e MOODLE_SITE_URL=https://your-moodle-site.com \
  -e MOODLE_WS_TOKEN=your-webservice-token \
  shinonomelaboratory/moodle-mcp:latest
```

#### Docker Composeを使用

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/moodle-mcp.git
cd moodle-mcp

# 環境変数を設定
cp env.example .env
# .envファイルを編集

# Docker Composeで起動
docker-compose up -d
```

### Option 2: ローカル環境でのインストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/moodle-mcp.git
cd moodle-mcp

# 依存関係をインストール
npm install

# ビルド
npm run build
```

## 設定

1. `env.example` を `.env` にコピーします：

```bash
cp env.example .env
```

2. `.env` ファイルを編集し、Moodleの設定を入力します：

```env
MOODLE_SITE_URL=https://your-moodle-site.com
MOODLE_WS_TOKEN=your-webservice-token
```

## 使用方法

### Docker環境

```bash
# Docker Composeで起動
docker-compose up -d

# ログを確認
docker-compose logs -f moodle-mcp

# 停止
docker-compose down
```

### ローカル環境

#### 開発モード

```bash
npm run dev
```

#### プロダクションモード

```bash
npm run build
npm start
```

### MCPクライアントからの接続

#### Docker環境の場合

```json
{
  "mcpServers": {
    "moodle": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "MOODLE_SITE_URL=https://your-moodle-site.com",
        "-e", "MOODLE_WS_TOKEN=your-token",
        "shinonomelaboratory/moodle-mcp:latest"
      ]
    }
  }
}
```

#### ローカル環境の場合

```json
{
  "mcpServers": {
    "moodle": {
      "command": "node",
      "args": ["/path/to/moodle-mcp/dist/index.js"],
      "env": {
        "MOODLE_SITE_URL": "https://your-moodle-site.com",
        "MOODLE_WS_TOKEN": "your-token"
      }
    }
  }
}
```

## 利用可能なツール

### 基本ツール

#### `get_site_info`
Moodleサイトの基本情報を取得します。

#### `get_users`
ユーザーを検索して情報を取得します。
- `searchKey`: 検索キー (username, email, firstname, lastname)
- `searchValue`: 検索値

#### `get_courses`
コース一覧を取得します。
- `ids`: コースID配列（オプション）

#### `get_user_courses`
特定ユーザーのコース一覧を取得します。
- `userId`: ユーザーID

#### `get_course_contents`
コースのコンテンツとモジュールを取得します。
- `courseId`: コースID

#### `get_assignments`
アサインメント（課題）を取得します。
- `courseIds`: コースID配列（オプション）

### 拡張ツール

#### `get_grades`
成績を取得します。
- `courseId`: コースID
- `component`: コンポーネント名（オプション）
- `activityId`: 活動ID（オプション）
- `userIds`: ユーザーID配列（オプション）

#### `get_forums`
フォーラムを取得します。
- `courseIds`: コースID配列（オプション）

#### `get_categories`
コースカテゴリを取得します。
- `criteria`: 検索条件（オプション）
- `addSubcategories`: サブカテゴリを含める

### Analytics APIツール

#### `analytics_get_models`
Analytics予測モデルを取得します。
- `includeDisabled`: 無効なモデルを含める

#### `analytics_get_insights`
Analyticsインサイトを取得します。
- `modelId`: モデルID（オプション）
- `contextId`: コンテキストID（オプション）
- `userId`: ユーザーID（オプション）
- `status`: インサイトのステータス

#### `analytics_train_model`
Analyticsモデルをトレーニングします。
- `modelId`: モデルID

#### `analytics_predict_model`
Analyticsモデルから予測を取得します。
- `modelId`: モデルID

### `call_function`
任意のMoodle Web Service関数を直接呼び出します。
- `functionName`: 関数名
- `params`: パラメータ（オプション）

この汎用ツールを使用することで、上記にリストされていない任意のMoodle Web Service APIを呼び出すことができます。

## 開発

### スクリプト

- `npm run build` - TypeScriptをコンパイル
- `npm run dev` - 開発モードで実行（ホットリロード）
- `npm run lint` - ESLintでコードをチェック
- `npm run format` - Prettierでコードをフォーマット
- `npm test` - テストを実行

### Docker開発環境

```bash
# 開発用イメージをビルド
docker build -t moodle-mcp:dev .

# 開発コンテナーを起動
docker run -it --rm \
  -v $(pwd):/app \
  -e MOODLE_SITE_URL=https://your-moodle-site.com \
  -e MOODLE_WS_TOKEN=your-token \
  moodle-mcp:dev
```

## アーキテクチャ

プロジェクトは以下のような構造になっています：

```
src/
├── index.ts              # MCPサーバーのエントリーポイント
├── services/
│   └── moodleClient.ts   # Moodle API通信クライアント
├── handlers/
│   ├── extendedHandlers.ts     # 拡張API機能
│   ├── analyticsHandlers.ts    # Analytics API
│   └── comprehensiveHandlers.ts # 包括的なAPI機能
└── types/
    ├── moodle.ts         # 基本的なMoodle型定義
    └── analytics.ts      # Analytics API型定義
```

## Docker Hub

このプロジェクトのDockerイメージは[Docker Hub](https://hub.docker.com/r/shinonomelaboratory/moodle-mcp)で公開されています。

利用可能なタグ：
- `latest` - 最新の安定版
- `v1.0.0`, `v1.0`, `v1` - 特定のバージョン
- `main` - 開発版（mainブランチ）

```bash
# 最新版を取得
docker pull shinonomelaboratory/moodle-mcp:latest

# 特定のバージョンを取得
docker pull shinonomelaboratory/moodle-mcp:v1.0.0
```
