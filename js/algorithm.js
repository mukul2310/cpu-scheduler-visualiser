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
var duplicate=[];
var completionTime=[];
var readyQueue=[];
var arrangedReadyQueue=[];
var timeQuanta;
var turnAroundTime=[];
var waitingTime=[];
var time=0;
function readyQueueInit()
{
    for(i=0;i<processes.length;i++)
    {
        let copiedProcess = Object.assign({}, processes[i]);
        readyQueue[i]=copiedProcess;
    }
}
//formula1
function calculateTimeQuanta()
{
    let sum,quanta,temp;
    if(readyQueue.length!=0)
    {
        let max=-1;
        sum=0;
        for (let i= 0; i < readyQueue.length; i++)
        {
            temp=readyQueue[i].burst_time;
            sum+=temp;
            if(temp>max)
                max=temp;
        }
        timeQuanta= Math.sqrt(1.0*sum/readyQueue.length*max);
    }
    else
    {
        timeQuanta=0;
    }
}

function calculateBurstTimePriority()
    {
        let i=0,n= readyQueue.length, j,k,count=0;
        let duplicate=[];
        let flag=[];
        for (i = 0; i < readyQueue.length; i++)
        {
            duplicate[count] = readyQueue[i].burst_time;
            count++;
        }

        duplicate.sort(function(a, b) {
            return a - b;
          });
        
        for (i = 0; i < readyQueue.length; i++)
        {
            // let p1= readyQueue[i];
            for(j=0;j<n;j++)
            {
                if(readyQueue[i].burst_time==duplicate[j]&&!flag[j])
                {
                    readyQueue[i].burstTimePriority = j+1;
                    flag[j]=true;
                    break;
                }
            }
        }

    }

//formula2
function calculateF()
{
    for (i = 0; i < readyQueue.length; i++)
    {
        readyQueue[i].f= (1.0*(3*readyQueue[i].priority+readyQueue[i].burstTimePriority)/4);
    }
}

    function calculateFRank()
    {
        let i=0,n= readyQueue.length, j,k,count=0;
        let p;
        let min;
        let flag=[];
//        int b[]=new int[n];
        for (i = 0; i < readyQueue.length; i++)
        {
            duplicate[count] = readyQueue[i].f;
//            index[count]=count+1;
            count++;
        }
        duplicate.sort(function(a, b) {
            return a - b;
          });
        for (i = 0; i < readyQueue.length; i++)
        {
            for(j=0;j<n;j++)
            {
                if(readyQueue[i].f==duplicate[j]&&!flag[j])
                {
                    readyQueue[i].fRank = j+1;
                    flag[j]=true;
                    break;
                }
            }
        }
    }
    function sortByFRank()
    {
        let i,j,minRank;
        let process;
        while (readyQueue.length!=0)
        {
            minRank=Number.MAX_VALUE;
            for (i = 0; i < readyQueue.length; i++)
                if (readyQueue[i].fRank < minRank)
                {
                    minRank = readyQueue[i].fRank;
                    process = readyQueue[i];
                    j=i;
                }
            arrangedReadyQueue.push(process);
            readyQueue.splice(j,1);
        }
    }
    function getProcess(id)
    {
        for(p in processes)
        {
            if(processes[p].id==id)
            {
                return processes[p];
            }
        }
    }
   function customizedRoundRobin()
    {
        readyQueueInit();
        while(readyQueue.length!=0)
        {
            calculateTimeQuanta();
            calculateBurstTimePriority();
            calculateF();
            calculateFRank();
            sortByFRank();
            while (arrangedReadyQueue.length!=0)
            {
                let p=arrangedReadyQueue.shift();
                if(p.burst_time>timeQuanta)
                {
                    p.burst_time-=timeQuanta;
                    time+=timeQuanta;
                    readyQueue.push(p);
                }
                else
                {
                    //completed
                    time+=p.burst_time;
                    completionTime[p.id]=time;
                    let process=getProcess(p.id);
                    waitingTime[p.id]=completionTime[p.id]-process.burst_time;
                }
            }
        }
        for(i=0;i<completionTime.length;i++)
        {
            turnAroundTime[i]=completionTime[i];
        }
        var avgWaitingTimeNew=calculateAvgTime(waitingTime);
        var avgTurnAroundTimeNew=calculateAvgTime(turnAroundTime);
        
        console.log("New WT "+avgWaitingTimeNew);
        console.log("New TAT "+avgTurnAroundTimeNew);
    }
    function calculateAvgTime(waitingTime)
    {
        let avg=0;
        for(i=1;i<waitingTime.length;i++)
        {
            avg+=waitingTime[i];
        }
        return avg/(waitingTime.length-1);
    }
    
