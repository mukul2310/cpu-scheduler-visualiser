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
function readyQueueInit()
{
    readyQueue=processes;
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
   function customizedRoundRobin(timeQuanta)
    {
//        readyQueue.clear();
        let prev=0;
        while (arrangedReadyQueue.length!=0)
        {
            let p=arrangedReadyQueue.shift();
            if(p.burstTime>timeQuanta)
            {
                p.burstTime-=timeQuanta;
                prev+=timeQuanta;
                readyQueue.add(p);
//                completionTime[p.id]+=prev;
            }
            else
            {
                prev+=p.burstTime;
                // completionTime[p.id]=prev;
            }
        }
//        while(!queue.isEmpty())
//        {
//            int currentProcess=queue.poll();
//            if(currentProcess>timeQuanta)
//                substituteQueue.add(currentProcess-timeQuanta);
//        }
//        queue=substituteQueue;
//        System.out.println(timeQuanta+" "+queue);
    }
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
    /*
    function FCFS()
    {
        var averageWaitingTime=0,averageTurnaroundTime=0;
        var i,currentTime=0;
        Queue<GanttChart> ganttChart=new LinkedList<>();
        var arrivalTimeSorted[]=new int[process.length];
        boolean flag[]=new boolean[process.length];
        int burstLength=0;
        for(i=0;i< process.length;i++)
        {
            int min=Integer.MAX_VALUE;
            int pId=0;
            for(Process p:process)
            {
               if(p.arrivalTime<min&&!flag[p.id])
               {
                   min = p.arrivalTime;
                   pId=p.id;
                   burstLength= (int) p.burstTime;
               }
            }
            flag[pId]=true;
            ganttChart.add(new GanttChart(min,pId,burstLength+currentTime));
//            for(j=k;j<burstLength;j++)
//                ganttChart[i]=pId;
            averageTurnaroundTime+=burstLength+currentTime-min;
            averageWaitingTime=currentTime-min;
            currentTime+=burstLength;
        }
        averageTurnaroundTime/= process.length;
        averageWaitingTime/= process.length;
    }
    public static void SJF()
    {
        int currentTime=0,pId=0,burstLength=0,minBurstTime=0,min=0;
        float averageWaitingTime=0,averageTurnaroundTime=0;
        int prevTime=0;
        boolean flag[]=new boolean[process.length];
        Queue<GanttChart> ganttChart=new LinkedList<>();
        for(int i=0;i< process.length;i++)
        {
            for(Process p:process)
            {
                min=Integer.MAX_VALUE;
                if(p.arrivalTime<=currentTime&&!flag[p.id])
                {
                    if(p.burstTime<minBurstTime)
                    {
                        min = p.arrivalTime;
                        minBurstTime= (int) p.burstTime;
                        pId=p.id;
                        burstLength= (int) p.burstTime;
                    }
                }
            }
            if(prevTime==currentTime)
            {
                currentTime++;
                continue;
            }
            prevTime=currentTime;
            flag[pId]=true;
            ganttChart.add(new GanttChart(min,pId,burstLength+currentTime));
            averageTurnaroundTime+=burstLength+currentTime-min;
            averageWaitingTime+=currentTime-min;
            currentTime+=burstLength;
        }
        averageTurnaroundTime/= process.length;
        averageWaitingTime/= process.length;
    }
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