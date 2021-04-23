var readyQueue = [];
var arrangedReadyQueue = [];
var timeQuanta;

function readyQueueInit() {
    for (i = 0; i < processes.length; i++) {
        let copiedProcess = Object.assign({}, processes[i]);
        readyQueue[i] = copiedProcess;
    }
}
//formula1
function calculateTimeQuanta() {
    let sum,temp,max;
    if (readyQueue.length != 0) 
    {
        max = Number.MIN_VALUE;
        sum = 0;
        for (let i = 0; i < readyQueue.length; i++) {
            temp = readyQueue[i].burst_time;
            sum += temp;
            if (temp > max)
                max = temp;
        }
        timeQuanta = Math.sqrt(1.0 * sum / readyQueue.length * max);
    } else {
        timeQuanta = 0;
    }
}

function calculateBurstTimePriority() {
    let duplicate = [];
    let flag = [];
    for (i in readyQueue) {
        duplicate[i] = readyQueue[i].burst_time;
        flag[i]=false;
    }

    duplicate.sort(function (a, b) {
        return a - b;
    });

    for(p in readyQueue)
    {
        for(d in duplicate)
        {
            if(readyQueue[p].burst_time===duplicate[d] && !flag[d])
            {
                readyQueue[p].burstTimePriority = Number(d) + 1;
                flag[d] = true;
                break;
            }
        }
    }
}

//formula2
function calculateF() {
    for (p in readyQueue) 
    {
        readyQueue[p].f = (1.0 * (3 * readyQueue[p].priority + readyQueue[p].burstTimePriority) / 4);
    }
}

function calculateFRank() {
    let duplicate=[];
    let flag = [];
    for (p in readyQueue) 
    {
        duplicate[p] = readyQueue[p].f;
        flag[p]=false;
    }

    duplicate.sort(function (a, b) {
        return a - b;
    });

    for (p in readyQueue) 
    {
        for (d in duplicate) 
        {
            if (readyQueue[p].f === duplicate[d] && !flag[d]) 
            {
                readyQueue[p].fRank = Number(d) + 1;
                flag[d] = true;
                break;
            }
        }
    }
}

function sortByFRank() {
    let j, minRank;
    let process;
    
    while (readyQueue.length != 0) 
    {
        minRank = Number.MAX_VALUE;
        for (p in readyQueue)
        {
            if (readyQueue[p].fRank < minRank) 
            {
                minRank = readyQueue[p].fRank;
                process = readyQueue[p];
                j = p;
            }
        }
        arrangedReadyQueue.push(process);
        readyQueue.splice(j, 1);
    }
}

function getProcess(id) {
    for (p in processes) {
        if (processes[p].id == id) {
            return processes[p];
        }
    }
}
var avgWaitingTimeNew = 0,
    avgTurnAroundTimeNew = 0;


function customizedRoundRobin() 
{
    readyQueueInit();
    let turnAroundTime=[];
    let waitingTime=[];
    let completionTime=[];
    let time=0;
    while (readyQueue.length != 0) 
    {
        calculateTimeQuanta();
        calculateBurstTimePriority();
        calculateF();
        calculateFRank();
        sortByFRank();
        while (arrangedReadyQueue.length != 0) 
        {
            let p = arrangedReadyQueue.shift();
            if (p.burst_time > timeQuanta) 
            {
                p.burst_time -= timeQuanta;
                time += timeQuanta;
                readyQueue.push(p);
            } 
            //completed
            else 
            {
                time += p.burst_time;
                completionTime[p.id] = time;
                let process=getProcess(p.id);
                waitingTime[p.id] = completionTime[p.id] - process.burst_time;
            }
        }
    }
    for (i in completionTime) {
        turnAroundTime[i] = completionTime[i];
    }
    avgWaitingTimeNew = calculateAvgTime(waitingTime);
    avgTurnAroundTimeNew = calculateAvgTime(turnAroundTime);
}

function calculateAvgTime(waitingTime) {
    let avg = 0;
    for (i = 1; i < waitingTime.length; i++) {
        avg += waitingTime[i];
    }
    return avg / (waitingTime.length - 1);
}
var avgWaitingTimeFCFS = 0,
    avgTurnaroundTimeFCFS = 0;

