// script.js - News Intelligence Reconstruction (Round 41)

// -- 0. Global Setup --
const config = {
    responsive: true,
    displayModeBar: false,
    scrollZoom: false
};

const theme = {
    font: '#fff',
    accent: '#00f2ff',
    secondary: '#ff0055',
    fontSize: 18,
    titleSize: 32,
    axisSize: 16,
    grid: 'rgba(255,255,255,0.05)',
    bg: 'rgba(0,0,0,0)',
    tooltipBg: '#0b0d17',
    tooltipText: '#ffffff'
};

// -- 1. Data Store & Processing --
let store = {};

function processData(data) {
    const processed = {};
    data.forEach(row => {
        const entity = row['Entity'];
        if (entity === 'World') return; // Handled separately or filtered

        const year = parseInt(row['Year']);
        const launches = parseInt(row['Annual number of objects launched into outer space']);
        const code = row['Code'];

        if (!processed[entity]) processed[entity] = { years: [], launches: [], code: code, total: 0 };
        processed[entity].years.push(year);
        processed[entity].launches.push(launches);
        processed[entity].total += launches;
    });

    // Handle 'World' separately to ensure it exists
    const worldData = data.filter(r => r.Entity === 'World');
    processed['World'] = { years: [], launches: [], total: 0 };
    worldData.forEach(r => {
        processed['World'].years.push(parseInt(r.Year));
        processed['World'].launches.push(parseInt(r['Annual number of objects launched into outer space']));
    });

    // Sort all
    for (const e in processed) {
        const combined = processed[e].years.map((y, i) => ({ y, l: processed[e].launches[i] }));
        combined.sort((a, b) => a.y - b.y);
        processed[e].years = combined.map(c => c.y);
        processed[e].launches = combined.map(c => c.l);
    }
    return processed;
}

// -- 2. Central Controller --
window.addEventListener('resize', () => {
    const containers = ['chart1', 'chart2', 'chart3', 'chart4', 'chart5'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.innerHTML !== "") Plotly.Plots.resize(el);
    });
});

window.onSlideChange = function (index) {
    setTimeout(() => {
        switch (index) {
            case 1: renderViz1(); break;
            case 2: renderViz2(); break;
            case 3: renderViz3(); break;
            case 4: renderViz4(); break;
            case 5: renderViz5(); break;
        }
    }, 150);
};

// -- 3. Visualizations (News Style) --

// Viz 1: DATA BRIEFING: THE EXPONENTIAL ASCENT OF ORBITAL ASSETS
function renderViz1() {
    const container = 'chart1';
    Plotly.purge(container);

    const entities = ['United States', 'Russia', 'China', 'India', 'World'];
    const colors = { 'United States': theme.accent, 'Russia': theme.secondary, 'China': '#ffe600', 'India': '#ff9900', 'World': '#fff' };

    const traces = entities.map(e => {
        const d = store[e];
        if (!d) return null;
        return {
            x: d.years, y: d.launches,
            name: e.toUpperCase(),
            type: 'scatter', mode: 'lines',
            line: { color: colors[e], width: e === 'World' ? 5 : 3, shape: 'spline' },
            hovertemplate: `<b>${e.toUpperCase()}</b><br>YEAR: %{x}<br>LAUNCHES: %{y}<extra></extra>`
        };
    }).filter(t => t);

    const layout = {
        title: { text: 'DATA BRIEFING: THE EXPONENTIAL ASCENT OF ORBITAL ASSETS', font: { size: theme.titleSize, color: theme.accent, family: 'Orbitron' }, y: 0.95 },
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: theme.font, family: 'Roboto' },
        xaxis: { title: 'OPERATIONAL YEAR', gridcolor: theme.grid, tickfont: { size: theme.axisSize } },
        yaxis: { title: 'ANNUAL OBJECTS DEPLOYED', gridcolor: theme.grid, tickfont: { size: theme.axisSize } },
        margin: { t: 100, b: 80, l: 100, r: 50 },
        legend: { orientation: 'h', y: 1.05, font: { size: 16 } },
        hovermode: 'x unified'
    };

    Plotly.newPlot(container, traces, layout, config);
}

