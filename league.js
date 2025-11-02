// league.js


function setLoading(isLoading, msg = '') {
status.textContent = msg;
status.classList.toggle('loading', isLoading);
}


function renderError(message) {
output.innerHTML = `<p class="error">${message}</p>`;
}


function renderResult(data) {
// Expected shape from your Lambda: { level, topChampions: [{ name, points }, ...], profileIconUrl }
const { level, topChampions = [], profileIconUrl, name } = data || {};


const champs = topChampions
.slice(0, 5)
.map(c => `<li><span class="pill">${c.name}</span> <span class="mono">${c.points.toLocaleString()} pts</span></li>`)
.join('');


output.innerHTML = `
<div class="row" style="align-items:center; gap:1rem;">
${profileIconUrl ? `<img src="${profileIconUrl}" alt="Profile icon" width="64" height="64" style="border-radius:12px;" />` : ''}
<div>
<div class="muted">Summoner</div>
<h3 style="margin:.1rem 0;">${name ?? 'Unknown'}</h3>
<div class="muted">Level <strong>${level ?? '—'}</strong></div>
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
const summoner = summonerInput.value.trim();
const region = regionSelect.value;
if (!summoner) return;


setLoading(true, 'Fetching…');


try {
const res = await fetch(LAMBDA_URL, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ summoner, region })
});


// Handle Lambda errors
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
