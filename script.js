// script.js — Full Rewrite: Formal News Broadcast Edition

// -- 0. Global Setup --
const config = {
    responsive: true,
    displayModeBar: false,
    scrollZoom: false
};

const theme = {
    font: '#e0e6ed',
    accent: '#00f2ff',
    secondary: '#ff0055',
    gold: '#ffe600',
    orange: '#ff9900',
    titleSize: 26,
    axisSize: 15,
    grid: 'rgba(255,255,255,0.06)',
    bg: 'rgba(0,0,0,0)'
};

// -- 1. Data Store & Processing --
let store = {};

function processData(data) {
    const processed = {};
    data.forEach(row => {
        const entity = row['Entity'];
        const year = parseInt(row['Year']);
        const launches = parseInt(row['Annual number of objects launched into outer space']);
        const code = row['Code'];

        if (!processed[entity]) processed[entity] = { years: [], launches: [], code: code, total: 0 };
        processed[entity].years.push(year);
        processed[entity].launches.push(launches);
        processed[entity].total += launches;
    });

    // Sort all entities by year
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
    ['chart1', 'chart2', 'chart3', 'chart4', 'chart5'].forEach(id => {
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

// ============================================================
// VIZ 1 (Slide 2): Line Chart — Annual Launch Trends
// ============================================================
function renderViz1() {
    const container = 'chart1';
    Plotly.purge(container);

    const entities = ['United States', 'Russia', 'China', 'India', 'World'];
    const colors = {
        'United States': theme.accent,
        'Russia': theme.secondary,
        'China': theme.gold,
        'India': theme.orange,
        'World': '#ffffff'
    };

    const traces = entities.map(e => {
        const d = store[e];
        if (!d) return null;
        return {
            x: d.years, y: d.launches,
            name: e,
            type: 'scatter', mode: 'lines',
            line: { color: colors[e], width: e === 'World' ? 4 : 2.5, shape: 'spline' },
            hovertemplate: `<b>${e}</b><br>Year: %{x}<br>Launches: %{y}<extra></extra>`
        };
    }).filter(t => t);

    const layout = {
        title: {
            text: 'Breaking Down the Numbers: Annual Objects Launched Into Orbit, 1957–2024',
            font: { size: theme.titleSize, color: '#fff', family: 'Orbitron, sans-serif' },
            y: 0.96, x: 0.5, xanchor: 'center'
        },
        paper_bgcolor: theme.bg, plot_bgcolor: theme.bg,
        font: { color: theme.font, family: 'Roboto, sans-serif', size: 14 },
        xaxis: {
            title: { text: 'Year', font: { size: theme.axisSize } },
            gridcolor: theme.grid, tickfont: { size: 13 }, linecolor: '#555'
        },
        yaxis: {
            title: { text: 'Annual Objects Deployed', font: { size: theme.axisSize } },
            gridcolor: theme.grid, tickfont: { size: 13 }, linecolor: '#555'
        },
        margin: { t: 90, b: 70, l: 80, r: 40 },
        legend: { orientation: 'h', y: 1.08, x: 0.5, xanchor: 'center', font: { size: 14 } },
        hovermode: 'x unified'
    };

    Plotly.newPlot(container, traces, layout, config);
}

// ============================================================
// VIZ 2 (Slide 3): Stacked Bar — Superpower Launch Volume
// ============================================================
function renderViz2() {
    const container = 'chart2';
    Plotly.purge(container);

    const majors = ['United States', 'Russia', 'China'];
    const world = store['World'];
    if (!world) return;
    const years = world.years;

    const traces = majors.map(m => {
        const d = store[m];
        if (!d) return null;
        const yData = years.map(y => {
            const idx = d.years.indexOf(y);
            return idx !== -1 ? d.launches[idx] : 0;
        });
        return {
            x: years, y: yData, name: m, type: 'bar',
            marker: { color: m === 'United States' ? theme.accent : m === 'Russia' ? theme.secondary : theme.gold }
        };
    }).filter(t => t);

    // Calculate 'Others'
    const othersData = years.map((y, i) => {
        let sum = 0;
        majors.forEach(m => {
            const d = store[m];
            if (!d) return;
            const idx = d.years.indexOf(y);
            sum += idx !== -1 ? d.launches[idx] : 0;
        });
        return Math.max(0, world.launches[i] - sum);
    });
    traces.push({ x: years, y: othersData, name: 'Rest of World', type: 'bar', marker: { color: '#555' } });

    const layout = {
        title: {
            text: 'The Space Race Continues: How the Superpowers Compare in Launch Volume',
            font: { size: theme.titleSize, color: '#fff', family: 'Orbitron, sans-serif' },
            y: 0.96, x: 0.5, xanchor: 'center'
        },
        barmode: 'stack',
        paper_bgcolor: theme.bg, plot_bgcolor: theme.bg,
        font: { color: theme.font, family: 'Roboto, sans-serif', size: 14 },
        xaxis: {
            title: { text: 'Year', font: { size: theme.axisSize } },
            gridcolor: theme.grid, tickfont: { size: 13 }, linecolor: '#555'
        },
        yaxis: {
            title: { text: 'Total Launches', font: { size: theme.axisSize } },
            gridcolor: theme.grid, tickfont: { size: 13 }, linecolor: '#555'
        },
        margin: { t: 90, b: 70, l: 80, r: 40 },
        legend: { orientation: 'h', y: 1.08, x: 0.5, xanchor: 'center', font: { size: 14 } },
        hovermode: 'x unified'
    };

    Plotly.newPlot(container, traces, layout, config);
}

// ============================================================
// VIZ 3 (Slide 4): Choropleth Map — Global Launch Footprint
// ============================================================
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
            for (let i = 0; i < d.years.length; i++) {
                if (d.years[i] <= year) total += d.launches[i];
            }
            if (total > 0) { locations.push(d.code); z.push(total); }
        });
        return { name: year.toString(), data: [{ locations, z }] };
    });

    const layout = {
        title: {
            text: 'Mapping the Final Frontier: Where the World Launches Into Space',
            font: { size: theme.titleSize, color: '#fff', family: 'Orbitron, sans-serif' },
            y: 0.98, x: 0.5, xanchor: 'center'
        },
        paper_bgcolor: theme.bg,
        geo: {
            bgcolor: 'rgba(0,0,0,0)',
            showframe: false,
            projection: { type: 'natural earth', scale: 1.3 },
            landcolor: '#1a1a2e', coastlinecolor: '#555',
            showocean: true, oceancolor: '#0b0d17',
            showlakes: false,
            showcountries: true, countrycolor: '#333',
            center: { lat: 15, lon: 10 },
            lataxis: { range: [-55, 80] },
            lonaxis: { range: [-170, 180] }
        },
        sliders: [{
            currentvalue: {
                prefix: 'Year: ',
                font: { size: 26, color: theme.accent, family: 'Orbitron, sans-serif' }
            },
            steps: frames.map(f => ({
                method: 'animate',
                args: [[f.name], { mode: 'immediate', frame: { duration: 80, redraw: true }, transition: { duration: 40 } }],
                label: f.name
            })),
            font: { color: '#ccc', size: 12 },
            pad: { t: 10, b: 10 },
            len: 0.92, x: 0.04,
            ticklen: 4
        }],
        margin: { t: 60, b: 10, l: 0, r: 0 }
    };

    const initialData = [{
        type: 'choropleth',
        locations: frames[0].data[0].locations,
        z: frames[0].data[0].z,
        colorscale: [
            [0, '#0b0d17'],
            [0.01, '#1a237e'],
            [0.05, '#0d47a1'],
            [0.15, '#00bcd4'],
            [0.4, '#ffeb3b'],
            [0.7, '#ff9800'],
            [1, '#f44336']
        ],
        zmin: 0, zmax: 2000,
        marker: { line: { color: '#222', width: 0.5 } },
        colorbar: {
            title: { text: 'Total\nLaunches', font: { size: 12, color: '#ccc' } },
            thickness: 18, len: 0.6, x: 0.97,
            tickfont: { color: '#ccc', size: 11 },
            outlinewidth: 0
        }
    }];

    Plotly.newPlot(container, initialData, layout, config).then(() => {
        Plotly.addFrames(container, frames);
        // Auto-play the timeline
        setTimeout(() => {
            Plotly.animate(container, null, {
                frame: { duration: 80, redraw: true },
                fromcurrent: true,
                transition: { duration: 40 }
            });
        }, 800);
    });
}