// Viz 2: STRATEGIC OVERVIEW: GLOBAL LAUNCH DYNAMICS BY SUPERPOWERS
function renderViz2() {
    const container = 'chart2';
    Plotly.purge(container);

    const majors = ['United States', 'Russia', 'China'];
    const world = store['World'];
    const years = world.years;

    const traces = majors.map(m => {
        const d = store[m];
        const yData = years.map(y => {
            const idx = d.years.indexOf(y);
            return idx !== -1 ? d.launches[idx] : 0;
        });
        return {
            x: years, y: yData, name: m.toUpperCase(), type: 'bar',
            marker: { color: m === 'United States' ? theme.accent : m === 'Russia' ? theme.secondary : '#ffe600' }
        };
    });

    // Add 'OTHERS'
    const othersData = years.map((y, i) => {
        let sum = 0;
        majors.forEach(m => {
            const d = store[m];
            const idx = d.years.indexOf(y);
            sum += idx !== -1 ? d.launches[idx] : 0;
        });
        return Math.max(0, world.launches[i] - sum);
    });
    traces.push({ x: years, y: othersData, name: 'OTHERS/EMERGING', type: 'bar', marker: { color: '#444' } });

    const layout = {
        title: { text: 'STRATEGIC OVERVIEW: GLOBAL LAUNCH DYNAMICS BY SUPERPOWERS', font: { size: theme.titleSize, color: theme.accent, family: 'Orbitron' } },
        barmode: 'stack',
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: theme.font },
        xaxis: { title: 'FISCAL YEAR', gridcolor: theme.grid },
        yaxis: { title: 'LAUNCH VOLUME', gridcolor: theme.grid },
        margin: { t: 100, b: 80, l: 100, r: 50 },
        legend: { orientation: 'h', y: 1.05 },
        hovermode: 'x unified'
    };

    Plotly.newPlot(container, traces, layout, config);
}

