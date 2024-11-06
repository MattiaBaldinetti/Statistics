let graphCanvas3 = null; 
let graphHistogram_3 = null; 
let graphFinalHistogram_3 = null; 

function create_LinesData(m, n, lambda, _numberBreakPoint) {
    const datasets = []; 

    for (let i = 0; i < m; i++) {
        let currentValue = 0; 
        const currentData = []; 

        for (let j = 0; j < n; j++) {
            if (Math.random() <= lambda / n ) { 
                currentValue++; 
            } 
            currentData.push(currentValue);  
        }
        
        datasets.push({
            label: `Hacker ${i + 1}`, 
            data: currentData, 
            fill: false, 
            borderWidth: 2, 
            borderColor: (ctx) => { 
                return `hsl(${240 + i * 75}, 100%, 50%)`;
            }
        });
    }

    return datasets;  
}


function create_HistogramData(datasets, numberBreakPoint) {
    const resultsBars = datasets.map(dataset => {
        return dataset.data[numberBreakPoint-1] || 0; 
    });
    
    const backgroundColors = datasets.map((dataset, i) => {
        return `hsl(${240 + i * 75}, 100%, 50%)`; 
    });

    const curveData = resultsBars.map((value, index) => ({
        x: index + 0.5, 
        y: value
    }));

    return { 
        labels: datasets.map(dataset => dataset.label),
        data: resultsBars,
        backgroundColors: backgroundColors,
        curveData: curveData
    };
}


function create_FinalHistogramData(datasets) {
    const finalResultsBars = datasets.map(dataset => {
        const finalValue = dataset.data[dataset.data.length - 1] || 0;
        return finalValue; 
    });

    const backgroundColors = datasets.map((dataset, i) => {
        return `hsl(${240 + i * 75}, 100%, 50%)`; 
    });
    

    return { 
        labels: datasets.map(dataset => dataset.label),
        data: finalResultsBars,
        backgroundColors: backgroundColors 
    };
}