// ============================================================
// VIZ 4 (Slide 5): Large Pie Chart — Country Share of Launches
// ============================================================
function renderViz4() {
    const container = 'chart4';
    Plotly.purge(container);

    // Aggregate total launches by country (exclude World and non-country entities)
    const countryData = [];
    Object.keys(store).forEach(entity => {
        if (entity === 'World') return;
        if (!store[entity].code) return; // Skip orgs like ESA, NATO, etc.
        if (store[entity].total > 0) {
            countryData.push({ name: entity, total: store[entity].total });
        }
    });

    // Sort by total descending
    countryData.sort((a, b) => b.total - a.total);

    // Top 10 individually, rest grouped
    const top = countryData.slice(0, 10);
    const rest = countryData.slice(10);
    const restTotal = rest.reduce((sum, c) => sum + c.total, 0);

    const labels = top.map(c => c.name);
    const values = top.map(c => c.total);
    if (restTotal > 0) {
        labels.push('All Other Nations (' + rest.length + ')');
        values.push(restTotal);
    }

    const grandTotal = values.reduce((a, b) => a + b, 0);

    // Vibrant color palette
    const colors = [
        theme.accent,    // US
        theme.secondary, // Russia
        theme.gold,      // China
        '#ff9800',       // UK
        '#4caf50',       // Japan
        '#9c27b0',       // France
        '#e91e63',       // India
        '#03a9f4',       // Germany
        '#8bc34a',       // South Korea
        '#ff5722',       // Italy
        '#607d8b'        // Others
    ];

    const data = [{
        values: values,
        labels: labels,
        type: 'pie',
        hole: 0.45,
        marker: {
            colors: colors,
            line: { color: '#0b0d17', width: 2 }
        },
        textinfo: 'label+percent',
        textposition: 'outside',
        textfont: { size: 15, color: '#e0e6ed' },
        insidetextorientation: 'auto',
        hovertemplate: '<b>%{label}</b><br>Total Objects: %{value:,}<br>Share: %{percent}<extra></extra>',
        pull: [0.03, 0.03, 0.03, 0, 0, 0, 0, 0, 0, 0, 0],
        sort: false
    }];

    const layout = {
        title: {
            text: 'Who Owns the Skies: National Share of All Objects Ever Launched',
            font: { size: theme.titleSize, color: '#fff', family: 'Orbitron, sans-serif' },
            y: 0.97, x: 0.5, xanchor: 'center'
        },
        paper_bgcolor: theme.bg,
        font: { color: theme.font, family: 'Roboto, sans-serif' },
        showlegend: true,
        legend: {
            orientation: 'v',
            x: 0.85, y: 0.5,
            font: { size: 13, color: '#ccc' },
            bgcolor: 'rgba(0,0,0,0.3)',
            bordercolor: 'rgba(255,255,255,0.1)',
            borderwidth: 1
        },
        annotations: [{
            text: `<b>${grandTotal.toLocaleString()}</b><br><span style="font-size:14px;color:#888">Total Objects</span>`,
            x: 0.42, y: 0.5,
            font: { size: 36, color: theme.accent, family: 'Orbitron, sans-serif' },
            showarrow: false
        }],
        margin: { t: 70, b: 30, l: 30, r: 150 }
    };

    Plotly.newPlot(container, data, layout, config);
}