function FCFS() 
{
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let turnAroundFCFS = [];
    let waitingFCFS = [];
    let time = 0;
    outer: while (readyQueue.length != 0) {
        min = Number.MAX_VALUE;
        p = -1;
        for (process in readyQueue) {
            if (readyQueue[process].arrival_time < min) {
                min = readyQueue[process].arrival_time;
                p = process;
            }
        }

        if (readyQueue[p].arrival_time > time) {
            time++;
            continue outer;
        }
        time += readyQueue[p].burst_time;
        turnAroundFCFS[readyQueue[p].id] = time - readyQueue[p].arrival_time;
        waitingFCFS[readyQueue[p].id] = turnAroundFCFS[readyQueue[p].id] - readyQueue[p].burst_time;
        readyQueue.splice(p, 1);
    }
    avgTurnaroundTimeFCFS = calculateAvgTime(turnAroundFCFS);
    avgWaitingTimeFCFS = calculateAvgTime(waitingFCFS);
}
var avgWaitingTimeSJFNonPre = 0,
    avgTurnaroundTimeSJFNonPre = 0;

function SJFNonPre() {
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let turnAroundSJFNonPre = [];
    let waitingSJFNonPre = [];
    let processQueue = [];
    let time = 0;
    outer: while (readyQueue.length != 0) {
        for (process in readyQueue) {
            if (readyQueue[process].arrival_time <= time)
                processQueue[process] = readyQueue[process];
        }

        if (processQueue.length == 0) {
            time++;
            continue outer;
        }
        min = Number.MAX_VALUE;
        for (process in processQueue) {
            if (processQueue[process].burst_time < min) {
                min = processQueue[process].burst_time;
                p = process;
            }
        }
        time += processQueue[p].burst_time;
        turnAroundSJFNonPre[processQueue[p].id] = time - processQueue[p].arrival_time;
        waitingSJFNonPre[processQueue[p].id] = turnAroundSJFNonPre[processQueue[p].id] - processQueue[p].burst_time;
        readyQueue.splice(p, 1);
        processQueue.splice(p, 1);
    }
    avgTurnaroundTimeSJFNonPre = calculateAvgTime(turnAroundSJFNonPre);
    avgWaitingTimeSJFNonPre = calculateAvgTime(waitingSJFNonPre);
}
var avgWaitingTimeSJFPre = 0,
    avgTurnaroundTimeSJFPre = 0;

function SJFPre() {
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let turnAroundSJFPre = [];
    let waitingSJFPre = [];
    let processQueue = [];
    let completionTime = [];
    let time = 0;
    while (readyQueue.length != 0) 
    {
        for (process in readyQueue) 
        {
            if (readyQueue[process].arrival_time <= time)
                processQueue.push(readyQueue[process]);
        }

        if (processQueue.length === 0) 
        {
            time++;
            continue;
        }
        min = Number.MAX_VALUE;
        for (process in processQueue) 
        {
            if (processQueue[process].burst_time < min) 
            {
                min = processQueue[process].burst_time;
                p = process;
            }
        }
        time++;
        processQueue[p].burst_time--;
        if (processQueue[p].burst_time == 0) 
        {
            completionTime[processQueue[p].id] = time;
            for(process in readyQueue)
            {
                if(readyQueue[process].id==processQueue[p].id)
                {
                    readyQueue.splice(process, 1);
                }
           }
        }
        processQueue.splice(p, processQueue.length);
    }
    for (p in processes) {
        turnAroundSJFPre[processes[p].id] = completionTime[processes[p].id] - processes[p].arrival_time;
        waitingSJFPre[processes[p].id] = turnAroundSJFPre[processes[p].id] - processes[p].burst_time;
    }
    avgTurnaroundTimeSJFPre = calculateAvgTime(turnAroundSJFPre);
    avgWaitingTimeSJFPre = calculateAvgTime(waitingSJFPre);
}
var avgWaitingTimePriorityNonPre = 0,
    avgTurnaroundTimePriorityNonPre = 0;

function priorityNonPre() {
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let processQueue = [];
    let turnAroundPriorityNonPre = [];
    let waitingPriorityNonPre = [];
    let time = 0;
    while (readyQueue.length != 0) {
        for (process in readyQueue) {
            if (readyQueue[process].arrival_time <= time) {
                processQueue[process] = readyQueue[process];
            }
        }
        if (processQueue.length === 0) {
            time++;
            continue;
        }
        min = Number.MAX_VALUE;
        for (process in processQueue) {
            if (processQueue[process].priority < min) {
                min = processQueue[process].priority;
                p = process;
            }
        }
        time += processQueue[p].burst_time;
        turnAroundPriorityNonPre[processQueue[p].id] = time - processQueue[p].arrival_time;
        waitingPriorityNonPre[processQueue[p].id] = turnAroundPriorityNonPre[processQueue[p].id] - processQueue[p].burst_time;
        readyQueue.splice(p, 1);
        processQueue.splice(p, 1);
    }
    avgTurnaroundTimePriorityNonPre = calculateAvgTime(turnAroundPriorityNonPre);
    avgWaitingTimePriorityNonPre = calculateAvgTime(waitingPriorityNonPre);
}
var avgWaitingTimePriorityPre = 0,
    avgTurnaroundTimePriorityPre = 0;

