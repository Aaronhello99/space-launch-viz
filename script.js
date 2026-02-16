// script.js — Formal Analytical Dashboard Edition

// -- 0. Global Setup --
const config = {
    responsive: true,
    displayModeBar: true,
    scrollZoom: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines'],
    displaylogo: false,
    modeBarStyle: { bgcolor: 'rgba(0,0,0,0.4)' }
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
            hovertemplate: `<b>${e}</b><br>Year: <b>%{x}</b><br>Launches: <b>%{y}</b><extra></extra>`
        };
    }).filter(t => t);

    const layout = {
        title: {
            text: 'Annual Objects Launched Into Outer Space (1957–2025)',
            font: { size: theme.titleSize, color: '#fff', family: 'Orbitron, sans-serif' },
            y: 0.96, x: 0.5, xanchor: 'center'
        },
        paper_bgcolor: theme.bg, plot_bgcolor: theme.bg,
        font: { color: theme.font, family: 'Roboto, sans-serif', size: 14 },
        xaxis: {
            title: { text: 'Year', font: { size: theme.axisSize } },
            gridcolor: theme.grid, tickfont: { size: 13 }, linecolor: '#555',
            range: [1957, 2025]
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
            marker: { color: m === 'United States' ? theme.accent : m === 'Russia' ? theme.secondary : theme.gold },
            hovertemplate: `<b>${m}</b>: <b>%{y}</b><extra></extra>`
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
    traces.push({
        x: years, y: othersData, name: 'Rest of World', type: 'bar', marker: { color: '#555' },
        hovertemplate: '<b>Rest of World</b>: <b>%{y}</b><extra></extra>'
    });

    const layout = {
        title: {
            text: 'Cumulative Launch Volume by Major Spacefaring Nations (1957–2025)',
            font: { size: theme.titleSize, color: '#fff', family: 'Orbitron, sans-serif' },
            y: 0.96, x: 0.5, xanchor: 'center'
        },
        barmode: 'stack',
        paper_bgcolor: theme.bg, plot_bgcolor: theme.bg,
        font: { color: theme.font, family: 'Roboto, sans-serif', size: 14 },
        xaxis: {
            title: { text: 'Year', font: { size: theme.axisSize } },
            gridcolor: theme.grid, tickfont: { size: 13 }, linecolor: '#555',
            range: [1957, 2025]
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
            text: 'Global Distribution of Space Launch Activity (1957–2025)',
            font: { size: theme.titleSize, color: '#fff', family: 'Orbitron, sans-serif' },
            y: 0.98, x: 0.5, xanchor: 'center'
        },
        paper_bgcolor: theme.bg,
        geo: {
            bgcolor: 'rgba(0,0,0,0)',
            showframe: false,
            projection: { type: 'natural earth', scale: 1.05 },
            landcolor: '#1a1a2e', coastlinecolor: '#555',
            showocean: true, oceancolor: '#0b0d17',
            showlakes: false,
            showcountries: true, countrycolor: '#333',
            center: { lat: 20, lon: 0 },
            lataxis: { range: [-60, 85] },
            lonaxis: { range: [-180, 180] }
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
        margin: { t: 60, b: 10, l: 10, r: 10 }
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
// VIZ 4 (Slide 5): Pie Chart — National Share of Orbital Objects
// ============================================================
function renderViz4() {
    const container = 'chart4';
    Plotly.purge(container);

    // Aggregate total launches by country (exclude World and non-country entities)
    const countryData = [];
    Object.keys(store).forEach(entity => {
        if (entity === 'World') return;
        if (!store[entity].code) return;
        if (store[entity].total > 0) {
            countryData.push({ name: entity, total: store[entity].total });
        }
    });

    countryData.sort((a, b) => b.total - a.total);

    const top = countryData.slice(0, 10);
    const rest = countryData.slice(10);
    const restTotal = rest.reduce((sum, c) => sum + c.total, 0);

    const labels = top.map(c => c.name);
    const values = top.map(c => c.total);
    if (restTotal > 0) {
        labels.push('Other (' + rest.length + ')');
        values.push(restTotal);
    }

    const grandTotal = values.reduce((a, b) => a + b, 0);

    const colors = [
        theme.accent, theme.secondary, theme.gold,
        '#ff9800', '#4caf50', '#9c27b0', '#e91e63',
        '#03a9f4', '#8bc34a', '#ff5722', '#607d8b'
    ];

    const data = [{
        values: values,
        labels: labels,
        type: 'pie',
        hole: 0.35,
        marker: {
            colors: colors,
            line: { color: '#0b0d17', width: 2 }
        },
        textinfo: 'label+percent',
        textposition: 'inside',
        insidetextorientation: 'radial',
        textfont: { size: 14, color: '#ffffff', family: 'Roboto, sans-serif' },
        hovertemplate: '<b>%{label}</b><br>Total Objects Launched: %{value:,}<br>Global Share: %{percent}<extra></extra>',
        pull: [0.02, 0.02, 0.02, 0, 0, 0, 0, 0, 0, 0, 0],
        sort: false
    }];

    const layout = {
        title: {
            text: 'National Share of All Objects Launched Into Orbit',
            font: { size: theme.titleSize, color: '#fff', family: 'Orbitron, sans-serif' },
            y: 0.97, x: 0.5, xanchor: 'center'
        },
        paper_bgcolor: theme.bg,
        font: { color: theme.font, family: 'Roboto, sans-serif' },
        showlegend: false,
        annotations: [{
            text: `<b>${grandTotal.toLocaleString()}</b><br><span style="font-size:16px;color:#888">Total Objects</span>`,
            x: 0.5, y: 0.5,
            font: { size: 42, color: theme.accent, family: 'Orbitron, sans-serif' },
            showarrow: false
        }],
        margin: { t: 70, b: 20, l: 20, r: 20 }
    };

    Plotly.newPlot(container, data, layout, config);
}

// ============================================================
// VIZ 5 (Slide 6): Horizontal Bar — Top 15 Nations by Cumulative Launches
// ============================================================
function renderViz5() {
    const container = 'chart5';
    Plotly.purge(container);

    // Aggregate all-time totals per country
    const ranking = [];
    Object.keys(store).forEach(e => {
        if (e === 'World') return;
        if (!store[e].code) return;
        if (store[e].total > 0) ranking.push({ name: e, total: store[e].total });
    });
    ranking.sort((a, b) => a.total - b.total); // ascending for horizontal bar
    const topN = ranking.slice(-15); // top 15

    const colorMap = {
        'United States': theme.accent,
        'China': theme.gold,
        'Russia': theme.secondary,
        'United Kingdom': '#4caf50',
        'Japan': '#03a9f4',
        'India': theme.orange,
        'France': '#9c27b0',
        'Germany': '#03a9f4',
        'Canada': '#ff5722'
    };

    const data = [{
        type: 'bar',
        orientation: 'h',
        y: topN.map(i => i.name),
        x: topN.map(i => i.total),
        text: topN.map(i => i.total.toLocaleString()),
        textposition: 'outside',
        textfont: { size: 13, color: '#e0e6ed', family: 'Roboto, sans-serif' },
        marker: {
            color: topN.map(i => colorMap[i.name] || '#546e7a'),
            line: { width: 0.5, color: '#222' }
        },
        hovertemplate: '<b>%{y}</b><br>Total Objects Launched: %{x:,}<extra></extra>'
    }];

    const layout = {
        title: {
            text: 'Cumulative Space Objects Launched by Nation (All Time)',
            font: { size: theme.titleSize, color: '#fff', family: 'Orbitron, sans-serif' },
            y: 0.97, x: 0.5, xanchor: 'center'
        },
        paper_bgcolor: theme.bg,
        plot_bgcolor: theme.bg,
        font: { color: '#ccc', family: 'Roboto, sans-serif', size: 13 },
        xaxis: {
            title: { text: 'Total Objects Launched', font: { size: theme.axisSize, color: '#aaa' } },
            gridcolor: theme.grid, tickfont: { size: 12 }, linecolor: '#555'
        },
        yaxis: {
            tickfont: { size: 13 }, linecolor: '#555', automargin: true
        },
        margin: { t: 70, b: 60, l: 140, r: 60 },
        bargap: 0.25
    };

    Plotly.newPlot(container, data, layout, config);
}

// -- Init --
document.addEventListener('DOMContentLoaded', () => {
    if (typeof rawData !== 'undefined') store = processData(rawData);
});