// ============================================================
// VIZ 5 (Slide 6): Treemap — Top 25 Active Nations (2023)
// ============================================================
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

    const topColors = {
        'United States': theme.accent,
        'China': theme.gold,
        'Russia': theme.secondary,
        'United Kingdom': '#4caf50',
        'Japan': '#03a9f4',
        'India': theme.orange,
        'France': '#9c27b0'
    };

    const data = [{
        type: 'treemap',
        labels: topN.map(i => i.e),
        parents: topN.map(() => "2023 Launch Activity"),
        values: topN.map(i => i.val),
        textinfo: "label+value",
        textfont: { size: 16 },
        marker: {
            colors: topN.map(i => topColors[i.e] || '#37474f'),
            line: { width: 2, color: '#111' }
        },
        pathbar: { visible: true, thickness: 30, textfont: { size: 16 } }
    }];

    // Add root node
    data[0].labels.unshift("2023 Launch Activity");
    data[0].parents.unshift("");
    data[0].values.unshift(topN.reduce((a, b) => a + b.val, 0));

    const layout = {
        title: {
            text: 'Inside the Data: Which Nations Dominated Space in 2023',
            font: { size: theme.titleSize, color: '#fff', family: 'Orbitron, sans-serif' },
            y: 0.97, x: 0.5, xanchor: 'center'
        },
        paper_bgcolor: theme.bg,
        font: { color: '#fff', family: 'Roboto, sans-serif' },
        margin: { t: 70, l: 10, r: 10, b: 10 }
    };

    Plotly.newPlot(container, data, layout, config);
}

// -- Init --
document.addEventListener('DOMContentLoaded', () => {
    if (typeof rawData !== 'undefined') store = processData(rawData);
});
