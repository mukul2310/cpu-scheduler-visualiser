let btnGet = document.querySelector('button');
let myTable = document.querySelector('#table');
 
let processes=
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
        let table = document.createElement('table');
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
    
        myTable.appendChild(table);
    }
    function editTable(e)
    {
        console.log('hi');
        if(e.hasAttribute('data-clicked'))
        {
          return;
        }
        var input= document.createElement('input');
        input.setAttribute('type','number');
        input.value=e.innerHTML;
        // input.style.width=this.offsetWidth-(this.clientLeft*3) +"px";
        // input.style.height=this.offsetHeight-(this.clientTop*2) +"px";
        
        input.style.width="75px";
        input.style.height="35px";

        input.style.border="0px"
        input.style.fontFamily="inherit"
        input.style.fontSize="inherit"
        input.style.textAlign="inherit"
        input.style.backgroundColor="#FFFAF0"
        
        input.onblur=function()
        {
          var td= input.parentElement;
          var orig_text= input.parentElement.getAttribute('data-text');
          var current_text=e.value;

          if(orig_text!=current_text)
          {
            td.removeAttribute('data-text');
            td.removeAttribute('data-clicked');
            td.innerHTML=current_text;
          }
          else
          {
            td.removeAttribute('data-text');
            td.removeAttribute('data-clicked');
            td.innerHTML=orig_text;
          }
        }
        input.onkeypress=function()
        {
          if(event.keyCode==13)
          {
            e.blur();
          }
        }
        e.innerHTML='';
        e.append(input);
        e.firstElementChild.select();
    }
    function addProcess()
    {
        let table = document.getElementById('table');
        var i=11;
        obj={id:i, burst_time:90, arrival_time:54, priority:4};
        processes.push(obj);
        let row = document.createElement('tr');
    
            Object.values(obj).forEach(text => 
            {
                let cell = document.createElement('td');
                let textNode = document.createTextNode(text);
                cell.appendChild(textNode);
                row.appendChild(cell);
            });
            table.appendChild(row);
        
        // myTable.appendChild(table);
        // createTable();
    }

    $('table').on("mouseenter",function () {
            console.log('you hoverd on: ', this);
             $('#id').hide();
             $('.class').hide();
        });