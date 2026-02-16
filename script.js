// script.js - Final Verified Business Edition (Round 22 - Treemap Frame Fix)

// -- 0. Global Setup --
const config = {
    responsive: true,
    displayModeBar: false,
    scrollZoom: false
};

const theme = {
    font: '#fff',
    fontSize: 16,
    titleSize: 22,
    axisSize: 14,
    grid: 'rgba(255,255,255,0.1)',
    bg: 'rgba(0,0,0,0)',
    tooltipBg: '#0b0d17',
    tooltipText: '#ffffff'
};

// -- 1. Data Store --
let store = {}; // Populated from rawData

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

    // Sort arrays
    for (const entity in processed) {
        const combined = processed[entity].years.map((y, i) => ({ y: y, l: processed[entity].launches[i] }));
        combined.sort((a, b) => a.y - b.y);
        processed[entity].years = combined.map(c => c.y);
        processed[entity].launches = combined.map(c => c.l);
    }
    return processed;
}

// -- 2. Central Controller (Called by alien.js) --
window.addEventListener('resize', () => {
    const containers = ['chart1', 'chart2', 'chart3', 'chart4', 'chart5'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.innerHTML !== "") {
            Plotly.Plots.resize(el);
        }
    });
});

window.onSlideChange = function (index) {
    console.log(`[Script] Slide ${index} Activation`);

    // SYNC CINEMATICS (Rocket/Astronaut visibility)
    if (window.updateCinematicState) {
        window.updateCinematicState(index);
    }

    // Trigger specific render logic
    setTimeout(() => {
        switch (index) {
            case 1: renderViz1(); break;
            case 2: renderViz2(); break;
            case 3: renderViz3(); break;
            case 4: renderViz4(); break;
            case 5: renderViz5(); break;
        }
    }, 100); // Tiny delay to ensure DOM is ready
};

// -- 3. Visualizations --

// Viz 1: The Exponential Frontier (Interactive Line Chart)
function renderViz1() {
    const container = 'chart1';
    Plotly.purge(container); // Clean slate

    const entities = ['United States', 'Russia', 'China', 'United Kingdom', 'India', 'World'];
    const colors = { 'United States': '#00f2ff', 'Russia': '#ff0055', 'China': '#ffe600', 'United Kingdom': '#00ff44', 'India': '#ff9900', 'World': '#ffffff' };

    const traces = entities.map(entity => {
        const data = store[entity];
        if (!data) return null;
        return {
            x: data.years,
            y: data.launches,
            type: 'scatter',
            mode: 'lines+markers',
            name: entity,
            line: { color: colors[entity] || '#888', width: entity === 'World' ? 4 : 2 },
            marker: { size: 4 },
            hovertemplate: '<b>%{data.name}</b><br>Year: %{x}<br>Launches: %{y}<extra></extra>'
        };
    }).filter(t => t);

    // Animation: Reveal traces
    const layout = {
        title: '',
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: theme.font, family: 'Roboto' },
        xaxis: { title: { text: 'Year', font: { size: theme.axisSize + 2 } }, gridcolor: theme.grid, range: [1957, 2025], tickfont: { size: theme.axisSize } },
        yaxis: { title: { text: 'Annual Launches', font: { size: theme.axisSize + 2 } }, gridcolor: theme.grid, tickfont: { size: theme.axisSize } },
        hovermode: 'closest',
        hoverlabel: { bgcolor: theme.tooltipBg, font: { color: theme.tooltipText, size: 16 }, bordercolor: '#333' },
        legend: { orientation: 'h', y: 1.15, font: { size: 14 } },
        margin: { t: 40, r: 30, b: 60, l: 80 }
    };

    Plotly.newPlot(container, traces, layout, { ...config, scrollZoom: true });
}

