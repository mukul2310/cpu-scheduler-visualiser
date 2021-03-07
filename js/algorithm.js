class process
{
    // var id;
    // float burstTime;
    // int priority;
    // int burstTimePriority;
    // int arrivalTime;
    // float f;
    // int fRank;
    constructor( id, burstTime, priority, arrivalTime)
    {
        this.burstTime=burstTime;
        this.id=id;
        this.priority=priority;
        this.arrivalTime=arrivalTime;
    }
}

var processes1=[];
var duplicate=[];
var completionTime=[];
var readyQueue=[];
var arrangedReadyQueue=[];
//formula1
function timeQuanta()
{
    var sum=0,quanta,temp;
    if(!readyQueue.isEmpty())
    {
        var max=readyQueue.peek().burstTime;
        for (i= 0; i < readyQueue.length; i++)
        {
            temp=readyQueue[i].burstTime;
            sum+=temp;
            if(temp>max)
                max=temp;
        }
        quanta= Math.sqrt(1.0*sum/readyQueue.size()*max);
        return quanta;
    }
    return 0;
}

//formula2
function calculateF()
{
    for (i = 0; i < readyQueue.length; i++)
    {
        var p= readyQueue[i];
        p.f=(float) (1.0*(3*p.priority+p.burstTimePriority)/4);
    }
//        for(int i=0;i< readyQueue.size();i++)
//        {
//            process[i].f= (float) (1.0*(3*process[i].priority+process[i].burstTimePriority)/4);
//        }
}
function calculateBurstTimePriority()
    {
        var i=0,n= readyQueue.size(), j,k,count=0;
        var duplicate=[];
        var flag=[];
//        int b[]=new int[n];
        for (i = 0; i < readyQueue.length; i++)
        {
            duplicate[count] = readyQueue[i].burstTime;
//            index[count]=count+1;
            count++;
        }
//        for(i=0;i<n;i++)
//        {
//            System.out.println(duplicate[i]+" "+index[i]);
//        }
//        for(i=0;i<n-1;i++)
//        {
//            min=duplicate[i];
//            k=i;
//            for(j=i+1;j<n;j++)
//            {
//                if(duplicate[j]<min)
//                {
//                    min = duplicate[j];
//                    k = j;
//                }
//            }
//            float temp=duplicate[k];
//            duplicate[k]=duplicate[i];
//            duplicate[i]=temp;
//            int temp1=index[i];
//            index[i]=index[k];
//            index[k]=temp1;
//        }
        duplicate.sort();
        for (i = 0; i < readyQueue.length; i++)
        {
            var p1= readyQueue[i];
            for(j=0;j<n;j++)
            {
                if(p1.burstTime==duplicate[j]&&!flag[j])
                {
                    p1.burstTimePriority = j+1;
                    flag[j]=true;
                    break;
                }
            }
        }
    }
    function calculateFRank()
    {
        var i=0,n= readyQueue.size(), j,k,count=0;
        var p;
        var min;
        var flag=[];
//        int b[]=new int[n];
        for (i = 0; i < readyQueue.length; i++)
        {
            duplicate[count] = readyQueue[i].f;
//            index[count]=count+1;
            count++;
        }
        duplicate.sort();
        for (i = 0; i < readyQueue.length; i++)
        {
            p1= readyQueue[i];
            for(j=0;j<n;j++)
            {
                if(p1.f==duplicate[j]&&!flag[j])
                {
                    p1.fRank = j+1;
                    flag[j]=true;
                    break;
                }
            }
        }
    }
//     function input( n )
//     {
//         System.out.println("Enter the processes");
//         for(i=0;i<n;i++)
//         {
// //            System.out.println("Enter process id"+);
// //            int id=sc.nextInt();
//             System.out.println("Enter burst time for process "+ (i+1));
// //            float burstTime=sc.nextFloat();
//             System.out.println("Enter priority");
// //            int priority=sc.nextInt();
// //            process[i] = new Process(i,burstTime,priority);
//             System.out.println("Enter arrival time");

//         }
// //        burstTime=new int[n];
// //        burstTimePriority=new int[n];
// //        priority=new int[n];
// //        index=new int[n];
//         int temp[]= new int[]{80, 60, 65, 120, 30, 90, 25, 40, 90, 75};
//         int arrivalTime[]= new int[]{80, 60, 65, 120, 30, 90, 25, 40, 90, 75};
//         for(int i=0;i<n;i++)
//         {
//             process[i] = new Process(i, temp[i], i+1, arrivalTime[i]);
//             readyQueue.add(process[i]);
//         }
//     }
//     public static void display()
//     {
//         System.out.println();
//         System.out.println();
//         System.out.println("Process\t Burst Time\t Priority\t Burst Rank\t\t\t f\t\t\t\t fRank\t");
//         for (Process p : readyQueue)
//         {
//             //            System.out.println(process[i].id +"\t\t " + process[i].burstTime +"\t\t\t" +process[i].priority+"\t\t\t\t"+ process[i].burstTimePriority +"\t\t\t\t"+ f[i]);
//             System.out.println(p.id + "\t\t " + p.burstTime + "\t\t\t" + p.priority + "\t\t\t\t" + p.burstTimePriority + "\t\t\t\t" + p.f + "\t\t\t\t" + p.fRank);
//         }
// //        for(Process i:readyQueue)

//     }
    function sortByFRank()
    {
        var i,j,minRank,processId=0;
        var process;
//        boolean flag=false;
//        while (!readyQueue.isEmpty())
//        {
//            minRank=Integer.MAX_VALUE;
//            flag=false;
//            for (Process p : readyQueue)
//            {
//                if (p.arrivalTime<=currentBurstTime && p.fRank<minRank)
//                {
//                    minRank=p.fRank;
//                    process=p;
//                    flag=true;
//                }
//            }
//            if(!flag)
//                currentBurstTime++;
//            arrangedReadyQueue.add(process);
//            readyQueue.remove(process);
//        }
        while (!readyQueue.isEmpty())
        {
            minRank=Integer.MAX_VALUE;
            for (i = 0; i < readyQueue.length; i++)
                if (readyQueue[i].fRank < minRank)
                {
                    minRank = p.fRank;
                    process = p;
                }
            arrangedReadyQueue.add(process);
            readyQueue.remove(process);
        }
    }
   function customizedRoundRobin(timeQuanta)
    {
//        readyQueue.clear();
        var prev=0;
        while (!arrangedReadyQueue.isEmpty())
        {
            var p=arrangedReadyQueue.poll();
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
                completionTime[p.id]=prev;
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