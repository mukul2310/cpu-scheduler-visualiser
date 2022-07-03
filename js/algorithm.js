var readyQueue = [];
var arrangedReadyQueue = [];
var timeQuanta;
var stop_flag = false;

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
        readyQueue[p].f = 1.0 * ((3 * readyQueue[p].priority) + readyQueue[p].burstTimePriority) / 4;
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

function getProcessById(id) {
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

async function newProposed(flag) {
    readyQueueInit();
    let turnAroundTime = [];
    let waitingTime = [];
    let completionTime = [];
    let responseTime = [];
    let time = 0;
    if (flag) {
        $("#vis").removeAttr("hidden");
        $("#wq").removeAttr("hidden");
        $('html, body').animate({
            scrollTop: $("#vis").offset().top
        }, 0);
    }
    outer: while (readyQueue.length != 0) {
        calculateTimeQuanta();
        calculateBurstTimePriority();
        calculateF();
        calculateFRank();
        sortByFRank();
        $("#vis_wq").empty()
        $("#vis_rq").empty()
        while (arrangedReadyQueue.length != 0) {
            let vis_block = ""
            for (let process in arrangedReadyQueue) {
                vis_block += `<span class='fitem'>P${arrangedReadyQueue[process].id}</span>`
            }
            let p = arrangedReadyQueue.shift();
            prev_time = time;
            if (p.burst_time === getProcessById(p.id).burst_time) {
                //It means came for the first time
                responseTime[p.id] = prev_time;
            }
            if (p.burst_time > timeQuanta) {
                p.burst_time -= timeQuanta;
                time += timeQuanta;
                readyQueue.push(p);
                let vis_block = ""
                for (let process in readyQueue) {
                    vis_block += `<span class='fitem'>P${readyQueue[process].id}</span>`
                }
                if (flag) {
                    $("#vis_wq").empty().html(vis_block)
                }
            } else //completed
            {
                time += p.burst_time;
                completionTime[p.id] = time;
                let process = getProcessById(p.id);
                waitingTime[p.id] = completionTime[p.id] - process.burst_time;
            }
            if (flag) {
                $("#vis_name").empty().append("Proposed")
                $("#vis_rq").empty().html(vis_block)
                $("#vis_cpu").empty().html(`<span class='fitem'>P${p.id}</span>`)
                $("#vis_time").empty().append(time)
                $(".btn").attr("disabled", true)
                await new Promise(r => setTimeout(r, 2000));
                if (stop_flag)
                    break outer;
            }
            ganttProposed.push({
                processId: p.id,
                startTime: prev_time,
                endTime: time
            });
        }
    }
    $(".btn").removeAttr("disabled")
    stop_flag = false;
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

async function FCFS(flag) {
    readyQueueInit();
    let p, min;
    let turnAroundFCFS = [];
    let waitingFCFS = [];
    let processQueue = [];
    let time = 0;
    if (flag) {
        $("#wq").attr("hidden", true)
        $("#vis").removeAttr("hidden");
        $('html, body').animate({
            scrollTop: $("#vis").offset().top
        }, 0);
    }
    outer: while (readyQueue.length != 0) {
        for (let process in readyQueue) {
            if (readyQueue[process].arrival_time <= time) {
                processQueue.push(readyQueue[process]);
            }
        }
        if (processQueue.length === 0) {
            if (ganttFCFS.length > 0 && ganttFCFS[ganttFCFS.length - 1].processId != null) {
                ganttFCFS[ganttFCFS.length - 1].endTime = time;
                ganttFCFS.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            } else if (ganttFCFS.length == 0) {
                ganttFCFS.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            }
            time++;
            continue outer;
        }
        let vis_block = "";
        min = Number.MAX_VALUE;
        for (let process in processQueue) {
            vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`
            if (processQueue[process].arrival_time < min) {
                min = processQueue[process];
                p = process;
            }
        }
        if (flag) {
            $("#vis_name").empty().append("FCFS")
            $("#vis_rq").empty().html(vis_block)
            $("#vis_cpu").empty().html(`<span class='fitem'>P${processQueue[p].id}</span>`)
            $("#vis_time").empty().append(time)
            $(".btn").attr("disabled", true)
            await new Promise(r => setTimeout(r, 2000));
            if (stop_flag)
                break outer;
        }
        prev_time = time;
        time += processQueue[p].burst_time;
        turnAroundFCFS[processQueue[p].id] = time - processQueue[p].arrival_time;
        waitingFCFS[processQueue[p].id] = turnAroundFCFS[processQueue[p].id] - processQueue[p].burst_time;

        for (let pro in readyQueue) {
            if (readyQueue[pro].id === processQueue[p].id)
                readyQueue.splice(pro, 1);
        }

        if (ganttFCFS.length > 0) {
            ganttFCFS[ganttFCFS.length - 1].endTime = prev_time;
        }
        ganttFCFS.push({
            processId: processQueue[p].id,
            startTime: prev_time,
            endTime: time
        });
        processQueue.splice(0, processQueue.length);

    }
    $(".btn").removeAttr("disabled")
    stop_flag = false;
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

async function SJFNonPre(flag) {
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let turnAroundSJFNonPre = [];
    let waitingSJFNonPre = [];
    let processQueue = [];
    let time = 0;
    if (flag) {
        $("#wq").attr("hidden", true)
        $("#vis").removeAttr("hidden");
        $('html, body').animate({
            scrollTop: $("#vis").offset().top
        }, 0);
    }
    outer: while (readyQueue.length != 0) {
        for (let process in readyQueue) {
            if (readyQueue[process].arrival_time <= time)
                processQueue.push(readyQueue[process]);
        }

        if (processQueue.length === 0) {
            if (ganttSJFNonPre.length > 0 && ganttSJFNonPre[ganttSJFNonPre.length - 1].processId != null) {
                ganttSJFNonPre[ganttSJFNonPre.length - 1].endTime = time;
                ganttSJFNonPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            } else if (ganttSJFNonPre.length == 0) {
                ganttSJFNonPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            }
            time++;
            continue outer;
        }
        min = Number.MAX_VALUE;
        let vis_block = ""
        for (let process in processQueue) {
            vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`
            if (processQueue[process].burst_time < min) {
                min = processQueue[process].burst_time;
                p = process;
            }
        }
        if (flag) {
            $("#vis_name").empty().append("SJF (non pre)")
            $("#vis_rq").empty().html(vis_block)
            $("#vis_cpu").empty().html(`<span class='fitem'>P${processQueue[p].id}</span>`)
            $("#vis_time").empty().append(time)
            $(".btn").attr("disabled", true)
            await new Promise(r => setTimeout(r, 2000));
            if (stop_flag)
                break outer;
        }
        prev_time = time;
        time += processQueue[p].burst_time;
        if (ganttSJFNonPre.length > 0)
            ganttSJFNonPre[ganttSJFNonPre.length - 1].endTime = prev_time;
        ganttSJFNonPre.push({
            processId: processQueue[p].id,
            startTime: prev_time,
            endTime: time
        });
        turnAroundSJFNonPre[processQueue[p].id] = time - processQueue[p].arrival_time;
        waitingSJFNonPre[processQueue[p].id] = turnAroundSJFNonPre[processQueue[p].id] - processQueue[p].burst_time;
        for (pro in readyQueue) {
            if (readyQueue[pro].id === processQueue[p].id)
                readyQueue.splice(pro, 1);
        }
        processQueue.splice(0, processQueue.length);
    }
    $(".btn").removeAttr("disabled")
    stop_flag = false;
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

async function SJFPre(flag) {
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let turnAroundSJFPre = [];
    let waitingSJFPre = [];
    let responseSJFPre = [];
    let processQueue = [];
    let completionTime = [];
    let time = 0;
    if (flag) {
        $("#wq").attr("hidden", true)
        $("#vis").removeAttr("hidden");
        $('html, body').animate({
            scrollTop: $("#vis").offset().top
        }, 0);
    }
    outer: while (readyQueue.length != 0) {
        for (let process in readyQueue) {
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
        let vis_block = ""
        for (let process in processQueue) {
            vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`
            if (processQueue[process].burst_time < min) {
                min = processQueue[process].burst_time;
                p = process;
            }
        }
        if (flag) {
            $("#vis_name").empty().append("SJF (pre)")
            $("#vis_rq").empty().html(vis_block)
            $("#vis_cpu").empty().html(`<span class='fitem'>P${processQueue[p].id}</span>`)
            $("#vis_time").empty().append(time)
            $(".btn").attr("disabled", true)
            await new Promise(r => setTimeout(r, 2000));
            if (stop_flag)
                break outer;
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
        if (processQueue[p].burst_time === getProcessById(processQueue[p].id).burst_time) {
            //It means came for the first time
            responseSJFPre[processQueue[p].id] = prev_time - processQueue[p].arrival_time;
        }
        processQueue[p].burst_time--;
        if (processQueue[p].burst_time == 0) {
            completionTime[processQueue[p].id] = time;
            for (let process in readyQueue) {
                if (readyQueue[process].id == processQueue[p].id) {
                    readyQueue.splice(process, 1);
                }
            }
        }
        processQueue.splice(p, processQueue.length);
    }
    $(".btn").removeAttr("disabled")
    stop_flag = false;
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

async function priorityNonPre(flag) {
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let processQueue = [];
    let turnAroundPriorityNonPre = [];
    let waitingPriorityNonPre = [];
    let time = 0;
    if (flag) {
        $("#wq").attr("hidden", true)
        $("#vis").removeAttr("hidden");
        $('html, body').animate({
            scrollTop: $("#vis").offset().top
        }, 0);
    }
    outer: while (readyQueue.length != 0) {
        for (let process in readyQueue) {
            if (readyQueue[process].arrival_time <= time) {
                processQueue.push(readyQueue[process]);
            }
        }
        if (processQueue.length === 0) {
            if (ganttPriorityNonPre.length > 0 && ganttPriorityNonPre[ganttPriorityNonPre.length - 1].processId != null) {
                ganttPriorityNonPre[ganttPriorityNonPre.length - 1].endTime = time;
                ganttPriorityNonPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            } else if (ganttPriorityNonPre.length == 0) {
                ganttPriorityNonPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            }
            time++;
            continue;
        }
        min = Number.MAX_VALUE;
        let vis_block = ""
        for (let process in processQueue) {
            vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`
            if (processQueue[process].priority < min) {
                min = processQueue[process].priority;
                p = process;
            }
        }
        if (flag) {
            $("#vis_name").empty().append("Priority (non pre)")
            $("#vis_rq").empty().html(vis_block)
            $("#vis_cpu").empty().html(`<span class='fitem'>P${processQueue[p].id}</span>`)
            $("#vis_time").empty().append(time)
            $(".btn").attr("disabled", true)
            await new Promise(r => setTimeout(r, 2000));
            if (stop_flag)
                break outer;
        }
        prev_time = time;
        time += processQueue[p].burst_time;
        if (ganttPriorityNonPre.length > 0)
            ganttPriorityNonPre[ganttPriorityNonPre.length - 1].endTime = prev_time;
        ganttPriorityNonPre.push({
            processId: processQueue[p].id,
            startTime: prev_time,
            endTime: time
        });
        turnAroundPriorityNonPre[processQueue[p].id] = time - processQueue[p].arrival_time;
        waitingPriorityNonPre[processQueue[p].id] = turnAroundPriorityNonPre[processQueue[p].id] - processQueue[p].burst_time;
        for (pro in readyQueue) {
            if (readyQueue[pro].id === processQueue[p].id)
                readyQueue.splice(pro, 1);
        }
        processQueue.splice(0, processQueue.length);
    }
    $(".btn").removeAttr("disabled")
    stop_flag = false;
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

async function priorityPre(flag) {
    readyQueueInit();
    let min = Number.MAX_VALUE;
    let p;
    let turnAroundPriorityPre = [];
    let waitingPriorityPre = [];
    let responsePriorityPre = [];
    let processQueue = [];
    let completionTime = [];
    let time = 0;
    if (flag) {
        $("#wq").attr("hidden", true)
        $("#vis").removeAttr("hidden");
        $('html, body').animate({
            scrollTop: $("#vis").offset().top
        }, 0);
    }
    outer: while (readyQueue.length != 0) {
        for (let process in readyQueue) {
            if (readyQueue[process].arrival_time <= time)
                processQueue.push(readyQueue[process]);
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
        let vis_block = "";
        for (let process in processQueue) {
            vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`
            if (processQueue[process].priority < min) {
                min = processQueue[process].priority;
                p = process;
            }
        }
        if (flag) {
            $("#vis_name").empty().append("Priority (pre)")
            $("#vis_rq").empty().html(vis_block)
            $("#vis_cpu").empty().html(`<span class='fitem'>P${processQueue[p].id}</span>`)
            $("#vis_time").empty().append(time)
            $(".btn").attr("disabled", true)
            await new Promise(r => setTimeout(r, 2000));
            if (stop_flag)
                break outer;
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
        if (processQueue[p].burst_time === getProcessById(processQueue[p].id).burst_time) {
            //It means came for the first time
            responsePriorityPre[processQueue[p].id] = prev_time - processQueue[p].arrival_time;
        }
        let index;
        for (pro in readyQueue) {
            if (readyQueue[pro].id === processQueue[p].id)
                index = pro;
        }
        processQueue[p].burst_time--;
        if (processQueue[p].burst_time === 0) {
            completionTime[processQueue[p].id] = time;
            readyQueue.splice(index, 1);
        }
        processQueue.splice(0, processQueue.length);
    }
    $(".btn").removeAttr("disabled")
    stop_flag = false;
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

async function roundRobin(flag1) {
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
    if (flag1) {
        $("#wq").attr("hidden", true)
        $("#vis").removeAttr("hidden");
        $('html, body').animate({
            scrollTop: $("#vis").offset().top
        }, 0);
    }
    // getting the initial processes in to the process queue
    while (true) {
        if (readyQueue.length == 0)
            break;
        for (let process in readyQueue) {
            if (readyQueue[process].arrival_time <= time) {
                processQueue.push(readyQueue[process]);
            }
        }
        if (processQueue.length === 0) {
            if (ganttRoundRobin.length > 0 && ganttRoundRobin[ganttRoundRobin.length - 1].processId != null) {
                ganttRoundRobin[ganttRoundRobin.length - 1].endTime = time;
                ganttRoundRobin.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            } else if (ganttRoundRobin.length == 0) {
                ganttRoundRobin.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            }
            time++;
            continue;
        }

        break;
    }
    //then one by one all the processes
    outer: while (processQueue.length != 0) {
        prev_time = time;
        let currentProcess = processQueue[0];

        if (currentProcess.burst_time === getProcessById(currentProcess.id).burst_time) {
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
            for (let process in readyQueue) {
                if (readyQueue[process].id == currentProcess.id) {
                    readyQueue.splice(process, 1);
                    break;
                }
            }
        }
        let vis_block = ""
        for (let process in processQueue)
            vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`
        if (flag1) {
            $("#vis_name").empty().append("Round Robin")
            $("#vis_rq").empty().html(vis_block)
            $("#vis_cpu").empty().html(`<span class='fitem'>P${currentProcess.id}</span>`)
            $("#vis_time").empty().append(time)
            $(".btn").attr("disabled", true)
            await new Promise(r => setTimeout(r, 2000));
            if (stop_flag)
                break outer;
        }
        if (ganttRoundRobin.length > 0)
            ganttRoundRobin[ganttRoundRobin.length - 1].endTime = prev_time;
        ganttRoundRobin.push({
            processId: currentProcess.id,
            startTime: prev_time,
            endTime: time
        });
        //Taking remaining process and pushing them in running queue
        while (true) {
            if (readyQueue.length == 0)
                break;
            for (let process in readyQueue) {
                if (readyQueue[process].arrival_time <= time) {
                    runningQueue.push(readyQueue[process]);
                }
            }
            if (runningQueue.length === 0) {
                if (ganttRoundRobin.length > 0 && ganttRoundRobin[ganttRoundRobin.length - 1].processId != null) {
                    ganttRoundRobin[ganttRoundRobin.length - 1].endTime = time;
                    ganttRoundRobin.push({
                        processId: null,
                        startTime: time,
                        endTime: time + 1
                    });
                } else if (ganttRoundRobin.length == 0) {
                    ganttRoundRobin.push({
                        processId: null,
                        startTime: time,
                        endTime: time + 1
                    });
                }
                time++;
                continue;
            }
            // now taking those processes from running queue to process queue which has minimum arrival time
            while (runningQueue.length != 0) {
                min = Number.MAX_VALUE;
                for (let process in runningQueue) {
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
    $(".btn").removeAttr("disabled")
    stop_flag = false;
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

async function LJFNonPre(flag) {
    readyQueueInit();
    let max = Number.MIN_VALUE;
    let p;
    let turnAroundLJFNonPre = [];
    let waitingLJFNonPre = [];
    let processQueue = [];
    let time = 0;
    if (flag) {
        $("#wq").attr("hidden", true)
        $("#vis").removeAttr("hidden");
        $('html, body').animate({
            scrollTop: $("#vis").offset().top
        }, 0);
    }
    outer: while (readyQueue.length != 0) {
        for (let process in readyQueue) {
            if (readyQueue[process].arrival_time <= time)
                processQueue.push(readyQueue[process]);
        }

        if (processQueue.length == 0) {
            if (ganttLJFNonPre.length > 0 && ganttLJFNonPre[ganttLJFNonPre.length - 1].processId != null) {
                ganttLJFNonPre[ganttLJFNonPre.length - 1].endTime = time;
                ganttLJFNonPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            } else if (ganttLJFNonPre.length == 0) {
                ganttLJFNonPre.push({
                    processId: null,
                    startTime: time,
                    endTime: time + 1
                });
            }
            time++;
            continue outer;
        }
        max = Number.MIN_VALUE;
        let vis_block = ""
        for (let process in processQueue) {
            vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`
            if (processQueue[process].burst_time > max) {
                max = processQueue[process].burst_time;
                p = process;
            }
        }
        if (flag) {
            $("#vis_name").empty().append("LJF (non pre)")
            $("#vis_rq").empty().html(vis_block)
            $("#vis_cpu").empty().html(`<span class='fitem'>P${processQueue[p].id}</span>`)
            $("#vis_time").empty().append(time)
            $(".btn").attr("disabled", true)
            await new Promise(r => setTimeout(r, 2000));
            if (stop_flag)
                break outer;
        }
        prev_time = time;
        time += processQueue[p].burst_time;
        if (ganttLJFNonPre.length > 0)
            ganttLJFNonPre[ganttLJFNonPre.length - 1].endTime = prev_time;
        ganttLJFNonPre.push({
            processId: processQueue[p].id,
            startTime: prev_time,
            endTime: time
        });
        turnAroundLJFNonPre[processQueue[p].id] = time - processQueue[p].arrival_time;
        waitingLJFNonPre[processQueue[p].id] = turnAroundLJFNonPre[processQueue[p].id] - processQueue[p].burst_time;
        for (pro in readyQueue) {
            if (readyQueue[pro].id === processQueue[p].id)
                readyQueue.splice(pro, 1);
        }
        processQueue.splice(0, processQueue.length);
    }
    $(".btn").removeAttr("disabled")
    stop_flag = false;
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

async function LJFPre(flag) {
    readyQueueInit();
    let max = Number.MIN_VALUE;
    let p;
    let turnAroundLJFPre = [];
    let waitingLJFPre = [];
    let responseLJFPre = [];
    let processQueue = [];
    let completionTime = [];
    let time = 0;
    if (flag) {
        $("#wq").attr("hidden", true)
        $("#vis").removeAttr("hidden");
        $('html, body').animate({
            scrollTop: $("#vis").offset().top
        }, 0);
    }
    outer: while (readyQueue.length != 0) {
        for (let process in readyQueue) {
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
        let vis_block = ""
        for (let process in processQueue) {
            vis_block += `<span class='fitem'>P${processQueue[process].id}</span>`
            if (processQueue[process].burst_time > max) {
                max = processQueue[process].burst_time;
                p = process;
            }
        }
        if (flag) {
            $("#vis_name").empty().append("LJF (pre)")
            $("#vis_rq").empty().html(vis_block)
            $("#vis_cpu").empty().html(`<span class='fitem'>P${processQueue[p].id}</span>`)
            $("#vis_time").empty().append(time)
            $(".btn").attr("disabled", true)
            await new Promise(r => setTimeout(r, 2000));
            if (stop_flag)
                break outer;
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
        if (processQueue[p].burst_time === getProcessById(processQueue[p].id).burst_time) {
            //It means came for the first time
            responseLJFPre[processQueue[p].id] = prev_time - processQueue[p].arrival_time;
        }
        processQueue[p].burst_time--;
        if (processQueue[p].burst_time == 0) {
            completionTime[processQueue[p].id] = time;
            for (let process in readyQueue) {
                if (readyQueue[process].id == processQueue[p].id) {
                    readyQueue.splice(process, 1);
                }
            }
        }
        processQueue.splice(p, processQueue.length);
    }
    $(".btn").removeAttr("disabled")
    stop_flag = false;
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
    header = "";
    for (head in resultHeaders) {
        header += "<th>" + resultHeaders[head] + "</th>";
    }
    $("#result_table").append(`<thead><tr>${header}</tr></thead>`)
    data = "";
    for (r in results) {
        let row = "";
        for (obj in results[r]) {
            row += "<td>" + results[r][obj] + "</td>";
        }
        data += "<tr>" + row + "</tr>";
    }
    $("#result_table").append(`<tbody>${data}</tbody>`);
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
    $("#result_table").empty();
    createResultTable();
}

function displayGanttChart() {
    for (i in ganttFCFS) {
        let diff = ganttFCFS[i].endTime - ganttFCFS[i].startTime + 80;
        if (ganttFCFS[i].processId != null)
            $("#gantt_FCFS").append(`<div class="gantt-box" style="width: ${diff}px"><span class="gantt-box-left">${ganttFCFS[i].startTime}</span>P${ganttFCFS[i].processId}<span class="gantt-box-right">${ganttFCFS[i].endTime}<span></div>`);
        else
            $("#gantt_FCFS").append(`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttFCFS[i].startTime}</span><span class="gantt-box-right">${ganttFCFS[i].endTime}<span></div>`);
    }
    for (i in ganttSJFNonPre) {
        let diff = ganttSJFNonPre[i].endTime - ganttSJFNonPre[i].startTime + 80;
        if (ganttSJFNonPre[i].processId != null)
            $("#gantt_SJFNonPre").append(`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttSJFNonPre[i].startTime}</span>P${ganttSJFNonPre[i].processId}<span class="gantt-box-right">${ganttSJFNonPre[i].endTime}<span></div>`);
        else
            $("#gantt_SJFNonPre").append(`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttSJFNonPre[i].startTime}</span><span class="gantt-box-right">${ganttSJFNonPre[i].endTime}<span></div>`);
    }
    for (i in ganttSJFPre) {
        let diff = ganttSJFPre[i].endTime - ganttSJFPre[i].startTime + 80;
        if (ganttSJFPre[i].processId != null)
            $("#gantt_SJFPre").append(`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttSJFPre[i].startTime}</span>P${ganttSJFPre[i].processId}<span class="gantt-box-right">${ganttSJFPre[i].endTime}<span></div>`);
        else
            $("#gantt_SJFPre").append(`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttSJFPre[i].startTime}</span><span class="gantt-box-right">${ganttSJFPre[i].endTime}<span></div>`);
    }
    for (i in ganttLJFNonPre) {
        let diff = ganttLJFNonPre[i].endTime - ganttLJFNonPre[i].startTime + 80;
        if (ganttLJFNonPre[i].processId != null)
            $("#gantt_LJFNonPre").append(`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttLJFNonPre[i].startTime}</span>P${ganttLJFNonPre[i].processId}<span class="gantt-box-right">${ganttLJFNonPre[i].endTime}<span></div>`);
        else
            $("#gantt_LJFNonPre").append(`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttLJFNonPre[i].startTime}</span><span class="gantt-box-right">${ganttLJFNonPre[i].endTime}<span></div>`);
    }
    for (i in ganttLJFPre) {
        let diff = ganttLJFPre[i].endTime - ganttLJFPre[i].startTime + 80;
        if (ganttLJFPre[i].processId != null)
            $("#gantt_LJFPre").append(`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttLJFPre[i].startTime}</span>P${ganttLJFPre[i].processId}<span class="gantt-box-right">${ganttLJFPre[i].endTime}<span></div>`);
        else
            $("#gantt_LJFPre").append(`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttLJFPre[i].startTime}</span><span class="gantt-box-right">${ganttLJFPre[i].endTime}<span></div>`);
    }
    for (i in ganttPriorityNonPre) {
        let diff = ganttPriorityNonPre[i].endTime - ganttPriorityNonPre[i].startTime + 80;
        if (ganttPriorityNonPre[i].processId != null)
            $("#gantt_PriorityNonPre").append(`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttPriorityNonPre[i].startTime}</span>P${ganttPriorityNonPre[i].processId}<span class="gantt-box-right">${ganttPriorityNonPre[i].endTime}<span></div>`);
        else
            $("#gantt_PriorityNonPre").append(`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttPriorityNonPre[i].startTime}</span><span class="gantt-box-right">${ganttPriorityNonPre[i].endTime}<span></div>`);
    }
    for (i in ganttPriorityPre) {
        let diff = ganttPriorityPre[i].endTime - ganttPriorityPre[i].startTime + 80;
        if (ganttPriorityPre[i].processId != null)
            $("#gantt_PriorityPre").append(`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttPriorityPre[i].startTime}</span>P${ganttPriorityPre[i].processId}<span class="gantt-box-right">${ganttPriorityPre[i].endTime}<span></div>`);
        else
            $("#gantt_PriorityPre").append(`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttPriorityPre[i].startTime}</span><span class="gantt-box-right">${ganttPriorityPre[i].endTime}<span></div>`);
    }
    for (i in ganttRoundRobin) {
        let diff = ganttRoundRobin[i].endTime - ganttRoundRobin[i].startTime + 80;
        if (ganttRoundRobin[i].processId != null)
            $("#gantt_RoundRobin").append(`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttRoundRobin[i].startTime}</span>P${ganttRoundRobin[i].processId}<span class="gantt-box-right">${ganttRoundRobin[i].endTime}<span></div>`);
        else
            $("#gantt_RoundRobin").append(`<div class="gantt-box" style="background-color: #58D68D; width: ${diff}px"><span class="gantt-box-left">${ganttRoundRobin[i].startTime}</span><span class="gantt-box-right">${ganttRoundRobin[i].endTime}<span></div>`);
    }
    for (i in ganttProposed) {
        let diff = ganttProposed[i].endTime - ganttProposed[i].startTime + 80;
        if (ganttProposed[i].processId != null)
            $("#gantt_Proposed").append(`<div class="gantt-box" style="width:${diff}px"><span class="gantt-box-left">${ganttProposed[i].startTime.toFixed(1)}</span>P${ganttProposed[i].processId}<span class="gantt-box-right">${ganttProposed[i].endTime.toFixed(1)}<span></div>`);
    }
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

function findBest(checked) {
    //calculate max CPU utilization
    //calculate min wt
    // calculate min tat
    // calculate max through put
    // cs is context switching
    let algorithms = ["FCFS", "SJF", "SJF(Preemptive)", "LJF", "LJF(Preemptive)", "Priority", "Priority(Preemptive)", "Round Robin", "Proposed Algorithm"];
    let wt = [avgWaitingTimeFCFS, avgWaitingTimeSJFNonPre, avgWaitingTimeSJFPre, avgWaitingTimeLJFNonPre, avgWaitingTimeLJFPre, avgWaitingTimePriorityNonPre, avgWaitingTimePriorityPre, avgWaitingTimeRoundRobin, avgWaitingTimeNew];
    let tat = [avgTurnaroundTimeFCFS, avgTurnaroundTimeSJFNonPre, avgTurnaroundTimeSJFPre, avgTurnaroundTimeLJFNonPre, avgTurnaroundTimeLJFPre, avgTurnaroundTimePriorityNonPre, avgTurnaroundTimePriorityPre, avgTurnaroundTimeRoundRobin, avgTurnAroundTimeNew];
    let rt = [avgResponseTimeFCFS, avgResponseTimeSJFNonPre, avgResponseTimeSJFPre, avgResponseTimeLJFNonPre, avgResponseTimeLJFPre, avgResponseTimePriorityNonPre, avgResponseTimePriorityPre, avgResponseTimeRoundRobin, avgResponseTimeNew];
    let ct = [completionTimeFCFS, completionTimeSJF, completionTimeSJFPre, completionTimeLJF, completionTimeLJFPre, completionTimePriority, completionTimePriorityPre, completionTimeRoundRobin, completionTimeNew];
    let cs = [ganttFCFS.length - 1, ganttSJFNonPre.length - 1, ganttSJFPre.length - 1, ganttLJFNonPre.length - 1, ganttLJFPre.length - 1, ganttPriorityNonPre.length - 1, ganttPriorityPre.length - 1, ganttRoundRobin.length - 1, ganttProposed.length - 1];
    let cpuUtil = [];
    let throughput = [];
    let minArrivalTime = Number.MAX_VALUE;
    for (p in processes) {
        if (processes[p].arrival_time < minArrivalTime)
            minArrivalTime = processes[p].arrival_time;
    }
    for (i in cs) {
        if (i != cs.length - 1) {
            cpuUtil.push(ct[i] / (ct[i] + cs[i]));
            throughput.push(processes.length / (ct[i] + cs[i] - minArrivalTime));
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
        if (checked[a]) {
            rank[a] = (wtRank[a] + tatRank[a] + cpuUtilRank[a] + throughputRank[a] + rtRank[a]) / 5;
            if (rank[a] < minRank)
                minRank = rank[a];
        }
    }
    for (a in algorithms) {
        if (checked[a] && rank[a] === minRank) {
            bestAlgo.push({
                algorithm: algorithms[a],
                cpu_util: (cpuUtil[a] * 100).toFixed(2) + " %",
                throughput: (throughput[a] * 100).toFixed(2) + " % (Process per unit time)",
                tat: tat[a].toFixed(2),
                wt: wt[a].toFixed(2),
                rt: rt[a].toFixed(2)
            });
        }
    }
}