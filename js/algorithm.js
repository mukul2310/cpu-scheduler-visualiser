// class process
// {
//     // var id;
//     // float burstTime;
//     // int priority;
//     // int burstTimePriority;
//     // int arrivalTime;
//     // float f;
//     // int fRank;
//     constructor( id, burstTime, priority, arrivalTime)
//     {
//         this.burstTime=burstTime;
//         this.id=id;
//         this.priority=priority;
//         this.arrivalTime=arrivalTime;
//     }
// }


// var processes1=[];
var duplicate = [];
var completionTime = [];
var readyQueue = [];
var arrangedReadyQueue = [];
var timeQuanta;
var turnAroundTime = [];
var waitingTime = [];
var time = 0;

function readyQueueInit() {
    for (i = 0; i < processes.length; i++) {
        let copiedProcess = Object.assign({}, processes[i]);
        readyQueue[i] = copiedProcess;
    }
}
//formula1
function calculateTimeQuanta() {
    let sum, quanta, temp;
    if (readyQueue.length != 0) {
        let max = -1;
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
    let i = 0,
        n = readyQueue.length,
        j, k, count = 0;
    let duplicate = [];
    let flag = [];
    for (i = 0; i < readyQueue.length; i++) {
        duplicate[count] = readyQueue[i].burst_time;
        count++;
    }

    duplicate.sort(function (a, b) {
        return a - b;
    });

    for (i = 0; i < readyQueue.length; i++) {
        // let p1= readyQueue[i];
        for (j = 0; j < n; j++) {
            if (readyQueue[i].burst_time == duplicate[j] && !flag[j]) {
                readyQueue[i].burstTimePriority = j + 1;
                flag[j] = true;
                break;
            }
        }
    }

}

//formula2
function calculateF() {
    for (i = 0; i < readyQueue.length; i++) {
        readyQueue[i].f = (1.0 * (3 * readyQueue[i].priority + readyQueue[i].burstTimePriority) / 4);
    }
}

function calculateFRank() {
    let i = 0,
        n = readyQueue.length,
        j, k, count = 0;
    let p;
    let min;
    let flag = [];
    //        int b[]=new int[n];
    for (i = 0; i < readyQueue.length; i++) {
        duplicate[count] = readyQueue[i].f;
        //            index[count]=count+1;
        count++;
    }
    duplicate.sort(function (a, b) {
        return a - b;
    });
    for (i = 0; i < readyQueue.length; i++) {
        for (j = 0; j < n; j++) {
            if (readyQueue[i].f == duplicate[j] && !flag[j]) {
                readyQueue[i].fRank = j + 1;
                flag[j] = true;
                break;
            }
        }
    }
}

function sortByFRank() {
    let i, j, minRank;
    let process;
    while (readyQueue.length != 0) {
        minRank = Number.MAX_VALUE;
        for (i = 0; i < readyQueue.length; i++)
            if (readyQueue[i].fRank < minRank) {
                minRank = readyQueue[i].fRank;
                process = readyQueue[i];
                j = i;
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

function customizedRoundRobin() {
    readyQueueInit();
    while (readyQueue.length != 0) {
        calculateTimeQuanta();
        calculateBurstTimePriority();
        calculateF();
        calculateFRank();
        sortByFRank();
        while (arrangedReadyQueue.length != 0) {
            let p = arrangedReadyQueue.shift();
            if (p.burst_time > timeQuanta) {
                p.burst_time -= timeQuanta;
                time += timeQuanta;
                readyQueue.push(p);
            } else {
                //completed
                time += p.burst_time;
                completionTime[p.id] = time;
                let process = getProcess(p.id);
                waitingTime[p.id] = completionTime[p.id] - process.burst_time;
            }
        }
    }
    for (i = 0; i < completionTime.length; i++) {
        turnAroundTime[i] = completionTime[i];
    }
    var avgWaitingTimeNew = calculateAvgTime(waitingTime);
    var avgTurnAroundTimeNew = calculateAvgTime(turnAroundTime);

    console.log("New WT " + avgWaitingTimeNew);
    console.log("New TAT " + avgTurnAroundTimeNew);
}

function calculateAvgTime(waitingTime) {
    let avg = 0;
    for (i = 1; i < waitingTime.length; i++) {
        avg += waitingTime[i];
    }
    return avg / (waitingTime.length - 1);
}

function FCFS() {
    var avgWaitingTimeFCFS, avgTurnaroundTimeFCFS;
    let i, currentTime = 0;
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
    console.log("FCFS WT " + avgWaitingTimeFCFS);
    console.log("FCFS TAT " + avgTurnaroundTimeFCFS);
}

function SJFNonPre() {
    var avgWaitingTimeSJFNonPre, avgTurnaroundTimeSJFNonPre;
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
    console.log("SJF non pre WT " + avgWaitingTimeSJFNonPre);
    console.log("SJF non pre TAT " + avgTurnaroundTimeSJFNonPre);
}

function SJFPre() {
    var avgWaitingTimeSJFPre, avgTurnaroundTimeSJFPre;
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let turnAroundSJFPre = [];
    let waitingSJFPre = [];
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
            if (processQueue[process].burst_time < min) {
                min = processQueue[process].burst_time;
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
        turnAroundSJFPre[processes[p].id] = completionTime[processes[p].id] - processes[p].arrival_time;
        waitingSJFPre[processes[p].id] = turnAroundSJFPre[processes[p].id] - processes[p].burst_time;
    }
    avgTurnaroundTimeSJFPre = calculateAvgTime(turnAroundSJFPre);
    avgWaitingTimeSJFPre = calculateAvgTime(waitingSJFPre);
    console.log("SJF pre WT " + avgWaitingTimeSJFPre);
    console.log("SJF pre TAT " + avgTurnaroundTimeSJFPre);

}

function priorityNonPre() {
    readyQueueInit();
    var avgWaitingTimePriorityNonPre, avgTurnaroundTimePriorityNonPre;
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
    console.log("Priority Non Pre WT " + avgWaitingTimePriorityNonPre);
    console.log("Priority Non Pre TAT " + avgTurnaroundTimePriorityNonPre);
}

function priorityPre() {
    var avgWaitingTimePriorityPre, avgTurnaroundTimePriorityPre;
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
    console.log("Priority pre WT " + avgWaitingTimePriorityPre);
    console.log("Priority pre TAT " + avgTurnaroundTimePriorityPre);
}

function roundRobin() {
    readyQueueInit();
    let timeQuanta = Number($("#time_quanta").val());
    let time = 0;
    let processQueue = [];
    let min, p, j, flag;
    let completionTime = [];
    var avgWaitingTimeRoundRobin, avgTurnaroundTimeRoundRobin;
    let turnAroundRR = [];
    let waitingRR = [];
    let runningQueue = [];
    // getting the initial processes in to the running queue
    while (true) {
        if (readyQueue.length == 0)
            break;
        for (process in readyQueue) {
            if (readyQueue[process].arrival_time <= time) {
                processQueue[process] = readyQueue[process];
            }
        }
        if (processQueue.length === 0) {
            time++;
            continue;
        }
        while (processQueue.length != 0) {
            min = Number.MAX_VALUE;
            for (process in processQueue) {
                if (processQueue[process].arrival_time < min) {
                    min = processQueue[process].arrival_time;
                    j = process;
                }
            }
            runningQueue.push(processQueue[j]);
            processQueue.splice(j, 1);
        }
        break;
    }
    //then one by one all the processes
    while (runningQueue.length != 0) {
        let currentProcess = runningQueue[0];
        if (currentProcess.burst_time > timeQuanta) {
            currentProcess.burst_time -= timeQuanta;
            time += timeQuanta;
            flag = true;
        } else {
            flag = false;
            time += currentProcess.burst_time;
            completionTime[currentProcess.id] = time;
            for (process in readyQueue) {
                if (readyQueue[process].id == currentProcess.id) {
                    readyQueue.splice(process, 1);
                    break;
                }
            }
        }

        while (true) {
            if (readyQueue.length == 0)
                break;
            for (process in readyQueue) {
                if (readyQueue[process].arrival_time <= time) {
                    processQueue[process] = readyQueue[process];
                }
            }
            if (processQueue.length === 0) {
                time++;
                continue;
            }
            while (processQueue.length != 0) {
                min = Number.MAX_VALUE;
                for (process in processQueue) {
                    if (processQueue[process].arrival_time < min) {
                        min = processQueue[process].arrival_time;
                        j = process;
                    }
                }
                if (!runningQueue.includes(processQueue[j])) {
                    runningQueue.push(processQueue[j]);
                }
                processQueue.splice(j, 1);
            }
            break;
        }
        runningQueue.shift();
        if (flag == true) {
            runningQueue.push(currentProcess);
        }

    }
    for (p in processes) {
        turnAroundRR[processes[p].id] = completionTime[processes[p].id] - processes[p].arrival_time;
        waitingRR[processes[p].id] = turnAroundRR[processes[p].id] - processes[p].burst_time;
    }
    avgTurnaroundTimeRoundRobin = calculateAvgTime(turnAroundRR);
    avgWaitingTimeRoundRobin = calculateAvgTime(waitingRR);
    console.log("Round Robin WT " + avgWaitingTimeRoundRobin);
    console.log("Round Robin TAT " + avgTurnaroundTimeRoundRobin);
}