// Viz 2: Annual Launches by Power (Stacked Bar)
function renderViz2() {
    // UPDATED: Business Dashboard Stacked Bar
    const container = 'chart2';
    Plotly.purge(container);

    const years = store['World'].years;
    const entities = ['United States', 'Russia', 'China', 'Others'];

    // Prepare Data Traces
    const traces = entities.map(e => {
        let yData;
        if (e === 'Others') {
            // Calculate Others (World - Sum of majors)
            const us = store['United States'];
            const ru = store['Russia'];
            const ch = store['China'];
            const world = store['World'];

            yData = world.years.map((year, i) => {
                const uVal = (us.years.indexOf(year) !== -1) ? us.launches[us.years.indexOf(year)] : 0;
                const rVal = (ru.years.indexOf(year) !== -1) ? ru.launches[ru.years.indexOf(year)] : 0;
                const cVal = (ch.years.indexOf(year) !== -1) ? ch.launches[ch.years.indexOf(year)] : 0;
                const wVal = world.launches[i];
                return Math.max(0, wVal - (uVal + rVal + cVal));
            });
        } else {
            const d = store[e];
            if (!d) return null;
            // Align to World Years
            const worldYears = store['World'].years;
            yData = worldYears.map(year => {
                const idx = d.years.indexOf(year);
                return idx !== -1 ? d.launches[idx] : 0;
            });
        }

        return {
            x: years,
            y: yData,
            name: e,
            type: 'bar',
            marker: {
                color: e === 'United States' ? '#00f2ff' : e === 'Russia' ? '#ff0055' : e === 'China' ? '#ffe600' : '#444'
            },
            hovertemplate: '<b>%{data.name}</b><br>Year: %{x}<br>Launches: %{y}<extra></extra>'
        };
    }).filter(t => t);

    const layout = {
        title: 'Annual Launches by Major Powers',
        barmode: 'stack',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: theme.font, family: 'Roboto' },
        xaxis: { title: { text: 'Year', font: { size: theme.axisSize + 2 } }, gridcolor: theme.grid, range: [1957, 2025], tickfont: { size: theme.axisSize } },
        yaxis: { title: { text: 'Launches', font: { size: theme.axisSize + 2 } }, gridcolor: theme.grid, tickfont: { size: theme.axisSize } },
        legend: { orientation: 'h', y: 1.15, font: { size: 14 } },
        hovermode: 'x unified',
        hoverlabel: { bgcolor: theme.tooltipBg, font: { color: theme.tooltipText, size: 16 }, bordercolor: '#333' },
        margin: { l: 80, r: 30, t: 40, b: 60 }
    };

    Plotly.newPlot(container, traces, layout, config);
}

function animateViz2() {
    renderViz2();
}

// Viz 3: Global Map (Animated Time-Lapse)
function renderViz3() {
    const container = 'chart3';
    Plotly.purge(container);

    const years = Array.from({ length: 2025 - 1957 + 1 }, (_, i) => 1957 + i);
    const frames = [];
    const entities = Object.keys(store).filter(e => store[e].code);

    years.forEach(year => {
        const locations = [];
        const z = [];
        const text = [];
        entities.forEach(e => {
            const data = store[e];
            let total = 0;
            // Cumulative up to this year for "Spread" effect
            for (let i = 0; i < data.years.length; i++) if (data.years[i] <= year) total += data.launches[i];

            if (total > 0) {
                locations.push(data.code);
                z.push(total);
                text.push(e);
            }
        });
        frames.push({
            name: year.toString(),
            data: [{ locations, z, text }]
        });
    });

    const layout = {
        title: 'Global Launch Footprint (Time-Lapse)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        geo: {
            bgcolor: 'rgba(0,0,0,0)', showframe: false,
            projection: { type: 'natural earth' },
            landcolor: '#1a1a1a', coastlinecolor: '#444',
            showocean: true, oceancolor: '#0b0d17'
        },
        font: { color: '#fff' },
        sliders: [{
            currentvalue: { prefix: 'Year: ', font: { size: 20 } },
            steps: frames.map(f => ({
                method: 'animate',
                args: [[f.name], { mode: 'immediate', frame: { duration: 200, redraw: true }, transition: { duration: 100 } }],
                label: f.name
            })),
            font: { color: '#fff' },
            pad: { t: 50 }
        }],
        margin: { t: 50, b: 0, l: 0, r: 0 }
    };

    const initialData = [{
        type: 'choropleth', locations: frames[0].data[0].locations, z: frames[0].data[0].z,
        colorscale: 'Plasma', zmin: 0, zmax: 2000,
        marker: { line: { color: '#000', width: 0.5 } },
        colorbar: { title: 'Total', thickness: 10 }
    }];

    Plotly.newPlot(container, initialData, layout, config).then(() => {
        Plotly.addFrames(container, frames);
        setTimeout(() => {
            Plotly.animate(container, null, {
                frame: { duration: 200, redraw: true },
                fromcurrent: true,
                transition: { duration: 100 }
            });
        }, 1000);
    });
}
function animateViz3() {
}