//        while(!queue.isEmpty())
//        {
//            int currentProcess=queue.poll();
//            if(currentProcess>timeQuanta)
//                substituteQueue.add(currentProcess-timeQuanta);
//        }
//        queue=substituteQueue;
//        System.out.println(timeQuanta+" "+queue);
    // public static void displayReadyQueue()
    // {
    //     System.out.println();
    //     Iterator<Process> itr=readyQueue.iterator();
    //     while(itr.hasNext())
    //         System.out.print(itr.next().burstTime+" ");
    // }
    // static class GanttChart
    // {
    //     int arrivalTime;
    //     int processId;
    //     int completionTime;

    //     public GanttChart(int arrivalTime, int processId, int completionTime)
    //     {
    //         this.arrivalTime = arrivalTime;
    //         this.processId = processId;
    //         this.completionTime = completionTime;
    //     }
    // }
    
    function FCFS()
    {
        var avgWaitingTimeFCFS,avgTurnaroundTimeFCFS;
        let i,currentTime=0;
        // let readyQueueFCFS=[];
        readyQueueInit();
        // var arrivalTimeSorted[]=new int[process.length];
        // boolean flag[]=new boolean[process.length];
        // int burstLength=0;
        let min=Number.MAX_VALUE;
        let p;
        let turnAroundFCFS=[];
        let waitingFCFS=[];
        let time=0;
        outer:while(readyQueue.length!=0)
        {
            min=Number.MAX_VALUE;
            p=-1;
            for(process in readyQueue)
            {
                if(readyQueue[process].arrival_time<min)
                {
                        min = readyQueue[process].arrival_time;
                        p=process;
                        //    pId=p.id;
                    //    burstLength= (int) p.burstTime;
                }
            }
            
            if(readyQueue[p].arrival_time>time)
            {
                time++;
                continue outer;
            }
            time+=readyQueue[p].burst_time;
            turnAroundFCFS[readyQueue[p].id]=time-readyQueue[p].arrival_time;
            waitingFCFS[readyQueue[p].id]=turnAroundFCFS[readyQueue[p].id]-readyQueue[p].burst_time;
            readyQueue.splice(p,1);
            avgTurnaroundTimeFCFS=calculateAvgTime(turnAroundFCFS);
            avgWaitingTimeFCFS=calculateAvgTime(waitingFCFS);
        }
        console.log("FCFS WT "+avgWaitingTimeFCFS);
        console.log("FCFS TAT "+avgTurnaroundTimeFCFS);        
    }
    function SJFNonPre()
    {
        var avgWaitingTimeSJFNonPre,avgTurnaroundTimeSJFNonPre;
        readyQueueInit();
        // int currentTime=0,pId=0,burstLength=0,minBurstTime=0,min=0;
        // float averageWaitingTime=0,averageTurnaroundTime=0;
        // int prevTime=0;
        // boolean flag[]=new boolean[process.length];
        // Queue<GanttChart> ganttChart=new LinkedList<>();
        // for(i=0;i< process.length;i++)
        // {
        //     for(p in process)
        //     {
        //         min=Integer.MAX_VALUE;
        //         if(p.arrivalTime<=currentTime&&!flag[p.id])
        //         {
        //             if(p.burstTime<minBurstTime)
        //             {
        //                 min = p.arrivalTime;
        //                 minBurstTime= p.burstTime;
        //                 pId=p.id;
        //                 burstLength= p.burstTime;
        //             }
        //         }
        //     }
        //     if(prevTime==currentTime)
        //     {
        //         currentTime++;
        //         continue;
        //     }
        //     prevTime=currentTime;
        //     flag[pId]=true;
        //     ganttChart.add(new GanttChart(min,pId,burstLength+currentTime));
        //     averageTurnaroundTime+=burstLength+currentTime-min;
        //     averageWaitingTime+=currentTime-min;
        //     currentTime+=burstLength;
        // }
        // averageTurnaroundTime/= process.length;
        // averageWaitingTime/= process.length;
        let min=Number.MAX_VALUE;
        let p;
        let turnAroundSJFNonPre=[];
        let waitingSJFNonPre=[];
        let processQueue=[];
        let time=0;
        outer:while(readyQueue.length!=0)
        {
            for(process in readyQueue)
            {
                if(readyQueue[process].arrival_time<=time)
                    processQueue.push(readyQueue[process]);
            }
            
            if(processQueue.length==0)
            {
                time++;
                continue outer;
            }
            min=Number.MAX_VALUE;
            for(process in processQueue)
            {
                if(processQueue[process].burst_time<min)
                {
                    min=processQueue[process].burst_time;
                    p=process;
                }
            }
            time+=processQueue[p].burst_time;
            turnAroundSJFNonPre[readyQueue[p].id]=time-processQueue[p].arrival_time;
            waitingSJFNonPre[readyQueue[p].id]=turnAroundSJFNonPre[readyQueue[p].id]-readyQueue[p].burst_time;
            readyQueue.splice(p,1);
            avgTurnaroundTimeFCFS=calculateAvgTime(turnAroundFCFS);
            avgWaitingTimeFCFS=calculateAvgTime(waitingFCFS);
        }
        console.log("SJF non pre WT "+avgWaitingTimeFCFS);
        console.log("SJF non pre TAT "+avgTurnaroundTimeFCFS);        
    
    }
    function SJFPre()
    {

    }
    /*
    public static void priority()
    {
        int sum=0,currentTime=0,prevTime=0,min,pId=0,minPriority = 0;
        int averageTurnaroundTime = 0,averageWaitingTime=0;
        for(Process p:process)
            sum+=p.burstTime;
        int ganttChart[]=new int[sum];
        int burstLength[]=new int[process.length];
        int completionTime[]=new int[process.length];
        for(int i=0;i<process.length;i++)
            completionTime[i]=-1;
        for(int i=0;i<sum;i++)
        {
            for(Process p:process)
            {
                min=Integer.MAX_VALUE;
                if(p.arrivalTime<=currentTime&&burstLength[p.id]<p.burstTime)
                {
                    if(p.priority<minPriority)
                    {
                        min = p.arrivalTime;
                        minPriority=p.priority;
                        pId=p.id;
                    }
                }
            }
            if(prevTime==currentTime)
            {
                currentTime++;
                ganttChart[i]=-1;
                continue;
            }
            prevTime=currentTime;
            burstLength[pId]++;
            ganttChart[i]=pId;
            currentTime++;
        }
        for(int i=sum-1;i>=0;i--)
        {
            if(completionTime[ganttChart[i]]==-1)
                completionTime[ganttChart[i]]=i;
        }
        for(int i=0;i<process.length;i++)
        {
            averageTurnaroundTime+=completionTime[i]-process[i].arrivalTime;
            averageWaitingTime+=completionTime[i]-process[i].arrivalTime-process[i].burstTime;
        }
    }
    public static void roundRobin()
    {
        System.out.println("Enter the time quanta for round robin scheduling");
        int timeQuanta= sc.nextInt(),currentTime=0,prevTime=0,min;
        Queue<Process> readyQueue=new LinkedList<>();
        Queue<GanttChart> runningQueue=new LinkedList<>();
        int[] burstLength =new int[process.length];
        int pId=0;
        int[] waitingTime =new int[process.length];
        int[] turnAroundTime =new int[process.length];
        int[] completionTime =new int[process.length];
        min=Integer.MAX_VALUE;
        for(Process p:process)
            burstLength[p.id]= (int) p.burstTime;
        boolean flag=true;
        while(flag)
        {
            flag=false;
            min=Integer.MAX_VALUE;
            for(Process p:process)
            {
                if(p.arrivalTime<min&&burstLength[p.id]>0)
                {
                    pId=p.id;
                    min=p.arrivalTime;
                }
            }
            if(burstLength[pId]>timeQuanta)
            {
                burstLength[pId] -= timeQuanta;
                completionTime[pId]+=timeQuanta;
            }
            else if(burstLength[pId]>0)
            {

                completionTime[pId]+=burstLength[pId];
                burstLength[pId] = 0;
            }
            for(int i=0;i< process.length;i++)
                if(burstLength[i]>0)
                    flag=true;

        }
        for (Process p:process)
        {
            turnAroundTime[p.id]= completionTime[p.id]-p.arrivalTime;
            waitingTime[p.id]= (int) (turnAroundTime[p.id]-p.burstTime);
        }
//        for(Process p: process)
//        {
//            burstLength[p.id]=(int) p.burstTime;
//            if(p.arrivalTime<=currentTime)
//            {
//                if(p.arrivalTime<)
//            }
//                readyQueue.add(p);
//        }
//
//        if(currentTime==prevTime)
//        {
//            currentTime++;
//            continue;
//        }
//        prevTime=currentTime;
//        currentTime+=timeQuanta;
//
    }
//    public static void FCFSwArrivalTime(int arrivalTime[])
//    {
//        int waitingTime,turnaroundTime;
//        int i;
//
//    }
    public static void main(String[] args)
    {
        int n;
        float timeQuanta;
        currentBurstTime=0;
        System.out.println("Enter no. of processes");
        n=sc.nextInt();
        process=new Process[n];
        completionTime=new int[n];
        input(n);
        int avgWaitingTime,avgTurnaroundTime;
        while (!readyQueue.isEmpty())
        {
            calculateBurstTimePriority();
            calculateF();
            calculateFRank();
            display();
            timeQuanta = timeQuanta();
            System.out.println("Time Quanta = "+timeQuanta);
            sortByFRank();
//           displayReadyQueue();
            customizedRoundRobin(timeQuanta);
        }
        avgWaitingTime

    }
}
*/