import fetch from 'node-fetch';

async function diag() {
    try {
        const res = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
        const data = await res.json();
        console.log('ID | SHORT | NAME');
        console.log('---|-------|-----');
        data.teams.forEach(t => {
            console.log(`${t.id} | ${t.short_name} | ${t.name}`);
        });
    } catch (e) {
        console.error(e);
    }
}

diag();
