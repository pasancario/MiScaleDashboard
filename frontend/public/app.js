let activeMetrics = new Set(['weight', 'body_fat']); // Default active metrics
let chartInstance = null;

const metricColors = {
    weight: '#38bdf8',
    body_fat: '#f472b6',
    muscle_mass: '#f857a6',
    water_percentage: '#ff5858',
    bmi: '#00c6ff'
};

const metricLabels = {
    weight: 'Weight (kg)',
    body_fat: 'Body Fat (%)',
    muscle_mass: 'Muscle Mass (kg)',
    water_percentage: 'Body Water (%)',
    bmi: 'BMI'
};

document.addEventListener('DOMContentLoaded', async () => {
    // Set default date range to 1 year ago
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    // Format to YYYY-MM-DD for the input fields
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    document.getElementById('startDate').value = oneYearAgo.toISOString().split('T')[0];

    // Fetch users dynamically
    try {
        const usersRes = await fetch('/api/users');
        const users = await usersRes.json();
        const userSelect = document.getElementById('userSelect');
        userSelect.innerHTML = '';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            userSelect.appendChild(option);
        });
    } catch (e) {
        console.error("Failed to fetch users config", e);
    }

    initListeners();
    fetchData();
});

// Configure Chart.js defaults for dark theme
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';

async function fetchData() {
    try {
        const user = document.getElementById('userSelect').value || 'Luis';
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        let queryParams = `?user_name=${encodeURIComponent(user)}`;
        if (startDate) queryParams += `&start_date=${startDate}T00:00:00`;
        if (endDate) queryParams += `&end_date=${endDate}T23:59:59`;

        const [measurementsRes, statsRes] = await Promise.all([
            fetch(`/api/measurements${queryParams}`),
            fetch(`/api/stats?user_name=${encodeURIComponent(user)}`)
        ]);

        const stats = await statsRes.json();

        if (stats.status === "No data") {
            document.getElementById('lastSync').textContent = 'No data available for this user/range.';
            // Reset cards
            document.getElementById('latestWeight').textContent = '-- kg';
            document.getElementById('latestBodyFat').textContent = '-- %';
            document.getElementById('latestMuscleMass').textContent = '-- kg';
            document.getElementById('latestWater').textContent = '-- %';
            document.getElementById('latestBMI').textContent = '--';
            if (chartInstance) chartInstance.destroy();
            return;
        }

        updateCards(stats);

        const measurements = await measurementsRes.json();
        renderChart(measurements);

    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('lastSync').textContent = 'Error connecting to the API.';
    }
}

function updateCards(stats) {
    if (stats.latest_weight) document.getElementById('latestWeight').textContent = `${stats.latest_weight.toFixed(1)} kg`;
    if (stats.latest_body_fat) document.getElementById('latestBodyFat').textContent = `${stats.latest_body_fat.toFixed(1)} %`;
    if (stats.latest_muscle_mass) document.getElementById('latestMuscleMass').textContent = `${stats.latest_muscle_mass.toFixed(1)} kg`;
    if (stats.latest_water) document.getElementById('latestWater').textContent = `${stats.latest_water.toFixed(1)} %`;
    if (stats.latest_bmi) document.getElementById('latestBMI').textContent = stats.latest_bmi.toFixed(1);

    if (stats.last_updated) {
        const date = new Date(stats.last_updated);
        document.getElementById('lastSync').textContent = `Last Synced: ${date.toLocaleString()}`;
    }
}

function renderChart(data) {
    const ctx = document.getElementById('weightChart').getContext('2d');

    // Sort chronologically for chart
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedData.map(m => new Date(m.timestamp).toLocaleDateString());

    const datasets = Array.from(activeMetrics).map((metric, index) => {
        const isGradient = metric === 'weight';
        let bgStyle = metricColors[metric] + '33';

        if (isGradient) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, `${metricColors[metric]}80`);
            gradient.addColorStop(1, `${metricColors[metric]}00`);
            bgStyle = gradient;
        }

        return {
            label: metricLabels[metric],
            data: sortedData.map(m => m[metric]),
            borderColor: metricColors[metric],
            backgroundColor: bgStyle,
            borderWidth: index === 0 ? 3 : 2,
            borderDash: index === 0 ? [] : [5, 5],
            tension: 0.4,
            spanGaps: true, // Interpolate missing data points
            fill: isGradient ? true : false,
            pointBackgroundColor: '#0f172a',
            pointBorderColor: metricColors[metric],
            pointBorderWidth: 2,
            pointRadius: isGradient ? 4 : 0,
            pointHoverRadius: 6,
            yAxisID: metric === 'weight' ? 'y' : 'y1'
        };
    });

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { boxWidth: 12, usePointStyle: true }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Weight (kg)' },
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Other Metrics' },
                    grid: { drawOnChartArea: false },
                },
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });

    // Update active UI classes on the cards
    document.querySelectorAll('.metric-card').forEach(card => {
        if (activeMetrics.has(card.dataset.metric)) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function initListeners() {
    document.getElementById('userSelect').addEventListener('change', fetchData);

    // Custom date pickers remove active style from preset buttons
    const unselectPresets = () => {
        document.getElementById('btn1Year').classList.remove('active');
        document.getElementById('btnAllTime').classList.remove('active');
        fetchData();
    };

    document.getElementById('startDate').addEventListener('change', unselectPresets);
    document.getElementById('endDate').addEventListener('change', unselectPresets);

    // Preset Buttons
    document.getElementById('btn1Year').addEventListener('click', (e) => {
        e.target.classList.add('active');
        document.getElementById('btnAllTime').classList.remove('active');

        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

        document.getElementById('endDate').value = today.toISOString().split('T')[0];
        document.getElementById('startDate').value = oneYearAgo.toISOString().split('T')[0];

        fetchData();
    });

    document.getElementById('btnAllTime').addEventListener('click', (e) => {
        e.target.classList.add('active');
        document.getElementById('btn1Year').classList.remove('active');

        // Clear inputs for all time logic handled by backend missing params
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';

        fetchData();
    });

    document.querySelectorAll('.metric-card').forEach(card => {
        card.addEventListener('click', () => {
            const metric = card.dataset.metric;
            if (activeMetrics.has(metric)) {
                // Keep at least one metric active
                if (activeMetrics.size > 1) {
                    activeMetrics.delete(metric);
                }
            } else {
                activeMetrics.add(metric);
            }
            // Trigger chart re-render using existing data by just calling fetch again
            // Or ideally store data globally, but fetch is fast locally.
            fetchData();
        });
    });
}