// Viz 3 (Slide 4): GEOSPATIAL INTELLIGENCE: HISTORICAL LAUNCH FOOTPRINT (1957-2024)
function renderViz3() {
    const container = 'chart3';
    Plotly.purge(container);

    const years = Array.from({ length: 2025 - 1957 + 1 }, (_, i) => 1957 + i);
    const entities = Object.keys(store).filter(e => store[e].code);
    const frames = years.map(year => {
        const locations = [];
        const z = [];
        entities.forEach(e => {
            const d = store[e];
            let total = 0;
            for (let i = 0; i < d.years.length; i++) if (d.years[i] <= year) total += d.launches[i];
            if (total > 0) { locations.push(d.code); z.push(total); }
        });
        return { name: year.toString(), data: [{ locations, z }] };
    });

    const layout = {
        title: { text: 'GEOSPATIAL INTELLIGENCE: HISTORICAL LAUNCH FOOTPRINT (1957-2024)', font: { size: theme.titleSize, color: '#fff', family: 'Orbitron' } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        geo: {
            bgcolor: 'rgba(0,0,0,0)', showframe: false,
            projection: { type: 'natural earth', scale: 1.2 },
            landcolor: '#1a1a1a', coastlinecolor: '#444',
            showocean: true, oceancolor: '#0b0d17',
            center: { lat: 20, lon: 0 }
        },
        sliders: [{
            currentvalue: { prefix: 'TIMELINE: ', font: { size: 24, color: theme.accent, family: 'Orbitron' } },
            steps: frames.map(f => ({
                method: 'animate',
                args: [[f.name], { mode: 'immediate', frame: { duration: 100, redraw: true }, transition: { duration: 50 } }],
                label: f.name
            })),
            font: { color: '#fff', size: 14 },
            pad: { t: 50, b: 50 },
            len: 0.9, x: 0.05
        }],
        margin: { t: 100, b: 0, l: 0, r: 0 }
    };

    const initialData = [{
        type: 'choropleth', locations: frames[0].data[0].locations, z: frames[0].data[0].z,
        colorscale: 'Viridis', zmin: 0, zmax: 2000,
        marker: { line: { color: '#000', width: 0.5 } },
        colorbar: { title: 'CUMULATIVE', thickness: 20, x: 0.95, len: 0.6 }
    }];

    Plotly.newPlot(container, initialData, layout, config).then(() => {
        Plotly.addFrames(container, frames);
        setTimeout(() => {
            Plotly.animate(container, null, { frame: { duration: 100, redraw: true }, fromcurrent: true, transition: { duration: 50 } });
        }, 1000);
    });
}

// Viz 4 (Slide 5): GLOBAL PARTICIPATION: THE DEMOCRATIZATION OF OUTER SPACE (PIE)
function renderViz4() {
    const container = 'chart4';
    Plotly.purge(container);

    // Logic: Count nations with at least 1 launch
    const entities = Object.keys(store).filter(e => e !== 'World' && store[e].total > 0);
    const spaceFaring = entities.length;
    const totalNations = 195; // Standard baseline
    const nonSpaceFaring = totalNations - spaceFaring;

    const data = [{
        values: [spaceFaring, nonSpaceFaring],
        labels: ['SPACE-FARING NATIONS', 'NON-SPACE-FARING'],
        type: 'pie',
        hole: 0.5,
        marker: { colors: [theme.accent, '#222'] },
        textinfo: 'value+percent',
        insidetextfont: { color: '#fff', size: 28, weight: 'bold' },
        hoverinfo: 'label+value+percent'
    }];

    const layout = {
        title: { text: 'GLOBAL PARTICIPATION: THE DEMOCRATIZATION OF OUTER SPACE', font: { size: theme.titleSize, color: '#fff', family: 'Orbitron' } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#fff' },
        showlegend: true,
        legend: { orientation: 'h', y: -0.1, font: { size: 20 } },
        annotations: [
            { text: `${Math.round((spaceFaring / totalNations) * 100)}%`, x: 0.5, y: 0.5, font: { size: 60, color: theme.accent, weight: 'bold' }, showarrow: false },
            { text: 'GLOBAL ACCESS', x: 0.5, y: 0.35, font: { size: 16, color: '#888' }, showarrow: false }
        ],
        margin: { t: 120, b: 120, l: 50, r: 50 }
    };

    Plotly.newPlot(container, data, layout, config);
}

// Viz 5 (Slide 6): HIERARCHICAL ANALYSIS: TOP 25 ACTIVE SPACE NATIONS (2024 UPDATE)
function renderViz5() {
    const container = 'chart5';
    Plotly.purge(container);

    const year = 2023;
    const ranking = [];
    Object.keys(store).forEach(e => {
        if (e === 'World') return;
        const idx = store[e].years.indexOf(year);
        const val = idx !== -1 ? store[e].launches[idx] : 0;
        if (val > 0) ranking.push({ e, val });
    });
    ranking.sort((a, b) => b.val - a.val);
    const topN = ranking.slice(0, 25);

    const data = [{
        type: 'treemap',
        labels: topN.map(i => i.e.toUpperCase()),
        parents: topN.map(() => "ORBITAL HIERARCHY"),
        values: topN.map(i => i.val),
        textinfo: "label+value",
        marker: {
            colors: topN.map(i => i.e === 'United States' ? theme.accent : i.e === 'China' ? '#ffe600' : i.e === 'Russia' ? theme.secondary : '#444'),
            line: { width: 2, color: '#111' }
        },
        pathbar: { visible: true, thickness: 35, textfont: { size: 18 } }
    }];

    // Add root node
    data[0].labels.unshift("ORBITAL HIERARCHY");
    data[0].parents.unshift("");
    data[0].values.unshift(topN.reduce((a, b) => a + b.val, 0));

    const layout = {
        title: { text: 'HIERARCHICAL ANALYSIS: TOP 25 ACTIVE SPACE NATIONS (2024 UPDATE)', font: { size: theme.titleSize, color: theme.accent, family: 'Orbitron' } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#fff' },
        margin: { t: 100, l: 20, r: 20, b: 20 }
    };

    Plotly.newPlot(container, data, layout, config);
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof rawData !== 'undefined') store = processData(rawData);
});
