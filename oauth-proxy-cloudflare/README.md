# Decap OAuth Proxy (Cloudflare Worker)

GitHub Pages + Decap CMS에서 GitHub 로그인을 사용하기 위한 OAuth 프록시입니다.

## 1) GitHub OAuth App 생성

GitHub > Settings > Developer settings > OAuth Apps > New OAuth App

- Homepage URL: Worker 배포 주소 (예: `https://siruharu-decap-auth.<subdomain>.workers.dev`)
- Authorization callback URL: `https://siruharu-decap-auth.<subdomain>.workers.dev/callback`

생성 후 `Client ID`, `Client Secret` 확보

## 2) Worker 배포

```bash
cd oauth-proxy-cloudflare
npm create cloudflare@latest . -- --type=hello-world --no-deploy
# 위 명령은 로컬 도구 설치 목적. 파일은 이미 준비되어 있음.

# 시크릿 등록
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET

# 배포
wrangler deploy
```

배포 후 Worker URL 예시:
- `https://siruharu-decap-auth.<subdomain>.workers.dev`

## 3) Decap CMS 연결

`public/admin/config.yml` 수정:

```yml
backend:
  name: github
  repo: siruharu/siruharu.github.io
  branch: main
  base_url: https://siruharu-decap-auth.<subdomain>.workers.dev
  auth_endpoint: auth
```

## 4) 확인

- `https://siruharu.github.io/admin` 접속
- `Login with GitHub` 클릭
- 로그인 후 글 작성/저장 테스트

## 참고

- `/health` 엔드포인트 제공: `https://.../health`