function priorityPre() {
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let turnAroundPriorityPre = [];
    let waitingPriorityPre = [];
    let processQueue = [];
    let completionTime = [];
    let time = 0;
    outer: while (readyQueue.length != 0) {
        for (process in readyQueue) {
            if (readyQueue[process].arrival_time <= time)
                processQueue[process] = readyQueue[process];
        }

        if (processQueue.length == 0) {
            time++;
            continue outer;
        }
        min = Number.MAX_VALUE;
        for (process in processQueue) {
            if (processQueue[process].priority < min) {
                min = processQueue[process].priority;
                p = process;
            }
        }
        time++;
        processQueue[p].burst_time--;
        if (processQueue[p].burst_time === 0) {
            completionTime[processQueue[p].id] = time;
            readyQueue.splice(p, 1);
        }
        processQueue.splice(p, 1);
    }
    for (p in processes) {
        turnAroundPriorityPre[processes[p].id] = completionTime[processes[p].id] - processes[p].arrival_time;
        waitingPriorityPre[processes[p].id] = turnAroundPriorityPre[processes[p].id] - processes[p].burst_time;
    }
    avgTurnaroundTimePriorityPre = calculateAvgTime(turnAroundPriorityPre);
    avgWaitingTimePriorityPre = calculateAvgTime(waitingPriorityPre);
}
var avgWaitingTimeRoundRobin = 0,
    avgTurnaroundTimeRoundRobin = 0;

function roundRobin() 
{
    readyQueueInit();
    let timeQuanta = Number($("#time_quanta").val());
    if(timeQuanta==0)
    timeQuanta=90;
    let time = 0;
    let processQueue = [];
    let min, p, j, flag,i,n;
    let completionTime = [];
    let turnAroundRR = [];
    let waitingRR = [];
    let runningQueue = [];
    // getting the initial processes in to the running queue
    while (true) 
    {
        if (readyQueue.length == 0)
            break;
        for (process in readyQueue) 
        {
            if (readyQueue[process].arrival_time <= time)
            {
                processQueue.push(readyQueue[process]);
            }
        }
        if (processQueue.length === 0) 
        {
            time++;
            continue;
        }
            
        break;
    }
    //then one by one all the processes
    while (processQueue.length != 0) 
    {
        let currentProcess = processQueue.shift();
        
        if (currentProcess.burst_time > timeQuanta) 
        {
            currentProcess.burst_time -= timeQuanta;
            time += timeQuanta;
            flag = true;
        }
        else 
        {
            flag = false;
            time += currentProcess.burst_time;
            completionTime[currentProcess.id] = time;
            for (process in readyQueue) 
            {
                if (readyQueue[process].id == currentProcess.id) 
                {
                    readyQueue.splice(process, 1);
                    break;
                }
            }
        }

        while (true) 
        {
            if (readyQueue.length == 0)
                break;
            for (process in readyQueue) 
            {
                if (readyQueue[process].arrival_time <= time) 
                {
                    runningQueue.push(readyQueue[process]);
                }
            }
            if (runningQueue.length === 0) 
            {
                time++;
                continue;
            }
            while (runningQueue.length != 0) 
            {
                min = Number.MAX_VALUE;
                for (process in runningQueue) 
                {
                    if ( runningQueue[process].arrival_time < min) 
                    {
                        min = runningQueue[process].arrival_time;
                        j = process;
                    }
                }
                if (!processQueue.includes(runningQueue[j])) 
                {
                    processQueue.push(runningQueue[j]);
                }
                runningQueue.splice(j, 1);
            }
            break;
        }
        if (flag == true) {
            processQueue.push(currentProcess);
        }

    }
    for (p in processes) {
        turnAroundRR[processes[p].id] = completionTime[processes[p].id] - processes[p].arrival_time;
        waitingRR[processes[p].id] = turnAroundRR[processes[p].id] - processes[p].burst_time;
    }
    avgTurnaroundTimeRoundRobin = calculateAvgTime(turnAroundRR);
    avgWaitingTimeRoundRobin = calculateAvgTime(waitingRR);
}

var avgTurnaroundTimeLJFNonPre = 0,avgWaitingTimeLJFNonPre = 0;

