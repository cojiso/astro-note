---
title: Windmill を GCE で長期間安全にセルフホストする
id: rzom47ia
public: true
publishedAt: 2026-11-15
editedAt: 2026-11-20
description: Windmill のセルフホストを長期間安定して動かすときに、エラーもアラートも出ないまま起きる問題と、それを塞いだ GCE と Pulumi のテンプレートの仕組みの解説
tags:
  - Windmill
  - Google-cloud
  - Pulumi
---
## はじめに

[Windmill](https://www.windmill.dev) はワークフロー自動化ツール[^naming]のひとつです。コードが中心のツールで、フローの各ステップを TypeScript・Python・Go などで記述できます。Git でレビューし、コーディングエージェントを活用した開発や保守もできます。公式の Windmill Cloud とセルフホストの2つの環境があり、料金など詳しくは [ワークフロー自動化ツール Windmill の勧め](/note/7eyfv8gz) で解説しました。

n8n から Windmill に乗り換え、2026年の夏頃からセルフホストで運用しています。長期間安定して運用するには、コンテナや OS のアップデート、バックアップ、ディスクの肥大化の防止、障害時のアラートなど、多くのことに気を配る必要があります。

Windmill をほかの組織や環境でも使いたいと考え、構築の簡単さと長期運用の安定を両立する、Google Cloud（GCP）向けのインフラテンプレート（[cojiso/windmill-gce](https://github.com/cojiso/windmill-gce)）を作成しました。

構築手順はテンプレートの README にまとめ、それを読むだけで構築できるようにしています。この記事では、テンプレートの概要を説明したあと、長期間運用したときに起こりがちな問題を整理し、その塞ぎ方を解説します。

## テンプレートの概要

### 全体の仕組み

構成は3つの場所に分かれます。バーチャルマシン（VM）が動く Google Compute Engine（GCE）、ワークフローのコードとバージョンを管理する GitHub、コードを書くローカルマシンです。

クラウドの構成は、IaC（Infrastructure as Code）ツールの [Pulumi](https://www.pulumi.com) でまとめて構築します。VM、ブート用とデータ用の2本のディスク、ファイアウォール、バックアップ用の GCS バケット、定期スナップショット、監視アラート、[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) などです。

GitHub では、[Renovate](https://docs.renovatebot.com) が VM のコンテナイメージなどの新しいバージョンを見つけ、設定ファイルを書き換える PR を作ります。マイナーとパッチのアップデートは、CI が通れば自動でマージされ、その夜に VM に取り込まれます。

VM では、次の処理が毎晩自動で動きます。

| 時刻（JST） | 処理                                   |
| ------- | ------------------------------------ |
| 02:00   | データディスクのスナップショットを作成                  |
| 03:00   | リポジトリを `git pull` し、コンテナをアップデート      |
| 04:00   | Postgres の全データベースを GCS へダンプ[^backup] |
| 05:00   | OS のセキュリティアップデートを適用し、必要なら再起動         |
| 5分ごと    | Windmill のヘルスチェック                    |

ディスクやメモリの使用率が85%を超えたときや、毎晩の処理やヘルスチェックが失敗したときは、Cloud Monitoring からメールでアラートが届きます。

### 立ち上げ

設定ファイル（`Pulumi.prod.yaml`）を埋めて `pulumi up` を実行すれば、5分ほどで自分の Windmill にアクセスできるようになります。

### ワークフローの編集

ワークフローは、`wmill sync pull` で手元に取り込んで Git で管理し、エディタやコーディングエージェントで編集してから、`wmill sync push` で Windmill に反映します。

ただし `wmill sync push` は差分をマージせず、Windmill 側にあって手元にないもの（スクリプト、フロー、リソース、スケジュールなど）を削除します[^sync-push]。テンプレートでは、同期の対象をスクリプトとフローのフォルダーに絞り、接続情報（リソース）は Web 管理画面で扱います。

## 起こりがちな問題

長期間運用する上では、エラーもアラートも出ないまま期待通りに動作しなくなることがあります。この節では、そうしたサイレントな問題を4つ取り上げます。

### アップデートの PR が起票されない

コンテナやライブラリのアップデートは、すぐに適用したいものです。しかしサプライチェーン攻撃によるコード汚染のリスクもあります。こうした悪意の混入したバージョンは、多くの場合数日のうちに見つかって取り下げられます[^cooldown]。そこで Renovate には、公開から5日たったバージョンだけを PR にするよう設定しました[^release-age]。

しかし、この設定には落とし穴があります。Renovate は、公開日時の分からないバージョンを、いつまでも「まだ5日たっていない」とみなして保留し続けるため[^release-age-behaviour]、アップデートが止まります。現在または将来に影響を受けるものは、ghcr.io にある Windmill のイメージと、Docker Hub にある cloudflared・Caddy[^caddy]・Postgres です。

Windmill のイメージが置かれている ghcr.io（GitHub Container Registry）は、タグの公開日時を返しません。Docker Hub は、タグが1,000件を超えるイメージについて、匿名でのタグ一覧の取得を拒否します[^dockerhub]。そのため、どちらも Renovate はアップデートの PR をいつまでも起票しません。そこで、バージョンの検知ソース[^datasource]を、公開日時を取得できる GitHub Releases に切り替えました。

また、Docker のタグは後から別のイメージに付け替えられます[^tj-actions]。同じタグの中身が差し替わっても、Renovate から見ればバージョンは変わらないため、5日待ち戦略では防げません。ダイジェストで固定すれば防げますが、Renovate は GitHub Releases からはダイジェストを取得できません。そこで、毎晩のアップデートでは `docker compose pull` を使わず、手元にない新しいタグだけを取得するようにしました。一度取得したタグは取り直さないため、後から中身が差し替えられても VM には届きません。

### Postgres のメジャーアップデート

Postgres の公式イメージは、メジャーアップデートのときにデータを自動で移行しません。移行は、利用者が `pg_upgrade` やダンプとリストアで行う前提です。

Postgres 18以降は、新旧のバージョンを並べて移行できるように、データを `/var/lib/postgresql/18/docker` のようにメジャーバージョンごとのディレクトリに置きます[^pgdata]。そのため、タグだけを `18` から `19` に上げると、`19` のディレクトリはもちろん空です。Postgres はそこに新しいデータベースを作り、何事もなかったように起動します[^entrypoint]。

すべてのデータを Postgres に置いている Windmill は、空のデータベースを見て新規インストールとして動き出し、初期の管理者アカウントも初期パスワードのまま復活します。応答は正常なため、ヘルスチェックも通り、アラートも出ません。定期実行のフローも、エラーもなく止まります。

テンプレートでは、Postgres のメジャーアップデートは手作業で行うことにしています[^pg-guide]。そのうえで、コンテナのメジャーバージョンとディスク上のデータのバージョンを照合し、食い違っていれば、起動も毎晩のアップデートも止めてアラートを発するスクリプトを入れました[^check-pg]。

### ディスクあふれ

ブートディスクがあふれると、OS もコンテナもまともに動かなくなります。そこでテンプレートでは、OS 用のブートディスクとデータディスクを分けています。

特に増えるのは Docker のデータです。置き場所は、Docker 自身の保存先（`/var/lib/docker`）と、Docker が取得したイメージを置く containerd のイメージストア（`/var/lib/containerd`）です[^containerd]。テンプレートでは、両方をデータディスクに移しています[^data-root]。

### スナップショットからの復旧

スナップショットは、万が一のときに状態を戻すためにあります。復旧するときに気をつける点は3つです。

- **ディスクを付け替えない**：
  データディスクは Pulumi が管理しているため、`gcloud` や Web コンソールで付け替えると、次の `pulumi up` で Pulumi が元のディスクに付け戻そうとします。テンプレートでは、スナップショットから一時的なディスクを作って読み取り専用で追加し、Postgres のデータだけを書き戻します。
- **読み取り専用のマウントには `noload` が要る**：
  読み取り専用で付けたディスクでも、ext4 はマウントの際にジャーナルを再生しようとして失敗します。再生を飛ばすオプション（`-o ro,noload`）を付けます。
- **起動時のクラッシュリカバリは正常**：
  稼働中に取ったスナップショットのため、起動ログに `database system was not properly shut down; automatic recovery in progress` と出てから、自動で修復して起動します。

## 残る作業と課題

このテンプレートは、少人数のチームが社内の業務自動化を1台の VM で回すことを想定しています。運用の多くは自動化されていますが、アラートが来たら対応する必要があります。年に数回は、Dependency Dashboard で、メジャーアップデートと Postgres のアップデートを承認します。Postgres のメジャーアップデートは、手作業での移行が要ります。そのうえで、次の課題もあります。

冗長化がありません。VM は1台のため、OS のアップデートで深夜の再起動があります。コンテナのアップデートがあった夜も、入れ替えの間は少し止まります。一瞬たりとも止まっては困る用途には向きません。

外からの死活監視がありません。アラートの送信元は、Ops Agent が送るリソース使用率と、スクリプトが書くエラーのログです。どちらも VM の中から届くため、VM ごと止まると何も届きません。Cloud Monitoring の Uptime Check などの外形監視は今後の課題です。

## おわりに

テンプレートは GitHub（[cojiso/windmill-gce](https://github.com/cojiso/windmill-gce)）で、MIT ライセンスで公開しています。Windmill を使いたいけれど、インフラの保守に追われたくない方の参考になればうれしいです。

[^naming]: この記事でのワークフロー自動化ツールは、Slack や Notion などの外部 SaaS、データベース、スマート家電などをつなぐ処理を組めて、スケジュール（cron）や Webhook をきっかけに動き、認証情報や実行ログをまとめて管理できるツールやサービスを指します。

[^backup]: VM には、バケットに新しく書き込む権限と読む権限だけを渡しています。削除や上書きはできないため、VM が侵害されても、過去のバックアップは消されません。

[^sync-push]: 公式ドキュメントの [Sync](https://www.windmill.dev/docs/advanced/cli/sync) でも、送り先にあって送り元にないものは削除されると説明されています。危険な操作のため、バージョン管理したフォルダーで実行するよう勧めています。

[^cooldown]: William Woodruff の [We should all be using dependency cooldowns](https://blog.yossarian.net/2025/11/21/We-should-all-be-using-dependency-cooldowns) では、直近18か月の主なサプライチェーン攻撃10件のうち8件で、悪意のあるバージョンが出回っていた期間が1週間未満だったと整理されています。この記事は [Hacker News](https://news.ycombinator.com/item?id=46005111) と [Lobsters](https://lobste.rs/s/rygog1) でも大きく議論されました。[反論の記事](https://calpaterson.com/deps.html)もあります。

[^release-age]: Renovate の設定 `minimumReleaseAge: "5 days"` です。

[^release-age-behaviour]: 設定 [`minimumReleaseAgeBehaviour`](https://docs.renovatebot.com/configuration-options/#minimumreleaseagebehaviour) の既定値 `timestamp-required` による動作です。同じ報告が、Renovate の [Discussions](https://github.com/renovatebot/renovate/discussions?discussions_q=minimumReleaseAge+timestamp) に多数寄せられています。

[^caddy]: [Caddy](https://caddyserver.com) は、Go 製のオープンソース Web サーバーです。

[^dockerhub]: 匿名のリクエストで1,000件より先のタグを取ろうとすると、Docker Hub は403を返します。Renovate はこのとき、取得済みの公開日時もまとめて捨ててしまいます。この動作は、Renovate の [Issue #46925](https://github.com/renovatebot/renovate/issues/46925) で報告されています。

[^datasource]: Renovate の設定では datasource と呼ばれます。

[^tj-actions]: 2025年3月には、GitHub Actions の `tj-actions/changed-files` で、既存のバージョンタグが悪意のあるコミットに付け替えられる[事件](https://github.com/advisories/GHSA-mrrh-fwg8-r2c3)が起きました。

[^pgdata]: 公式イメージの[ドキュメント](https://hub.docker.com/_/postgres)の `PGDATA` の項で説明されています。

[^entrypoint]: 空のデータベースを作るのは、公式イメージの起動スクリプト（[`docker-entrypoint.sh`](https://github.com/docker-library/postgres/blob/master/docker-entrypoint.sh)）です。データディレクトリに `PG_VERSION` がなければ、`initdb` を実行してから Postgres を起動します。

[^pg-guide]: 移行の手順は、Windmill の公式ガイド [Upgrade PostgreSQL to 18](https://www.windmill.dev/docs/advanced/self_host#upgrade-postgresql-to-18) に沿います。

[^check-pg]: テンプレートの [`configs/check-pg-major.sh`](https://github.com/cojiso/windmill-gce/blob/main/configs/check-pg-major.sh) です。

[^containerd]: [Docker 29](https://docs.docker.com/engine/release-notes/29/)（2025年11月）から、新しくインストールした環境では containerd のイメージストアが既定になりました。28以前から上げた環境は、これまでどおり `/var/lib/docker` を使います。

[^data-root]: よく知られた Docker の設定 `data-root` で移せるのは Docker 自身の保存先だけで、containerd のイメージストアはブートディスクに残ります。テンプレートでは、`data-root` をデータディスクに向けたうえで、`/var/lib/containerd` をデータディスクにバインドマウントしています。

