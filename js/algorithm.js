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
    let sum, temp, max;
    if (readyQueue.length != 0) {
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
        flag[i] = false;
    }

    duplicate.sort(function (a, b) {
        return a - b;
    });

    for (p in readyQueue) {
        for (d in duplicate) {
            if (readyQueue[p].burst_time === duplicate[d] && !flag[d]) {
                readyQueue[p].burstTimePriority = Number(d) + 1;
                flag[d] = true;
                break;
            }
        }
    }
}

//formula2
function calculateF() {
    for (p in readyQueue) {
        readyQueue[p].f = (1.0 * (3 * readyQueue[p].priority + readyQueue[p].burstTimePriority) / 4);
    }
}

function calculateFRank() {
    let duplicate = [];
    let flag = [];
    for (p in readyQueue) {
        duplicate[p] = readyQueue[p].f;
        flag[p] = false;
    }

    duplicate.sort(function (a, b) {
        return a - b;
    });

    for (p in readyQueue) {
        for (d in duplicate) {
            if (readyQueue[p].f === duplicate[d] && !flag[d]) {
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

    while (readyQueue.length != 0) {
        minRank = Number.MAX_VALUE;
        for (p in readyQueue) {
            if (readyQueue[p].fRank < minRank) {
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
    avgTurnAroundTimeNew = 0,
    avgResponseTimeNew = 0;
var ganttProposed = [];
var completionTimeNew = 0;

function newProposed() {
    readyQueueInit();
    let turnAroundTime = [];
    let waitingTime = [];
    let completionTime = [];
    let responseTime = [];
    let time = 0;
    while (readyQueue.length != 0) {
        calculateTimeQuanta();
        calculateBurstTimePriority();
        calculateF();
        calculateFRank();
        sortByFRank();
        while (arrangedReadyQueue.length != 0) {
            let p = arrangedReadyQueue.shift();
            prev_time = time;
            if (p.burst_time === getProcess(p.id).burst_time) {
                //It means came for the first time
                responseTime[p.id] = prev_time;
            }
            if (p.burst_time > timeQuanta) {
                p.burst_time -= timeQuanta;
                time += timeQuanta;
                readyQueue.push(p);
            } else //completed
            {
                time += p.burst_time;
                completionTime[p.id] = time;
                let process = getProcess(p.id);
                waitingTime[p.id] = completionTime[p.id] - process.burst_time;
            }
            ganttProposed.push({
                processId: p.id,
                startTime: prev_time,
                endTime: time
            });
        }
    }
    for (i in completionTime) {
        turnAroundTime[i] = completionTime[i];
    }
    completionTimeNew = time;
    avgWaitingTimeNew = calculateAvgTime(waitingTime);
    avgTurnAroundTimeNew = calculateAvgTime(turnAroundTime);
    avgResponseTimeNew = calculateAvgTime(responseTime);
}

function calculateAvgTime(waitingTime) {
    let avg = 0;
    for (i = 1; i < waitingTime.length; i++) {
        avg += waitingTime[i];
    }
    return avg / (waitingTime.length - 1);
}
var avgWaitingTimeFCFS = 0,
    avgTurnaroundTimeFCFS = 0,
    avgResponseTimeFCFS = 0;
var ganttFCFS = [];
var completionTimeFCFS = 0;

function FCFS() {
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
            ganttFCFS.push({
                processId: null,
                startTime: time,
                endTime: time + 1
            });
            time++;
            continue outer;
        }
        prev_time = time;
        time += readyQueue[p].burst_time;
        turnAroundFCFS[readyQueue[p].id] = time - readyQueue[p].arrival_time;
        waitingFCFS[readyQueue[p].id] = turnAroundFCFS[readyQueue[p].id] - readyQueue[p].burst_time;
        ganttFCFS.push({
            processId: readyQueue[p].id,
            startTime: prev_time,
            endTime: time
        });
        readyQueue.splice(p, 1);
    }
    completionTimeFCFS = time;
    avgTurnaroundTimeFCFS = calculateAvgTime(turnAroundFCFS);
    avgWaitingTimeFCFS = calculateAvgTime(waitingFCFS);
    avgResponseTimeFCFS = avgWaitingTimeFCFS;
}
var avgWaitingTimeSJFNonPre = 0,
    avgTurnaroundTimeSJFNonPre = 0,
    avgResponseTimeSJFNonPre = 0;
var ganttSJFNonPre = [];
var completionTimeSJF = 0;

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
            ganttSJFNonPre.push({
                processId: null,
                startTime: time,
                endTime: time + 1
            });
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
        prev_time = time;
        time += processQueue[p].burst_time;
        ganttSJFNonPre.push({
            processId: processQueue[p].id,
            startTime: prev_time,
            endTime: time
        });
        turnAroundSJFNonPre[processQueue[p].id] = time - processQueue[p].arrival_time;
        waitingSJFNonPre[processQueue[p].id] = turnAroundSJFNonPre[processQueue[p].id] - processQueue[p].burst_time;
        readyQueue.splice(p, 1);
        processQueue.splice(p, 1);
    }
    completionTimeSJF = time;
    avgTurnaroundTimeSJFNonPre = calculateAvgTime(turnAroundSJFNonPre);
    avgWaitingTimeSJFNonPre = calculateAvgTime(waitingSJFNonPre);
    avgResponseTimeSJFNonPre = avgWaitingTimeSJFNonPre;
}
var avgWaitingTimeSJFPre = 0,
    avgTurnaroundTimeSJFPre = 0,
    avgResponseTimeSJFPre = 0;
var ganttSJFPre = [];
var completionTimeSJFPre = 0;

function SJFPre() {
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let turnAroundSJFPre = [];
    let waitingSJFPre = [];
    let responseSJFPre = [];
    let processQueue = [];
    let completionTime = [];
    let time = 0;
    while (readyQueue.length != 0) {
        for (process in readyQueue) {
            if (readyQueue[process].arrival_time <= time)
                processQueue.push(readyQueue[process]);
        }

        if (processQueue.length === 0) {
            if (ganttSJFPre.length > 0 && ganttSJFPre[ganttSJFPre.length - 1].processId != null) {
                ganttSJFPre[ganttSJFPre.length - 1].endTime = time;
                ganttSJFPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            } else if (ganttSJFPre.length == 0) {
                ganttSJFPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            }
            time++;
            continue;
        }
        min = Number.MAX_VALUE;
        for (process in processQueue) {
            if (processQueue[process].burst_time < min) {
                min = processQueue[process].burst_time;
                p = process;
            }
        }
        prev_time = time;
        time++;
        if (ganttSJFPre.length > 0 && ganttSJFPre[ganttSJFPre.length - 1].processId != processQueue[p].id) {
            ganttSJFPre[ganttSJFPre.length - 1].endTime = prev_time;
            ganttSJFPre.push({
                processId: processQueue[p].id,
                startTime: prev_time,
                endTime: time
            });
        } else if (ganttSJFPre.length == 0) {
            ganttSJFPre.push({
                processId: processQueue[p].id,
                startTime: prev_time,
                endTime: time
            });
        }
        if (processQueue[p].burst_time === getProcess(processQueue[p].id).burst_time) {
            //It means came for the first time
            responseSJFPre[processQueue[p].id] = prev_time - processQueue[p].arrival_time;
        }
        processQueue[p].burst_time--;
        if (processQueue[p].burst_time == 0) {
            completionTime[processQueue[p].id] = time;
            for (process in readyQueue) {
                if (readyQueue[process].id == processQueue[p].id) {
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
    if (ganttSJFPre.length > 0)
        ganttSJFPre[ganttSJFPre.length - 1].endTime = time;
    completionTimeSJFPre = time;
    avgTurnaroundTimeSJFPre = calculateAvgTime(turnAroundSJFPre);
    avgWaitingTimeSJFPre = calculateAvgTime(waitingSJFPre);
    avgResponseTimeSJFPre = calculateAvgTime(responseSJFPre);
}
var avgWaitingTimePriorityNonPre = 0,
    avgTurnaroundTimePriorityNonPre = 0,
    avgResponseTimePriorityNonPre = 0;
var ganttPriorityNonPre = [];
var completionTimePriority = 0;

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
            ganttPriorityNonPre.push({
                processId: null,
                startTime: time,
                endTime: time + 1
            });
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
        prev_time = time;
        time += processQueue[p].burst_time;
        ganttPriorityNonPre.push({
            processId: processQueue[p].id,
            startTime: prev_time,
            endTime: time
        });
        turnAroundPriorityNonPre[processQueue[p].id] = time - processQueue[p].arrival_time;
        waitingPriorityNonPre[processQueue[p].id] = turnAroundPriorityNonPre[processQueue[p].id] - processQueue[p].burst_time;
        readyQueue.splice(p, 1);
        processQueue.splice(p, 1);
    }
    completionTimePriority = time;
    avgTurnaroundTimePriorityNonPre = calculateAvgTime(turnAroundPriorityNonPre);
    avgWaitingTimePriorityNonPre = calculateAvgTime(waitingPriorityNonPre);
    avgResponseTimePriorityNonPre = avgWaitingTimePriorityNonPre;
}
var avgWaitingTimePriorityPre = 0,
    avgTurnaroundTimePriorityPre = 0,
    avgResponseTimePriorityPre = 0;
var ganttPriorityPre = [];
var completionTimePriorityPre = 0;

function priorityPre() {
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let turnAroundPriorityPre = [];
    let waitingPriorityPre = [];
    let responsePriorityPre = [];
    let processQueue = [];
    let completionTime = [];
    let time = 0;
    outer: while (readyQueue.length != 0) {
        for (process in readyQueue) {
            if (readyQueue[process].arrival_time <= time)
                processQueue[process] = readyQueue[process];
        }

        if (processQueue.length == 0) {
            if (ganttPriorityPre.length > 0 && ganttPriorityPre[ganttPriorityPre.length - 1].processId != null) {
                ganttPriorityPre[ganttPriorityPre.length - 1].endTime = time;
                ganttPriorityPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            } else if (ganttPriorityPre.length == 0) {
                ganttPriorityPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            }
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
        prev_time = time;
        time++;
        if (ganttPriorityPre.length > 0 && ganttPriorityPre[ganttPriorityPre.length - 1].processId != processQueue[p].id) {
            ganttPriorityPre[ganttPriorityPre.length - 1].endTime = prev_time;
            ganttPriorityPre.push({
                processId: processQueue[p].id,
                startTime: prev_time,
                endTime: time
            });
        } else if (ganttPriorityPre.length == 0) {
            ganttPriorityPre.push({
                processId: processQueue[p].id,
                startTime: prev_time,
                endTime: time
            });
        }
        if (processQueue[p].burst_time === getProcess(processQueue[p].id).burst_time) {
            //It means came for the first time
            responsePriorityPre[processQueue[p].id] = prev_time - processQueue[p].arrival_time;
        }
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
    completionTimePriorityPre = time;
    if (ganttPriorityPre.length > 0)
        ganttPriorityPre[ganttPriorityPre.length - 1].endTime = time;
    avgTurnaroundTimePriorityPre = calculateAvgTime(turnAroundPriorityPre);
    avgWaitingTimePriorityPre = calculateAvgTime(waitingPriorityPre);
    avgResponseTimePriorityPre = calculateAvgTime(responsePriorityPre);
}
var avgWaitingTimeRoundRobin = 0,
    avgTurnaroundTimeRoundRobin = 0,
    avgResponseTimeRoundRobin = 0;

var ganttRoundRobin = [];
var completionTimeRoundRobin = 0;

function roundRobin() {
    readyQueueInit();
    let timeQuanta = Number($("#time_quanta").val());
    if (timeQuanta == 0)
        timeQuanta = 90;
    let time = 0;
    let processQueue = [];
    let min, p, j, flag;
    let completionTime = [];
    let turnAroundRR = [];
    let responseRR = [];
    let waitingRR = [];
    let runningQueue = [];
    // getting the initial processes in to the process queue
    while (true) {
        if (readyQueue.length == 0)
            break;
        for (process in readyQueue) {
            if (readyQueue[process].arrival_time <= time) {
                processQueue.push(readyQueue[process]);
            }
        }
        if (processQueue.length === 0) {
            ganttRoundRobin.push({
                processId: null,
                startTime: time,
                endTime: time + 1
            });
            time++;
            continue;
        }

        break;
    }
    //then one by one all the processes
    while (processQueue.length != 0) {
        prev_time = time;
        let currentProcess = processQueue[0];

        if (currentProcess.burst_time === getProcess(currentProcess.id).burst_time) {
            //It means came for the first time
            responseRR[currentProcess.id] = prev_time - currentProcess.arrival_time;
        }

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
        ganttRoundRobin.push({
            processId: currentProcess.id,
            startTime: prev_time,
            endTime: time
        });
        //Taking remaining process and pushing them in running queue
        while (true) {
            if (readyQueue.length == 0)
                break;
            for (process in readyQueue) {
                if (readyQueue[process].arrival_time <= time) {
                    runningQueue.push(readyQueue[process]);
                }
            }
            if (runningQueue.length === 0) {
                ganttRoundRobin.push({
                    processId: null,
                    startTime: time,
                    endTime: time
                });
                time++;
                continue;
            }
            // now taking those processes from running queue to process queue which has minimum arrival time
            while (runningQueue.length != 0) {
                min = Number.MAX_VALUE;
                for (process in runningQueue) {
                    if (runningQueue[process].arrival_time < min) {
                        min = runningQueue[process].arrival_time;
                        j = process;
                    }
                }
                if (!processQueue.includes(runningQueue[j])) {
                    processQueue.push(runningQueue[j]);
                }
                runningQueue.splice(j, 1);
            }
            break;
        }
        if (flag == true) {
            processQueue.push(currentProcess);
        }
        processQueue.shift();
    }
    for (p in processes) {
        turnAroundRR[processes[p].id] = completionTime[processes[p].id] - processes[p].arrival_time;
        waitingRR[processes[p].id] = turnAroundRR[processes[p].id] - processes[p].burst_time;
    }
    completionTimeRoundRobin = time;
    avgTurnaroundTimeRoundRobin = calculateAvgTime(turnAroundRR);
    avgWaitingTimeRoundRobin = calculateAvgTime(waitingRR);
    avgResponseTimeRoundRobin = calculateAvgTime(responseRR);
}

var avgTurnaroundTimeLJFNonPre = 0,
    avgWaitingTimeLJFNonPre = 0,
    avgResponseTimeLJFNonPre = 0;

var ganttLJFNonPre = [];
var completionTimeLJF = 0;

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
            ganttLJFNonPre.push({
                processId: null,
                startTime: time,
                endTime: time + 1
            });
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
        prev_time = time;
        time += processQueue[p].burst_time;
        ganttLJFNonPre.push({
            processId: processQueue[p].id,
            startTime: prev_time,
            endTime: time
        });
        turnAroundLJFNonPre[processQueue[p].id] = time - processQueue[p].arrival_time;
        waitingLJFNonPre[processQueue[p].id] = turnAroundLJFNonPre[processQueue[p].id] - processQueue[p].burst_time;
        readyQueue.splice(p, 1);
        processQueue.splice(p, 1);
    }
    completionTimeLJF = time;
    avgTurnaroundTimeLJFNonPre = calculateAvgTime(turnAroundLJFNonPre);
    avgWaitingTimeLJFNonPre = calculateAvgTime(waitingLJFNonPre);
    avgResponseTimeLJFNonPre = avgWaitingTimeLJFNonPre;
}
var avgWaitingTimeLJFPre = 0,
    avgTurnaroundTimeLJFPre = 0,
    avgResponseTimeLJFPre = 0;
var ganttLJFPre = [];
var completionTimeLJFPre = 0;

function LJFPre() {
    readyQueueInit();
    let max = Number.MIN_VALUE;
    let p;
    let turnAroundLJFPre = [];
    let waitingLJFPre = [];
    let responseLJFPre = [];
    let processQueue = [];
    let completionTime = [];
    let time = 0;

    while (readyQueue.length != 0) {
        for (process in readyQueue) {
            if (readyQueue[process].arrival_time <= time)
                processQueue.push(readyQueue[process]);
        }

        if (processQueue.length === 0) {
            if (ganttLJFPre.length > 0 && ganttLJFPre[ganttLJFPre.length - 1].processId != null) {
                ganttLJFPre[ganttLJFPre.length - 1].endTime = time;
                ganttLJFPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            } else if (ganttLJFPre.length == 0) {
                ganttLJFPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            }
            time++;
            continue;
        }
        max = Number.MIN_VALUE;
        for (process in processQueue) {
            if (processQueue[process].burst_time > max) {
                max = processQueue[process].burst_time;
                p = process;
            }
        }
        prev_time = time;
        time++;
        if (ganttLJFPre.length > 0 && ganttLJFPre[ganttLJFPre.length - 1].processId != processQueue[p].id) {
            ganttLJFPre[ganttLJFPre.length - 1].endTime = prev_time;
            ganttLJFPre.push({
                processId: processQueue[p].id,
                startTime: prev_time,
                endTime: time
            });
        } else if (ganttLJFPre.length == 0) {
            ganttLJFPre.push({
                processId: processQueue[p].id,
                startTime: prev_time,
                endTime: time
            });
        }
        if (processQueue[p].burst_time === getProcess(processQueue[p].id).burst_time) {
            //It means came for the first time
            responseLJFPre[processQueue[p].id] = prev_time - processQueue[p].arrival_time;
        }
        processQueue[p].burst_time--;
        if (processQueue[p].burst_time == 0) {
            completionTime[processQueue[p].id] = time;
            for (process in readyQueue) {
                if (readyQueue[process].id == processQueue[p].id) {
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
    if (ganttLJFPre.length > 0)
        ganttLJFPre[ganttLJFPre.length - 1].endTime = time;
    completionTimeLJFPre = time;
    avgTurnaroundTimeLJFPre = calculateAvgTime(turnAroundLJFPre);
    avgWaitingTimeLJFPre = calculateAvgTime(waitingLJFPre);
    avgResponseTimeLJFPre = calculateAvgTime(responseLJFPre);
}

var resultTable;

function createResultTable() {
    resultTable = document.querySelector('#result_table');
    table = document.createElement('table');
    let headerRow = document.createElement('tr');
    let resultHeaders = ['Scheduling Algorithm', 'Average Turnaround Time', 'Average Waiting Time'];
    let results = [{
            name: "FCFS",
            avgTA: avgTurnaroundTimeFCFS.toFixed(2),
            avgWT: avgWaitingTimeFCFS.toFixed(2)
        },
        {
            name: "SJF",
            avgTA: avgTurnaroundTimeSJFNonPre.toFixed(2),
            avgWT: avgWaitingTimeSJFNonPre.toFixed(2)
        },
        {
            name: "SJF(Preemptive)",
            avgTA: avgTurnaroundTimeSJFPre.toFixed(2),
            avgWT: avgWaitingTimeSJFPre.toFixed(2)
        },
        {
            name: "LJF",
            avgTA: avgTurnaroundTimeLJFNonPre.toFixed(2),
            avgWT: avgWaitingTimeLJFNonPre.toFixed(2)
        },
        {
            name: "LJF(Preemptive)",
            avgTA: avgTurnaroundTimeLJFPre.toFixed(2),
            avgWT: avgWaitingTimeLJFPre.toFixed(2)
        },
        {
            name: "Priority",
            avgTA: avgTurnaroundTimePriorityNonPre.toFixed(2),
            avgWT: avgWaitingTimePriorityNonPre.toFixed(2)
        },
        {
            name: "Priority(Preemptive)",
            avgTA: avgTurnaroundTimePriorityPre.toFixed(2),
            avgWT: avgWaitingTimePriorityPre.toFixed(2)
        },
        {
            name: "RoundRobin",
            avgTA: avgTurnaroundTimeRoundRobin.toFixed(2),
            avgWT: avgWaitingTimeRoundRobin.toFixed(2)
        },
        {
            name: "Proposed",
            avgTA: avgTurnAroundTimeNew.toFixed(2),
            avgWT: avgWaitingTimeNew.toFixed(2)
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

function init() {
    avgWaitingTimeNew = 0;
    avgWaitingTimeLJFPre = 0;
    avgWaitingTimeRoundRobin = 0;
    avgWaitingTimePriorityPre = 0;
    avgWaitingTimePriorityNonPre = 0;
    avgWaitingTimeSJFPre = 0;
    avgWaitingTimeSJFNonPre = 0;
    avgWaitingTimeLJFNonPre = 0;
    avgWaitingTimeFCFS = 0;

    avgTurnAroundTimeNew = 0;
    avgTurnaroundTimeLJFPre = 0;
    avgTurnaroundTimeLJFNonPre = 0;
    avgTurnaroundTimeRoundRobin = 0;
    avgTurnaroundTimePriorityPre = 0;
    avgTurnaroundTimePriorityNonPre = 0;
    avgTurnaroundTimeSJFPre = 0;
    avgTurnaroundTimeSJFNonPre = 0;
    avgTurnaroundTimeFCFS = 0;

    avgResponseTimeNew = 0;
    avgResponseTimeLJFPre = 0;
    avgResponseTimeRoundRobin = 0;
    avgResponseTimePriorityPre = 0;
    avgResponseTimePriorityNonPre = 0;
    avgResponseTimeSJFPre = 0;
    avgResponseTimeSJFNonPre = 0;
    avgResponseTimeLJFNonPre = 0;
    avgResponseTimeFCFS = 0;

    ganttProposed = [];
    ganttFCFS = [];
    ganttSJFNonPre = [];
    ganttSJFPre = [];
    ganttPriorityNonPre = [];
    ganttPriorityPre = [];
    ganttRoundRobin = [];
    ganttLJFNonPre = [];
    ganttLJFPre = [];
    bestAlgo = [];

    completionTimeFCFS = 0;
    completionTimeSJF = 0;
    completionTimeSJFPre = 0;
    completionTimePriority = 0;
    completionTimePriorityPre = 0;
    completionTimeLJF = 0;
    completionTimeLJFPre = 0;
    completionTimeRoundRobin = 0;
    completionTimeNew = 0;

    $("#gantt_FCFS").empty();
    $("#gantt_SJFNonPre").empty();
    $("#gantt_SJFPre").empty();
    $("#gantt_LJFNonPre").empty();
    $("#gantt_LJFPre").empty();
    $("#gantt_PriorityNonPre").empty();
    $("#gantt_PriorityPre").empty();
    $("#gantt_RoundRobin").empty();
    $("#gantt_Proposed").empty();

    $("#final_result").empty();
}

function displayResultTable() {
    createResultTable();
    resultTable.removeChild(resultTable.lastChild);
    resultTable.appendChild(table);
}

function displayGanttChart() {
    for (i in ganttFCFS)
        $("#gantt_FCFS").append(`<div class="col-md-3"><span>${ganttFCFS[i].startTime} </span><span>${ganttFCFS[i].processId} </span><span>${ganttFCFS[i].endTime} <span></div>`);
    for (i in ganttSJFNonPre)
        $("#gantt_SJFNonPre").append(`<div class="col-md-3"><span>${ganttSJFNonPre[i].startTime} </span><span>${ganttSJFNonPre[i].processId} </span><span>${ganttSJFNonPre[i].endTime} <span></div>`);
    for (i in ganttSJFPre)
        $("#gantt_SJFPre").append(`<div class="col-md-3"><span>${ganttSJFPre[i].startTime} </span><span>${ganttSJFPre[i].processId} </span><span>${ganttSJFPre[i].endTime} <span></div>`);
    for (i in ganttLJFNonPre)
        $("#gantt_LJFNonPre").append(`<div class="col-md-3"><span>${ganttLJFNonPre[i].startTime} </span><span>${ganttLJFNonPre[i].processId} </span><span>${ganttLJFNonPre[i].endTime} <span></div>`);
    for (i in ganttLJFPre)
        $("#gantt_LJFPre").append(`<div class="col-md-3"><span>${ganttLJFPre[i].startTime} </span><span>${ganttLJFPre[i].processId} </span><span>${ganttLJFPre[i].endTime} <span></div>`);
    for (i in ganttPriorityNonPre)
        $("#gantt_PriorityNonPre").append(`<div class="col-md-3"><span>${ganttPriorityNonPre[i].startTime} </span><span>${ganttPriorityNonPre[i].processId} </span><span>${ganttPriorityNonPre[i].endTime} <span></div>`);
    for (i in ganttPriorityPre)
        $("#gantt_PriorityPre").append(`<div class="col-md-3"><span>${ganttPriorityPre[i].startTime} </span><span>${ganttPriorityPre[i].processId} </span><span>${ganttPriorityPre[i].endTime} <span></div>`);
    for (i in ganttRoundRobin)
        $("#gantt_RoundRobin").append(`<div class="col-md-3"><span>${ganttRoundRobin[i].startTime} </span><span>${ganttRoundRobin[i].processId} </span><span>${ganttRoundRobin[i].endTime} <span></div>`);
    for (i in ganttProposed)
        $("#gantt_Proposed").append(`<div class="col-md-3"><span>${ganttProposed[i].startTime} </span><span>${ganttProposed[i].processId} </span><span>${ganttProposed[i].endTime} <span></div>`);

}
let bestAlgo = [];

function calculateRank(a, b) {
    let duplicate = [];
    let rank = [];
    currentRank = 0;
    for (i in a) {
        duplicate[i] = a[i];
    }
    if (b === 1) {
        duplicate.sort((a, b) => {
            return a - b;
        });
    } else {
        duplicate.sort((a, b) => {
            return b - a;
        });
    }
    let set = new Set(duplicate);
    set.forEach((values) => {
        currentRank++;
        for (i in a) {
            if (a[i] === values) {
                rank[i] = currentRank;
            }
        }
    });

    return rank;
}

function findBest() {
    //calculate max CPU utilization
    //calculate min wt
    // calculate min tat
    // calculate max through put
    let algorithms = ["FCFS", "SJF", "SJF(Preemptive)", "LJF", "LJF(Preemptive)", "Priority", "Priority(Preemptive)", "Round Robin", "Proposed Algorithm"];
    let wt = [avgWaitingTimeFCFS, avgWaitingTimeSJFNonPre, avgWaitingTimeSJFPre, avgWaitingTimeLJFNonPre, avgWaitingTimeLJFPre, avgWaitingTimePriorityNonPre, avgWaitingTimePriorityPre, avgWaitingTimeRoundRobin, avgWaitingTimeNew];
    let tat = [avgTurnaroundTimeFCFS, avgTurnaroundTimeSJFNonPre, avgTurnaroundTimeSJFPre, avgTurnaroundTimeLJFNonPre, avgTurnaroundTimeLJFPre, avgTurnaroundTimePriorityNonPre, avgTurnaroundTimePriorityPre, avgTurnaroundTimeRoundRobin, avgTurnAroundTimeNew];
    let rt = [avgResponseTimeFCFS, avgResponseTimeSJFNonPre, avgResponseTimeSJFPre, avgResponseTimeLJFNonPre, avgResponseTimeLJFPre, avgResponseTimePriorityNonPre, avgResponseTimePriorityPre, avgResponseTimeRoundRobin, avgResponseTimeNew];
    let cpuUtil = [];
    let throughput = [];
    let minArrivalTime = Number.MAX_VALUE;
    for (p in processes) {
        if (processes[p].arrival_time < minArrivalTime)
            minArrivalTime = processes[p].arrival_time;
    }
    let ct = [completionTimeFCFS, completionTimeSJF, completionTimeSJFPre, completionTimeLJF, completionTimeLJFPre, completionTimePriority, completionTimePriorityPre, completionTimeRoundRobin, completionTimeNew];
    let cs = [ganttFCFS.length - 1, ganttSJFNonPre.length - 1, ganttSJFPre.length - 1, ganttLJFNonPre.length - 1, ganttLJFPre.length - 1, ganttPriorityNonPre.length - 1, ganttPriorityPre.length - 1, ganttRoundRobin.length - 1, ganttProposed.length - 1];
    for (i in cs) {
        if (i != cs.length - 1) {
            cpuUtil.push(ct[i] / (ct[i] + cs[i] - minArrivalTime));
            throughput.push(processes.length / (ct[i] - minArrivalTime + cs[i]));
        } else {
            cpuUtil.push(ct[i] / (ct[i] + cs[i]));
            throughput.push(processes.length / (ct[i] + cs[i]));
        }
    }
    let throughputRank = [];
    let cpuUtilRank = [];
    let wtRank = [];
    let tatRank = [];
    let rtRank = [];
    let rank = [];
    throughputRank = calculateRank(throughput, 0);
    cpuUtilRank = calculateRank(cpuUtil, 0);
    wtRank = calculateRank(wt, 1);
    tatRank = calculateRank(tat, 1);
    rtRank = calculateRank(rt, 1);

    let minRank = Number.MAX_VALUE;
    for (a in algorithms) {
        rank[a] = (wtRank[a] + tatRank[a] + cpuUtilRank[a] + throughputRank[a] + rtRank[a]) / 5;
        if (rank[a] < minRank)
            minRank = rank[a];
    }
    for (a in algorithms) {
        if (rank[a] === minRank) {
            bestAlgo.push({
                Algorithm: algorithms[a],
                CPU_Utilization: (cpuUtil[a] * 100).toFixed(2),
                Throughput: throughput[a].toFixed(2) + '(No of Process/Total time unit)',
                TurnAroundTime: tat[a].toFixed(2),
                Waiting_Time: wt[a].toFixed(2),
                Response_Time: rt[a].toFixed(2)
            });
        }
    }
}