const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Liste des types de graphiques pris en charge par Chart.js
const chartTypes = [
    'line', 'bar', 'radar', 'doughnut', 'pie', 'polarArea', 'bubble', 'scatter'
];

/**
 * Génère un nombre aléatoire entre min et max.
 */
function getRandomNumber(min = 0, max = 100) {
    return Math.random() * (max - min) + min;
}

/**
 * Génère un nombre aléatoire avec possibilité de génération de pics, bruit, dérive, périodicité, etc.
 */
function generateDataPoint(prevValue = 0, options = {}) {
    const { min, max, randomSpikes, spikeChance, spikeMultiplier, noiseAmplitude, driftRate, periodicityFrequency, periodicityAmplitude, trendSlope, cyclicJumpRate, jumpAmplitude } = options;

    // prevValue = 0
    let value = prevValue// + (Math.random() * (max - min) * 0.1); // Variation douce

    // Ajouter des pics aléatoires
    if (randomSpikes && Math.random() < spikeChance) {
        value += Math.random() * spikeMultiplier * (Math.random() > 0.5 ? 1 : -1); // Créer un pic aléatoire
        console.log(value)
    }

    // Ajouter du bruit
    if (noiseAmplitude) {
        value += (Math.random() - 0.5) * noiseAmplitude; // Petite fluctuation aléatoire
        console.log(value)
    }

    // Ajouter une dérive lente
    if (driftRate) {
        value += driftRate; // Dérive lente (positif ou négatif)
    }

    // Ajouter la périodicité (cycle sinusoïdal)
    if (periodicityFrequency && periodicityAmplitude) {
        value += Math.sin(prevValue * periodicityFrequency) * periodicityAmplitude; // Vague sinusoidale
    }

    // Ajouter une tendance linéaire
    if (trendSlope) {
        value += trendSlope; // Croissance ou décroissance
    }

    // Ajouter un saut cyclique
    if (Math.random() < cyclicJumpRate) {
        value += (Math.random() * jumpAmplitude * 2) - jumpAmplitude; // Saut dans les valeurs
    }

    // S'assurer que la valeur reste dans la plage
    // if (isNaN(value)) {
    //     value = (min + max) / 2;
    // }
    return value;
}

/**
 * Génère des points `{ x, y }` pour les graphiques avec différentes options.
 * @param {number} count - Nombre de points à générer.
 * @param {number} minX - Valeur minimum pour x.
 * @param {number} maxX - Valeur maximum pour x.
 * @param {number} minY - Valeur minimum pour y.
 * @param {number} maxY - Valeur maximum pour y.
 * @param {object} options - Paramètres supplémentaires pour varier les données.
 * @returns {Array<Object>} Tableau de points `{ x, y }`.
 */
function generateRandomDataPoints(count = 10, minX = 0, maxX = 100, minY = 0, maxY = 100, options = {}) {
    const points = [];
    let prevValue = (minY + maxY) / 2; // Valeur initiale centrée

    for (let i = 0; i < count; i++) {
        const y = generateDataPoint(prevValue, options);
        points.push({
            x: getRandomNumber(minX, maxX),
            y: y < minY ? minY : y > maxY ? maxY : y, // S'assurer que les valeurs restent dans la plage
        });
        prevValue = points[points.length - 1].y;
    }

    return points;
}

/**
 * Génère un graphique avec les données aléatoires.
 * @param {Array<Object>} dataPoints - Points de données aléatoires.
 * @param {string} chartType - Type de graphique (e.g., 'line', 'bar', 'pie', etc.).
 * @param {number} width - Largeur du graphique.
 * @param {number} height - Hauteur du graphique.
 * @param {object} options - Paramètres supplémentaires (ex: `randomSpikes`, `noiseAmplitude`, etc.).
 * @returns {Promise<Buffer>} Image du graphique en format buffer.
 */
async function generateChart(dataPoints, chartType = 'line', width = 800, height = 600, options = {}) {
    if (!chartTypes.includes(chartType)) {
        throw new Error(`Type de graphique non supporté. Types disponibles : ${chartTypes.join(', ')}`);
    }

    const chartCanvas = new ChartJSNodeCanvas({ width, height });
    
    // Générer des labels pour l'axe X, par exemple de 'Point 1' à 'Point N'
    const labels = dataPoints.map((_, index) => `Point ${index + 1}`);

    const data = {
        labels, // Labels pour l'axe X
        datasets: [
            {
                label: 'Random Data',
                data: chartType === 'scatter' || chartType === 'bubble' 
                    ? dataPoints // Pour scatter ou bubble, on utilise des objets {x, y}
                    : dataPoints.map(point => point.y), // Pour line ou bar, on utilise seulement les valeurs Y
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                ],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const config = {
        type: chartType,
        data,
        options: {
            responsive: true,
            scales: chartType === 'line' || chartType === 'bar' ? {
                x: { title: { display: true, text: 'Data Points' } },
                y: { title: { display: true, text: 'Value' } },
            } : {},
        },
    };

    return await chartCanvas.renderToBuffer(config, 'image/png');
}

module.exports = {
    getRandomNumber,
    generateRandomDataPoints,
    generateChart,
};
