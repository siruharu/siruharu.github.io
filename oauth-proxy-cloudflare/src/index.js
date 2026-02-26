const COOKIE_NAME = 'decap_oauth_nonce';

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((entry) => {
    const [rawKey, ...rest] = entry.trim().split('=');
    if (!rawKey) return;
    cookies[rawKey] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

function b64urlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

function safeOrigin(origin) {
  return /^https:\/\/[a-zA-Z0-9.-]+(:\d+)?$/.test(origin) ? origin : '*';
}

function htmlPage(content) {
  return new Response(`<!doctype html><html><body>${content}</body></html>`, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

async function exchangeCodeForToken(code, env) {
  const body = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    client_secret: env.GITHUB_CLIENT_SECRET,
    code
  });

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(data.error_description || data.error || 'No access_token in response');
  }

  return data.access_token;
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
        return json({ error: 'Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET secret' }, 500);
      }

      if (url.pathname === '/health') {
        return json({ ok: true, service: 'decap-oauth-proxy' });
      }

      if (url.pathname === '/auth') {
        const origin = safeOrigin(url.searchParams.get('origin') || '');
        const nonce = crypto.randomUUID().replace(/-/g, '');
        const state = b64urlEncode(JSON.stringify({ nonce, origin }));

        const redirectUri = `${url.origin}/callback`;
        const githubAuth = new URL('https://github.com/login/oauth/authorize');
        githubAuth.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
        githubAuth.searchParams.set('redirect_uri', redirectUri);
        githubAuth.searchParams.set('scope', 'repo,user');
        githubAuth.searchParams.set('state', state);

        return Response.redirect(githubAuth.toString(), 302, {
          headers: {
            'set-cookie': `${COOKIE_NAME}=${nonce}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
          }
        });
      }

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const rawState = url.searchParams.get('state');

        if (!code || !rawState) {
          return htmlPage('<script>window.close();</script>');
        }

        const cookies = parseCookies(request.headers.get('cookie'));
        const nonceCookie = cookies[COOKIE_NAME];

        let state;
        try {
          state = JSON.parse(b64urlDecode(rawState));
        } catch {
          return htmlPage('<script>alert("Invalid OAuth state");window.close();</script>');
        }

        if (!nonceCookie || state.nonce !== nonceCookie) {
          return htmlPage('<script>alert("OAuth state mismatch");window.close();</script>');
        }

        const token = await exchangeCodeForToken(code, env);
        const targetOrigin = safeOrigin(state.origin || '');
        const payload = JSON.stringify({ token, provider: 'github' });

        return htmlPage(`
<script>
  (function () {
    var targetOrigin = ${JSON.stringify(targetOrigin)};
    var payload = ${JSON.stringify(payload)};
    if (window.opener) {
      window.opener.postMessage('authorizing:github', targetOrigin === '*' ? '*' : targetOrigin);
      window.opener.postMessage('authorization:github:success:' + payload, targetOrigin === '*' ? '*' : targetOrigin);
    }
    window.close();
  })();
</script>
`);
      }

      return json({ error: 'Not found' }, 404);
    } catch (error) {
      return json({ error: String(error && error.message ? error.message : error) }, 500);
    }
  }
};
