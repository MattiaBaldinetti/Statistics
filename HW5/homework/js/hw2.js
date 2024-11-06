let graphCanvas2 = null; 
let graphHistogram_2 = null; 
let graphFinalHistogram_2 = null; 
let graphAbsoluteFrequency_2 = null;
let graphRelativeFrequency_2 = null;

function create_LinesData(m, n, p, numberBreakPoint) {
    const datasets = []; 

    for (let i = 0; i < m; i++) {
        let currentValue = 0; 
        const currentData = []; 

        for (let j = 0; j < n; j++) {
            if (Math.random() < p) { 
                currentValue++; 
            } 
            else{
                currentValue--; 
            }
            currentData.push(currentValue);  
        }
        
        datasets.push({
            label: `Hacker ${i + 1}`, 
            data: currentData, 
            fill: false, 
            borderWidth: 2, 
            borderColor: (ctx) => { 
                return ctx.dataIndex >= numberBreakPoint ? 'rgba(0, 0, 0, 0)' : `hsl(${240 + i * 75}, 100%, 50%)`;
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


function create_AbsoluteFrequencyData(datasets) {
    let positivePenetrations = []
    let count = 0;
    for(let i = 0; i < datasets.length; i++){
        for(let j = 0; j < datasets[i].data.length; j++){
            if(datasets[i].data[j] > datasets[i].data[j-1] ){
                count++;
            }
        }
        positivePenetrations.push(count);
        count = 0;
    }
    
    const absoluteFrequency = positivePenetrations
    const backgroundColors = datasets.map((dataset, i) => {
        return `hsl(${240 + i * 75}, 100%, 50%)`; 
    });

    return {
        labels: datasets.map(dataset => dataset.label),
        data: absoluteFrequency,
        backgroundColors: backgroundColors
    };
}


function create_RelativeFrequencyData(absoluteData, numberServers) {
    const relativeFrequency = absoluteData.data.map(value => value / numberServers); 

    return {
        labels: absoluteData.labels,
        data: relativeFrequency,
        backgroundColors: absoluteData.backgroundColors
    };
}



function create_Graph() {
    const numberHackers = sessionStorage.getItem('numberHackers');
    const numberServers = sessionStorage.getItem('numberServers');
    const numberLambda = sessionStorage.getItem('numberLambda');
    const numberBreakPoint = sessionStorage.getItem('numberBreakPoint');
    
    const datasets = create_LinesData(numberHackers, numberServers, numberLambda, numberBreakPoint);


    if (graphCanvas2 !== null) {
        graphCanvas2.destroy();
    }

    const contextLines = document.getElementById('graphCanvas2').getContext('2d'); 
    graphCanvas2 = new Chart(contextLines, {
        type: 'line', 
        data: {
            labels: Array.from({ length: numberServers }, (__, i) => `Servers ${i + 1}`), 
            datasets: datasets 
        },
        options: {
            responsive: true, 
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
                    min: -numberServers,  
                    max: numberServers,  
                    ticks: {
                        stepSize: 1,  
                    },
                    grid: {
                        color: (ctx) => ctx.tick.value === 0 ? 'black' : 'rgba(200, 200, 200, 0.5)', 
                    }
                }
            },
            plugins: {
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


    if (graphAbsoluteFrequency_2 !== null) {
        graphAbsoluteFrequency_2.destroy();
    }

    const contextAbsoluteFrequency = document.getElementById('graphAbsoluteFrequency_2').getContext('2d');
    const absoluteFrequencyData = create_AbsoluteFrequencyData(datasets);

    graphAbsoluteFrequency_2 = new Chart(contextAbsoluteFrequency, {
        type: 'bar',
        data: {
            labels: absoluteFrequencyData.labels,
            datasets: [
                {
                    label: 'Absolute Frequency of Success',
                    data: absoluteFrequencyData.data,
                    backgroundColor: absoluteFrequencyData.backgroundColors,
                    borderColor: absoluteFrequencyData.backgroundColors.map(color => color.replace('0.6', '1')),
                    borderWidth: 1,
                    order: 1
                },
                {
                    label: 'Curved Line',
                    data: absoluteFrequencyData.data,  
                    type: 'line',
                    fill: false,
                    borderColor: 'black',  
                    borderWidth: 2,
                    tension: 0.2,  
                    order: 0
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
                    const dataset = graphAbsoluteFrequency_2.data.datasets[index]; 

                    dataset.hidden = !dataset.hidden;

                    graphAbsoluteFrequency_2.update();
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
                    title: { display: true, text: 'Absolute Frequency' },
                    min: 0,
                    max: numberServers,
                    ticks: {
                        stepSize: 1,
                    },
                    grid: {
                        color: '#e0e0e0',
                    }
                }
            }
        }
    });


    if (graphRelativeFrequency_2 !== null) {
        graphRelativeFrequency_2.destroy();
    }

    const contextRelativeFrequency = document.getElementById('graphRelativeFrequency_2').getContext('2d');
    const relativeFrequencyData = create_RelativeFrequencyData(absoluteFrequencyData, numberServers);

    graphRelativeFrequency_2 = new Chart(contextRelativeFrequency, {
        type: 'bar',
        data: {
            labels: relativeFrequencyData.labels,
            datasets: [
                {
                    label: 'Relative Frequency of Success',
                    data: relativeFrequencyData.data,
                    backgroundColor: relativeFrequencyData.backgroundColors,
                    borderColor: relativeFrequencyData.backgroundColors.map(color => color.replace('0.6', '1')),
                    borderWidth: 1,
                    order: 1
                },
                {
                    label: 'Curved Line',
                    data: relativeFrequencyData.data, 
                    type: 'line',
                    fill: false,
                    borderColor: 'black', 
                    borderWidth: 2,
                    tension: 0.2,  
                    order: 0
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
                    const dataset = graphRelativeFrequency_2.data.datasets[index]; 

                    dataset.hidden = !dataset.hidden;

                    graphRelativeFrequency_2.update();
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
                    title: { display: true, text: 'Relative Frequency' },
                    min: 0,
                    max: 1,  
                    ticks: {
                        stepSize: 0.1,
                    },
                    grid: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });


    if (graphHistogram_2) {
        graphHistogram_2.destroy();
    }

    const contextHistogram = document.getElementById('graphHistogram_2').getContext('2d');
    const dataHistogram = create_HistogramData(datasets, numberBreakPoint);
    
    graphHistogram_2 = new Chart(contextHistogram, {
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
                    order: 0
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
                    const dataset = graphHistogram_2.data.datasets[index]; 

                    dataset.hidden = !dataset.hidden;

                    graphHistogram_2.update();
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
                    min: -numberBreakPoint, 
                    max: numberBreakPoint, 
                    ticks: {
                        stepSize: 1,  
                    },
                    grid: {
                        color: (ctx) => ctx.tick.value === 0 ? 'black' : 'rgba(200, 200, 200, 0.5)', 
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
    if (graphFinalHistogram_2) {
        graphFinalHistogram_2.destroy();
    }

    const contextFinalHistogram = document.getElementById('graphFinalHistogram_2').getContext('2d');
    const finalDataHistogram = create_FinalHistogramData(datasets);

    graphFinalHistogram_2 = new Chart(contextFinalHistogram, {
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
                    order: 0
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
                        const dataset = graphFinalHistogram_2.data.datasets[index]; 

                        dataset.hidden = !dataset.hidden;

                        graphFinalHistogram_2.update();
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
                    min: -numberServers, 
                    max: numberServers,  
                    ticks: {
                        stepSize: 1,  
                    },
                    grid: {
                        color: (ctx) => ctx.tick.value === 0 ? 'black' : 'rgba(200, 200, 200, 0.5)', 
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