// Viz 4: Market Share (Donut Charts - 1980 vs 2024)
function renderViz4() {
    const container = 'chart4';
    Plotly.purge(container);

    function getDataForYear(year) {
        let us = 0, ru = 0, ch = 0, other = 0;
        Object.keys(store).forEach(e => {
            if (e === 'World') return;
            const d = store[e];
            const idx = d.years.indexOf(year);
            const val = idx !== -1 ? d.launches[idx] : 0;

            if (e === 'United States') us += val;
            else if (e === 'Russia' || e === 'Soviet Union') ru += val;
            else if (e === 'China') ch += val;
            else other += val;
        });
        return { values: [us, ru, ch, other], labels: ['USA', 'Russia', 'China', 'Others'] };
    }

    const d1980 = getDataForYear(1980);
    const d2024 = getDataForYear(2023);

    const colors = ['#00f2ff', '#ff0055', '#ffe600', '#888'];

    const data = [
        {
            type: 'pie', hole: 0.6,
            values: d1980.values, labels: d1980.labels,
            marker: { colors: colors },
            domain: { column: 0 },
            name: '1980', hoverinfo: 'label+percent+name',
            textinfo: 'label+percent', textposition: 'inside',
            insidetextfont: { color: 'white' }
        },
        {
            type: 'pie', hole: 0.6,
            values: d2024.values, labels: d2024.labels,
            marker: { colors: colors },
            domain: { column: 1 },
            name: '2024', hoverinfo: 'label+percent+name',
            textinfo: 'label+percent', textposition: 'inside',
            insidetextfont: { color: 'white' }
        }
    ];

    const layout = {
        title: 'Market Share Shift: 1980 vs 2023',
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#fff' },
        grid: { rows: 1, columns: 2 },
        showlegend: true,
        legend: { orientation: 'h', y: -0.15, font: { size: 14 } },
        annotations: [
            { text: '1980', x: 0.22, y: 0.5, font: { size: 24, color: '#fff' }, showarrow: false },
            { text: '2023', x: 0.78, y: 0.5, font: { size: 24, color: '#fff' }, showarrow: false }
        ]
    };

    Plotly.newPlot(container, data, layout, config);
}

// Viz 5: 2024 Hierarchy (TREEMAP - WITH VISIBLE FRAME & HEADER)
function renderViz5() {
    const container = 'chart5';
    Plotly.purge(container);

    const year = 2023;

    // Root Label & Color Setup
    const rootLabel = "Global Space Launches";
    const labels = [rootLabel];
    const parents = [""];
    const text = ["Total"];

    let total = 0;
    const ranking = [];

    // 1. Collect Data
    Object.keys(store).forEach(e => {
        if (e === 'World') return;
        const d = store[e];
        const idx = d.years.indexOf(year);
        const val = idx !== -1 ? d.launches[idx] : 0;
        if (val > 0) ranking.push({ e, val });
    });

    // 2. Filter Top 25
    ranking.sort((a, b) => b.val - a.val);
    const topN = ranking.slice(0, 25);

    // 3. Populate Lists
    const values = [0]; // Placeholder for root value
    let childSum = 0;

    topN.forEach(item => {
        labels.push(item.e);
        parents.push(rootLabel);
        values.push(item.val);
        text.push(`${item.val}`);
        childSum += item.val;
    });

    // 4. Force Root Value to match Child Sum (100% Fill)
    values[0] = childSum;
    text[0] = `Total: ${childSum}`;

    const data = [{
        type: 'treemap',
        labels: labels,
        parents: parents,
        values: values,
        textinfo: "label+value+percent parent",
        textposition: "middle center",
        // Enable Padding so the Root/Parent Frame is Visible behind children
        tiling: {
            packing: "squarify",
            pad: 6 // 6px Visible Padding
        },
        marker: {
            colors: labels.map(l => {
                // Ensure Root Block is Purple
                if (l === rootLabel) return '#8c52ff';
                // Countries have specific colors
                if (l === 'United States') return '#00f2ff';
                if (l === 'China') return '#ffe600';
                if (l === 'Russia') return '#ff0055';
                return '#444'; // Others Grey
            }),
            line: { width: 1, color: '#111' }
        },
        // Enable Header/Pathbar (Title Bar for Parent)
        pathbar: {
            visible: true,
            side: 'top',
            thickness: 30, // Visible header bar height
            textfont: { size: 16, color: 'white' }
        },
        hovertemplate: '<b>%{label}</b><br>Launches: %{value}<br>Share: %{percentParent:.1%}<extra></extra>'
    }];

    const layout = {
        title: `Launch Hierarchy (Top 25 Active Nations)`,
        paper_bgcolor: 'rgba(0,0,0,0)', // BACKGROUND IS TRANSPARENT
        plot_bgcolor: 'rgba(0,0,0,0)',   // PLOT IS TRANSPARENT
        font: { color: '#fff', family: 'Roboto', size: 14 },
        margin: { t: 60, l: 10, r: 10, b: 10 },
        hoverlabel: { bgcolor: theme.tooltipBg, font: { color: theme.tooltipText, size: 16 }, bordercolor: '#333' }
    };

    Plotly.newPlot(container, data, layout, config);
}


// -- 4. Init --
document.addEventListener('DOMContentLoaded', () => {
    if (typeof rawData !== 'undefined') {
        store = processData(rawData);
    } else {
        console.error("No Raw Data");
    }
});
