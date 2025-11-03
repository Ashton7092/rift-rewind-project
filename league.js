// league.js
(() => {
  const form = document.getElementById('lookup-form');
  const summonerInput = document.getElementById('summoner');
  const regionSelect = document.getElementById('region');
  const status = document.getElementById('status');
  const output = document.getElementById('output');

  const LAMBDA_URL = 'https://mdanj2dbzaarv4pxjlr7drlhhu0squuz.lambda-url.us-east-2.on.aws/';

  function setLoading(isLoading, msg = '') {
    status.textContent = msg;
    status.style.opacity = isLoading ? '0.7' : '1';
  }

  function renderError(message) {
    output.innerHTML = `<p class="error">${message}</p>`;
  }

  // Accepts either:
  // A) { name, level, topChampions, profileIconUrl }
  // B) { summoner: { name, level, profileIconUrl }, topChampions: [...] }
  function renderResult(data) {
    const flat = data || {};
    const nested = flat.summoner || {};
    const name = flat.name ?? nested.name ?? 'Unknown';
    const level = flat.level ?? nested.level ?? '—';
    const profileIconUrl = flat.profileIconUrl ?? nested.profileIconUrl ?? null;
    const topChampions = Array.isArray(flat.topChampions) ? flat.topChampions : [];

    const champs = topChampions
      .slice(0, 5)
      .map(c => `<li><span class="pill">${c.name ?? c.championName ?? c.championId}</span> <span class="mono">${Number(c.points ?? c.championPoints ?? 0).toLocaleString()} pts</span></li>`)
      .join('');

    output.innerHTML = `
      <div class="row" style="align-items:center; gap:1rem;">
        ${profileIconUrl ? `<img src="${profileIconUrl}" alt="Profile icon" width="64" height="64" style="border-radius:12px;" />` : ''}
        <div>
          <div class="muted">Summoner</div>
          <h3 style="margin:.1rem 0;">${name}</h3>
          <div class="muted">Level <strong>${level}</strong></div>
        </div>
      </div>
      <div style="margin-top:1rem;">
        <div class="muted">Top Champions</div>
        <ul style="display:grid; gap:.35rem; margin:.35rem 0 0; padding-left:1rem;">${champs || '<li class="muted">No champion data.</li>'}</ul>
      </div>
    `;
  }

  async function lookup(e) {
    e.preventDefault();

    // Define summonerName explicitly so the payload has a real variable
    const summonerName = summonerInput.value.trim();
    const region = regionSelect.value;
    if (!summonerName) return;

    setLoading(true, 'Fetching…');

    try {
      const res = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // If your Lambda expects "summoner" instead, change the key below to { summoner: summonerName, region }
        body: JSON.stringify({ summonerName, region })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Lambda error (${res.status}): ${text}`);
      }

      const data = await res.json();
      renderResult(data);
      setLoading(false, '');
    } catch (err) {
      console.error(err);
      renderError(err.message || 'Something went wrong.');
      setLoading(false, '');
    }
  }

  form.addEventListener('submit', lookup);

  // Optional: deep link support ?s=MiltonSky&r=na1
  const params = new URLSearchParams(location.search);
  const s = params.get('s'); const r = params.get('r');
  if (s) summonerInput.value = s;
  if (r) regionSelect.value = r;
  if (s) document.getElementById('submit')?.click();
})();