function create_Graph() {
    const numberHackers = sessionStorage.getItem('numberHackers');
    const numberServers = sessionStorage.getItem('numberServers');
    const numberLambda = sessionStorage.getItem('numberLambda');
    const numberBreakPoint = sessionStorage.getItem('numberBreakPoint');
    
    const datasets = create_LinesData(numberHackers, numberServers, numberLambda, numberBreakPoint);


    if (graphCanvas3 !== null) {
        graphCanvas3.destroy();
    }

    const contextLines = document.getElementById('graphCanvas3').getContext('2d'); 
    graphCanvas3 = new Chart(contextLines, {
        type: 'line', 
        data: {
            labels: Array.from({ length: numberServers }, (__, i) => `${i + 1}`), 
            datasets: datasets.map(dataset => ({
                ...dataset,
                borderWidth: 1.0,
            }))
        },
        options: {
            responsive: true, 
            elements: {
                point: {
                    radius: 0
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Number of Servers' }, 
                    grid: {
                        color: '#e0e0e0'    
                    },
                    ticks: {
                        stepSize: 1 
                    }
                },
                y: {
                    title: { display: true, text: 'Number of Success / Failures' },
                    min: 0,  
                    max: numberServers,  
                    ticks: {
                        stepSize: 1,  
                    },
                    grid: {
                        color: '#e0e0e0', 
                    }
                }
            },
            plugins: {
                legend: {   
                    display: false
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',  
                            yMin: -numberServers, 
                            yMax: numberServers, 
                            xMin: numberBreakPoint - 1, 
                            xMax: numberBreakPoint - 1, 
                            borderColor: 'black', 
                            borderWidth: 2, 
                            label: {
                                enabled: false, 
                            },
                        }
                    }
                }
            }
        }
    });


    if (graphHistogram_3 !== null) {
        graphHistogram_3.destroy();
    }

    const contextHistogram = document.getElementById('graphHistogram_3').getContext('2d');
    const dataHistogram = create_HistogramData(datasets, numberBreakPoint);
    
    graphHistogram_3 = new Chart(contextHistogram, {
        type: 'bar',
        data: {
            labels: dataHistogram.labels,
            datasets: [
                {
                    label: 'Servers Penetrated',
                    data: dataHistogram.data,
                    backgroundColor: dataHistogram.backgroundColors,
                    borderColor: dataHistogram.backgroundColors.map(color => color.replace('0.6', '1')), 
                    borderWidth: 1,
                    order: 1
                },
                {
                    label: 'Curved Line',
                    data: dataHistogram.data,   
                    type: 'line',
                    fill: false,
                    borderColor: 'black', 
                    borderWidth: 2,
                    tension: 0.2,  
                    order: 0,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true, 
            plugins: {  
                legend: {
                    display: true,
                    onClick: (event, legendItem) => {
                    const index = legendItem.datasetIndex; 
                    const dataset = graphHistogram_3.data.datasets[index]; 

                    dataset.hidden = !dataset.hidden;

                    graphHistogram_3.update();
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Hacker' }, 
                    grid: {
                        color: '#e0e0e0' 
                    }
                },
                y: {
                    min: 0, 
                    max: numberBreakPoint, 
                    ticks: {
                        stepSize: 1,  
                    },
                    grid: {
                        color: '#e0e0e0', 
                    }
                },
            }
        }
    });

    const sum = dataHistogram.data.reduce((a, b) => a + b, 0);
    const average = sum / dataHistogram.data.length;
    const variance = dataHistogram.data.reduce((acc, value) => acc + Math.pow(value - average, 2), 0) / dataHistogram.data.length;
    const standardDeviation = Math.sqrt(variance);

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <p style="margin-bottom: 10px;"><strong>Mean</strong> of the histogram values: ${average.toFixed(2)}</p>
        <p style="margin-bottom: 10px;"><strong>Variance</strong> of the histogram values: ${variance.toFixed(2)}</p>
        <p><strong>Standard deviation</strong> of the histogram values: ${standardDeviation.toFixed(2)}</p>`;


    // creation of the final histogram
    if (graphFinalHistogram_3 !== null) {
        graphFinalHistogram_3.destroy();
    }

    const contextFinalHistogram = document.getElementById('graphFinalHistogram_3').getContext('2d');
    const finalDataHistogram = create_FinalHistogramData(datasets);

    graphFinalHistogram_3 = new Chart(contextFinalHistogram, {
        type: 'bar',
        data: {
            labels: finalDataHistogram.labels,
            datasets: [
                {
                    label: 'Final Servers Penetrated',
                    data: finalDataHistogram.data,
                    backgroundColor: finalDataHistogram.backgroundColors,
                    borderColor: finalDataHistogram.backgroundColors.map(color => color.replace('0.6', '1')), 
                    borderWidth: 1,
                    order: 1
                },
                {
                    label: 'Curved Line',
                    data: finalDataHistogram.data,  
                    type: 'line',
                    fill: false,
                    borderColor: 'black',  
                    borderWidth: 2,
                    tension: 0.2,  
                    order: 0,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true, 
            plugins: {  
                legend: {
                    display: true,
                    onClick: (event, legendItem) => {
                        const index = legendItem.datasetIndex; 
                        const dataset = graphFinalHistogram_3.data.datasets[index]; 

                        dataset.hidden = !dataset.hidden;

                        graphFinalHistogram_3.update();
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Hacker' }, 
                    grid: {
                        color: '#e0e0e0' 
                    }
                },
                y: {
                    min: 0, 
                    max: numberServers,  
                    ticks: {
                        stepSize: 1,  
                    },
                    grid: {
                        color: '#e0e0e0', 
                    }
                },
            }
        }
    });

    const sumFinal = finalDataHistogram.data.reduce((a, b) => a + b, 0);
    const averageFinal = sumFinal / finalDataHistogram.data.length;
    const variancefinal = finalDataHistogram.data.reduce((acc, value) => acc + Math.pow(value - average, 2), 0) / finalDataHistogram.data.length;
    const standardDeviationFinal = Math.sqrt(variancefinal);


    const resultsDivFinal = document.getElementById('resultsFinals');
    resultsDivFinal.innerHTML = `
        <p style="margin-bottom: 10px;"><strong>Mean</strong> of the histogram values: ${averageFinal.toFixed(2)}</p>
        <p style="margin-bottom: 10px;"><strong>Variance</strong> of the histogram values: ${variancefinal.toFixed(2)}</p>
        <p><strong>Standard deviation</strong> of the histogram values: ${standardDeviationFinal.toFixed(2)}</p>`;

}

window.onload = create_Graph; 