function LJFNonPre() {
    readyQueueInit();
    let max = Number.MIN_VALUE;
    let p;
    let turnAroundLJFNonPre = [];
    let waitingLJFNonPre = [];
    let processQueue = [];
    let time = 0;
    outer: while (readyQueue.length != 0) {
        for (process in readyQueue) {
            if (readyQueue[process].arrival_time <= time)
                processQueue[process] = readyQueue[process];
        }

        if (processQueue.length == 0) {
            time++;
            continue outer;
        }
        max = Number.MIN_VALUE;
        for (process in processQueue) {
            if (processQueue[process].burst_time > max) {
                max = processQueue[process].burst_time;
                p = process;
            }
        }
        time += processQueue[p].burst_time;
        turnAroundLJFNonPre[processQueue[p].id] = time - processQueue[p].arrival_time;
        waitingLJFNonPre[processQueue[p].id] = turnAroundLJFNonPre[processQueue[p].id] - processQueue[p].burst_time;
        readyQueue.splice(p, 1);
        processQueue.splice(p, 1);
    }
    avgTurnaroundTimeLJFNonPre = calculateAvgTime(turnAroundLJFNonPre);
    avgWaitingTimeLJFNonPre = calculateAvgTime(waitingLJFNonPre);
}
var avgWaitingTimeLJFPre = 0,
    avgTurnaroundTimeLJFPre = 0;

function LJFPre() {
    readyQueueInit();
    let max = Number.MIN_VALUE;
    let p;
    let turnAroundLJFPre = [];
    let waitingLJFPre = [];
    let processQueue = [];
    let completionTime = [];
    let time = 0;

    while (readyQueue.length != 0) 
    {
        for (process in readyQueue) 
        {
            if (readyQueue[process].arrival_time <= time)
                processQueue.push(readyQueue[process]);
        }

        if (processQueue.length === 0) 
        {
            time++;
            continue;
        }
        max = Number.MIN_VALUE;
        for (process in processQueue) 
        {
            if (processQueue[process].burst_time > max) 
            {
                max = processQueue[process].burst_time;
                p = process;
            }
        }
        time++;
        processQueue[p].burst_time--;
        if (processQueue[p].burst_time == 0) 
        {
            completionTime[processQueue[p].id] = time;
            for(process in readyQueue)
            {
                if(readyQueue[process].id==processQueue[p].id)
                {
                    readyQueue.splice(process, 1);
                }
            }
        }
        processQueue.splice(p, processQueue.length);
    }

    for (p in processes) {
        turnAroundLJFPre[processes[p].id] = completionTime[processes[p].id] - processes[p].arrival_time;
        waitingLJFPre[processes[p].id] = turnAroundLJFPre[processes[p].id] - processes[p].burst_time;
    }
    avgTurnaroundTimeLJFPre = calculateAvgTime(turnAroundLJFPre);
    avgWaitingTimeLJFPre = calculateAvgTime(waitingLJFPre);
}

var resultTable;

function createResultTable() {
    resultTable = document.querySelector('#result_table');
    table = document.createElement('table');
    let headerRow = document.createElement('tr');
    let resultHeaders = ['Scheduling Algorithm', 'Average Turnaround Time', 'Average Waiting Time'];
    let results = [{
            name: "FCFS",
            avgTA: avgTurnaroundTimeFCFS,
            avgWT: avgWaitingTimeFCFS
        },
        {
            name: "SJF",
            avgTA: avgTurnaroundTimeSJFNonPre,
            avgWT: avgWaitingTimeSJFNonPre
        },
        {
            name: "SJF(Preemptive)",
            avgTA: avgTurnaroundTimeSJFPre,
            avgWT: avgWaitingTimeSJFPre
        },
        {
            name: "LJF",
            avgTA: avgTurnaroundTimeLJFNonPre,
            avgWT: avgWaitingTimeLJFNonPre
        },
        {
            name: "LJF(Preemptive)",
            avgTA: avgTurnaroundTimeLJFPre,
            avgWT: avgWaitingTimeLJFPre
        },
        {
            name: "Priority",
            avgTA: avgTurnaroundTimePriorityNonPre,
            avgWT: avgWaitingTimePriorityNonPre
        },
        {
            name: "Priority(Preemptive)",
            avgTA: avgTurnaroundTimePriorityPre,
            avgWT: avgWaitingTimePriorityPre
        },
        {
            name: "RoundRobin",
            avgTA: avgTurnaroundTimeRoundRobin,
            avgWT: avgWaitingTimeRoundRobin
        },
        {
            name: "Proposed",
            avgTA: avgTurnAroundTimeNew,
            avgWT: avgWaitingTimeNew
        }
    ];

    resultHeaders.forEach(headerText => {
        let header = document.createElement('th');
        let textNode = document.createTextNode(headerText);
        header.appendChild(textNode);
        headerRow.appendChild(header);
    });

    table.appendChild(headerRow);

    results.forEach(result => {
        let row = document.createElement('tr');

        Object.values(result).forEach(text => {
            let cell = document.createElement('td');
            let textNode = document.createTextNode(text);
            cell.appendChild(textNode);
            row.appendChild(cell);
        })
        table.appendChild(row);
    });


}

function displayResultTable() {
    createResultTable();
    resultTable.removeChild(resultTable.lastChild);
    resultTable.appendChild(table);
}