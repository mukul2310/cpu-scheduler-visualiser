let btnGet = document.querySelector('button');
let myTable = document.querySelector('#table');
var table,processCount;
var processes=
[
    {
        id:1,
        burst_time:80,
        arrival_time:0,
        priority:1
    },
    {
        id:2,
        burst_time:60,
        arrival_time:20,
        priority:2
    },
    {
        id:3,
        burst_time:65,
        arrival_time:40,
        priority:3
    },
    {
        id:4,
        burst_time:120,
        arrival_time:60,
        priority:4
    },
    {
        id:5,
        burst_time:30,
        arrival_time:80,
        priority:5
    },
    {
        id:6,
        burst_time:90,
        arrival_time:90,
        priority:6
    },
    {
        id:7,
        burst_time:25,
        arrival_time:120,
        priority:7
    },
    {
        id:8,
        burst_time:40,
        arrival_time:240,
        priority:8
    },
    {
        id:9,
        burst_time:90,
        arrival_time:260,
        priority:9
    },
    {
        id:10,
        burst_time:75,
        arrival_time:380,
        priority:10
    }
];
 
let headers = ['Process Id', 'Burst Time', 'Arrival Time', 'Priority'];
var count=10;
// btnGet.addEventListener('click', () => {
// btnGet.addEventListener('click', createTable());
    function createTable()
    {
        table = document.createElement('table');
        let headerRow = document.createElement('tr');
    
        headers.forEach(headerText => {
            let header = document.createElement('th');
            let textNode = document.createTextNode(headerText);
            header.appendChild(textNode);
            headerRow.appendChild(header);
        });
    
        table.appendChild(headerRow);
    
        processes.forEach(process => {
            let row = document.createElement('tr');
    
            Object.values(process).forEach(text => {
                let cell = document.createElement('td');
                let textNode = document.createTextNode(text);
                cell.appendChild(textNode);
                row.appendChild(cell);
            })
            table.appendChild(row);
        });
    
        
    }
    function displayTable()
    {
        createTable();
        myTable.removeChild(myTable.lastChild);
        myTable.appendChild(table);
    }
    function orderProcess()
    {
        let i=0;
        processes.forEach(function(p)
        {
            p.id=i+1;
            i++;
        });
    }
    function openAddModal()
    {
        $('#modal_process_id').value=processes.length;
        $("#modal_process_id").attr("placeholder", processes.length+1);
    }
    function addProcess()
    {
        // let table = document.getElementById('table');
        
        let input_burst=Math.max($('#modal_burst_time').val(),0);
        let input_arrival=Math.max($('#modal_arrival_time').val(),0);
        let input_priority=Math.max($('#modal_priority').val(),0);
       
        obj={id:processes.length+1, burst_time:input_burst, arrival_time:input_arrival, priority:input_priority};

        processes.push(obj);
        displayTable();
    }
    
    function openEditModal()
    {
        let $dropdown_edit= $('#modal_edit_select');
        // console.log('before: ', $dropdown_edit)

        $dropdown_edit.empty();
        
        for(i=0;i<processes.length;i++)
        {
            $dropdown_edit.append($("<option />").val(processes[i].id).text("Process "+processes[i].id));
            // $dropdown.append(new Option("Process "+processes[i].id, processes[i].id))
        }
        // console.log('after#2: ', $dropdown_edit.length)
        $("#modal_edit_burst_time").attr("placeholder", processes[0].burst_time);
        $("#modal_edit_arrival_time").attr("placeholder", processes[0].arrival_time);
        $("#modal_edit_priority").attr("placeholder", processes[0].priority);

        $dropdown_edit.on('change',function()
        {
            let process_edit_selected=$("#modal_edit_select").val();
            $("#modal_edit_burst_time").attr("placeholder", processes[process_edit_selected-1].burst_time);
            $("#modal_edit_arrival_time").attr("placeholder", processes[process_edit_selected-1].arrival_time);
            $("#modal_edit_priority").attr("placeholder", processes[process_edit_selected-1].priority);
        });
    }
    function editProcess()
    {
        let process_id=$("#modal_edit_select").val();
        let new_burst_time=$("#modal_edit_burst_time").val();
        let new_arrival_time=$("#modal_edit_arrival_time").val();
        let new_priority=$("#modal_edit_priority").val();
        if(new_burst_time==""){
        new_burst_time=processes[process_id-1].burst_time;}
        if(new_arrival_time==""){
        new_arrival_time=processes[process_id-1].arrival_time;}
        if(new_priority==""){
        new_priority=processes[process_id-1].priority;}
        
        processes[process_id-1].burst_time=new_burst_time;
        processes[process_id-1].arrival_time=new_arrival_time;
        processes[process_id-1].priority=new_priority;
        displayTable();
    }
    function openRemoveModal()
    {
        // $('#modal_remove').modal();
        // $('select').formSelect();
    //   $("#modal_remove_select").formSelect();
        // let options= processes.map(process=>`<option value =${process.id}>"Process "${process.id}</option>`).join('\n');
        let $dropdown_remove= $('#modal_remove_select');
        $dropdown_remove.empty();
        for(i=0;i<processes.length;i++)
        {
            $dropdown_remove.append($("<option />").val(processes[i].id).text("Process "+processes[i].id));
        //     // $dropdown.append(new Option("Process "+processes[i].id, processes[i].id))
        }
        // $('#modal_remove_select').html(options);
    }
    function removeProcess()
    {

        let removing_array = $('#modal_remove_select').val();
        let i=0;
        for(i=0;i<removing_array.length;i++)
        {
            let j=0;
            processes.forEach(function(p)
            {
                if(removing_array[i]==p.id)
                {
                    processes.splice(j,1);
                }
                j++;
            });
        }
        orderProcess();
        displayTable();
        // for (var i = 0; i < result.length; i++) {
        //     options += '<option value="' + result[i].ImageFolderID + '">' + result[i].Name + '</option>';
        // }
        // id = $('#select').val();
        // processes.splice(processes.findIndex(item => item.id === id), 1);
        // displayTable();
    }
    function start()
    {
        // alert("Starting the visualization");
        readyQueueInit();
        // calculateTimeQuanta();
        // calculateBurstTimePriority();
        // calculateF();
        // calculateFRank();
        // sortByFRank();
        customizedRoundRobin();
    }