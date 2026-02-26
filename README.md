# siruharu.github.io

Astro + GitHub Pages + GitHub Actions + Decap CMS 기반 블로그입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 글 작성

`src/pages/posts/` 아래에 Markdown 파일을 추가하세요.

```md
---
layout: ../../layouts/PostLayout.astro
title: 새 글 제목
date: 2026-02-26
description: 글 요약
category: 카테고리명
tags:
  - tag1
  - tag2
---

본문 내용
```

- 파일명은 URL이 됩니다.
- 예: `src/pages/posts/my-note.md` -> `/posts/my-note/`
- 메인 페이지에서 `category`, `tags`로 검색/필터링됩니다.

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동 배포합니다.

필수 저장소 설정:
1. `Settings > Pages > Source`에서 `GitHub Actions` 선택
2. 기본 브랜치를 `main`으로 사용

## 관리자에서 글쓰기 (Decap CMS)

- 관리자 페이지: `https://siruharu.github.io/admin`
- 설정 파일: `public/admin/config.yml`

GitHub 로그인 작성 기능을 쓰려면 OAuth 프록시가 필요합니다.
- `public/admin/config.yml`의 값을 실제 주소로 변경
- `backend.base_url`
- `backend.auth_endpoint`
- Cloudflare Worker 템플릿: `oauth-proxy-cloudflare/`

로컬 테스트:
1. `npm run dev`
2. 다른 터미널에서 `npx decap-server`
3. `http://localhost:4321/admin` 접속

실제 배포 순서:
1. `oauth-proxy-cloudflare/README.md` 기준으로 Worker 배포
2. `public/admin/config.yml`에 Worker 주소 반영
3. 블로그 저장소 push
4. `https://siruharu.github.io/admin`에서 GitHub 로그인 테스트

고양이 이미지 교체:
- 프로필: `public/siru.png`, `public/haru.png`
