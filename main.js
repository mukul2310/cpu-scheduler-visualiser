
var allprocess="";
// for(var i in process)
// {
//     document.getElementById("row").innerHTML="hi";
// }
function insertRow()
{
    
}
let btnGet = document.querySelector('button');
let myTable = document.querySelector('#table');
 
let process=
[
    {
        id:1,
        burst_time:80,
        arrival_time:1,
        priority:1
    },
    {
        id:2,
        burst_time:60,
        arrival_time:2,
        priority:2
    },
    {
        id:3,
        burst_time:65,
        arrival_time:3,
        priority:3
    }
]; 
 
let headers = ['Process Id', 'Burst Time', 'Arrival Time', 'Priority'];
 
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
    
        process.forEach(emp => {
            let row = document.createElement('tr');
    
            Object.values(emp).forEach(text => {
                let cell = document.createElement('td');
                let textNode = document.createTextNode(text);
                cell.appendChild(textNode);
                row.appendChild(cell);
            })
            table.appendChild(row);
        });
    
        myTable.appendChild(table);
    }
    function editTable()
    {
        if(this.hasAttribute('data-clicked'))
        {
          return;
        }
        var input= document.createElement('input');
        input.setAttribute('type','number');
        input.value=this.innerHTML;
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
          var current_text=this.value;

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
            this.blur();
          }
        }
        this.innerHTML='';
        this.append(input);
        this.firstElementChild.select();
    }
    function insertRow()
    {
        let table = document.getElementById('table');
        obj={id:4, burst_time:90, arrival_time:54, priority:4};
        process.push(obj);
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