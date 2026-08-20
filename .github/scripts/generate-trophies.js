const https = require('https');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', '..', 'assets');

function fetchJSON(urlPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: urlPath,
      headers: { 'User-Agent': 'GitHub-Trophies-Generator' }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  const user = await fetchJSON('/users/Itz-Nick');
  const repos = await fetchJSON('/users/Itz-Nick/repos?per_page=100');

  const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
  const totalForks = repos.reduce((acc, repo) => acc + (repo.forks_count || 0), 0);
  const repoCount = repos.length;
  const followers = user.followers || 0;

  let trophies = [];
  if (repoCount >= 1) trophies.push({ name: 'Initialization', icon: '🎯', desc: 'First Repository' });
  if (repoCount >= 5) trophies.push({ name: 'Collaborator', icon: '🤝', desc: '5+ Repos' });
  if (repoCount >= 10) trophies.push({ name: 'Star Collector', icon: '⭐', desc: '10+ Repos' });
  if (totalStars >= 1) trophies.push({ name: 'First Star', icon: '🌟', desc: 'Repo Starred' });
  if (totalStars >= 10) trophies.push({ name: 'Star Gazer', icon: '💫', desc: '10+ Stars' });
  if (followers >= 1) trophies.push({ name: 'Followed', icon: '👥', desc: 'Has Followers' });
  if (totalForks >= 1) trophies.push({ name: 'Forked', icon: '🍴', desc: 'Repo Forked' });
  if (trophies.length === 0) trophies.push({ name: 'Beginner', icon: '🌱', desc: 'Getting Started' });

  const trophyWidth = 140;
  const trophyHeight = 120;
  const padding = 15;
  const trophiesPerRow = Math.min(trophies.length, 5);
  const rows = Math.ceil(trophies.length / trophiesPerRow);
  const svgWidth = trophiesPerRow * (trophyWidth + padding) + padding;
  const svgHeight = rows * (trophyHeight + padding) + padding;

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgWidth + '" height="' + svgHeight + '" viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '">';
  svg += '<defs><style>.tc{fill:#161b22;stroke:#30363d;stroke-width:1;rx:8}.ti{font-size:36px;text-anchor:middle}.tn{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;font-size:12px;fill:#58a6ff;text-anchor:middle;font-weight:600}.td{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;font-size:10px;fill:#8b949e;text-anchor:middle}</style></defs>';
  svg += '<rect width="100%" height="100%" fill="#0d1117" rx="8"/>';

  trophies.forEach((t, i) => {
    const row = Math.floor(i / trophiesPerRow);
    const col = i % trophiesPerRow;
    const x = padding + col * (trophyWidth + padding);
    const y = padding + row * (trophyHeight + padding);
    svg += '<rect class="tc" x="' + x + '" y="' + y + '" width="' + trophyWidth + '" height="' + trophyHeight + '"/>';
    svg += '<text class="ti" x="' + (x + trophyWidth / 2) + '" y="' + (y + 45) + '">' + t.icon + '</text>';
    svg += '<text class="tn" x="' + (x + trophyWidth / 2) + '" y="' + (y + 75) + '">' + t.name + '</text>';
    svg += '<text class="td" x="' + (x + trophyWidth / 2) + '" y="' + (y + 95) + '">' + t.desc + '</text>';
  });

  svg += '</svg>';

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'github-trophies.svg'), svg);
  console.log('Generated: ' + repoCount + ' repos, ' + totalStars + ' stars, ' + followers + ' followers');
}

main().catch(console.error);
