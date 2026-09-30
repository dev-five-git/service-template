# service-template

데브파이브 서비스 프로젝트 템플릿입니다. 프론트 앱 두 개(`apps/front`, `apps/admin`)와 Rust API(`apis/api`)가 한 저장소에 있습니다.

| 영역 | 스택 |
|---|---|
| `apps/front`, `apps/admin` | Next.js App Router를 Vite에서 실행하는 [vinext](https://github.com/cloudflare/vinext), React 19 + React Compiler |
| 스타일 | [devup-ui](https://github.com/dev-five-git/devup-ui) (`devup.json` 테마 토큰) |
| API 클라이언트 | [devup-api](https://github.com/dev-five-git/devup-api) (`openapi.json`에서 생성) |
| `apis/api` | Rust / Axum ([vespera](https://github.com/dev-five-git/vespera)), DB 스키마는 [vespertide](https://github.com/dev-five-git/vespertide) |
| 도구 | bun workspaces, oxlint + eslint-plugin-devup, TypeScript 7 |

코드를 쓰기 전에 [AGENTS.md](AGENTS.md)를 읽으세요. 이 템플릿에서 실제로 자주 틀리는 규칙을 모아 두었습니다.

## 개발

```bash
bun install
bun run api                # Rust API → http://localhost:8000 (DATABASE_URL이 없으면 SQLite test.db)
cd apps/front && bun dev   # → http://localhost:3000
cd apps/admin && bun dev   # → http://localhost:3001
```

서버는 각각 다른 터미널에서 띄웁니다. dev 서버는 앱 폴더 안에서 실행하세요. `bun -F front dev`는 좀비 프로세스를 남깁니다.

## 검증

```bash
bun run lint     # cargo clippy / fmt / check + oxlint (경고 0 유지)
bun test
cargo test --all-targets
bun run build    # 두 앱 standalone 빌드
```

`bun run test`는 뒤이어 `cargo tarpaulin`까지 실행하는데, Windows에서는 동작하지 않습니다. Windows에서는 위처럼 `bun test`와 `cargo test`를 따로 실행하세요.

## devup-mcp로 개발하기

이 템플릿은 [devup-mcp](https://github.com/dev-five-git/devup-mcp)로 개발하는 것을 전제로 합니다. devup-mcp는 프로젝트의 실제 `devup.json`, `openapi.json`, vespertide 모델과 Figma 파일을 읽어 주는 MCP 서버입니다. 그래서 토큰 이름이나 API 모양을 에이전트가 추측하지 않아도 됩니다.

1. [Releases](https://github.com/dev-five-git/devup-mcp/releases)에서 받습니다. `.mcpb`를 지원하는 앱(예: Claude 데스크톱)은 `devup-mcp-<version>.mcpb`를 열면 설치되고, 그 밖에는 OS별 바이너리를 받습니다.
2. 사용하는 에이전트에 stdio MCP 서버로 등록합니다. 아래는 `mcpServers` 형식의 예이고, 설정 형식은 에이전트마다 다릅니다. devup-mcp는 `--allow-write-root`로 지정한 폴더 안에만 파일을 씁니다.

   ```json
   {
     "mcpServers": {
       "devup-mcp": {
         "command": "devup-mcp",
         "args": ["--allow-write-root", "/absolute/path/to/this/repo"]
       }
     }
   }
   ```

3. 에이전트에서 `devup_skills`의 `status`를 실행하고, 빠진 스킬은 `install`로 설치합니다(devfive-frontend, devup-ui, vespera, vespertide, changepacks).

주로 쓰는 도구는 다음과 같습니다. 전체 규칙은 [AGENTS.md](AGENTS.md)의 7절에 있습니다.

| 작업 | 도구 |
|---|---|
| UI 작성 전 테마 토큰·재사용할 컴포넌트 확인 | `devup_project_context` (`theme`, `ui`) |
| API·DB 스키마 확인 | `devup_project_context` (`api`, `db`) |
| Figma 화면 구현 | `devup_figma_auth` → `devup_figma_export` |
| 작성한 devup-ui 코드 검증 | `devup_ui_validate` |
| 모델·라우트·openapi 불일치 확인 | `devup_stack_diff` |

## 배포

`.github/workflows/deploy.yml`이 PR과 `main` push마다 lint, test, build를 실행하고, `main`에 push되면 배포까지 합니다. 배포 환경(DEV/PROD)은 워크플로가 changepacks 결과와 실행 방식에 따라 고릅니다.

- `Dockerfile.build`가 두 앱의 standalone 빌드와 API 릴리스 바이너리를 만듭니다.
- 서버에서는 `docker compose`가 nginx, node(pm2로 front 3000·admin 3001), api(8000) 컨테이너를 띄웁니다.
- 도메인별 라우팅은 `nginx.conf`에 있습니다.

## 버전 관리

버전은 changepacks로 관리합니다. `.changepacks/config.json`이 추적하는 파일(현재 루트 `package.json`)의 변경을 릴리스하려면 changepack 로그를 추가합니다.

```bash
bunx @changepacks/cli --yes --update-type patch --message "변경 이유"
```

플래그 없이 실행하면 대화형 선택 화면이 열립니다.
