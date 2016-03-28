function transfert() {
     document.getElementById("x").setAttribute("value", window.x);
     document.getElementById("y").setAttribute("value", window.y);
     document.getElementById("z").setAttribute("value", window.z);
     
     if( window.tab == "/"){
     window.tab = "home";
     }
     else{
     window.tab = window.tab.replace("/", "");
     }
     
     document.getElementById("tab").setAttribute("value",window.tab);
}

function transfertOui() {
     document.getElementById("val").setAttribute("value", window.i);
      document.getElementById("z").setAttribute("value", window.z);
      document.getElementById("auteur").setAttribute("value", window.auteur);
}

function transfertNon() {
     document.getElementById("val").setAttribute("value", -1);
}


function transfertText(text){
         document.getElementById("champ").innerHTML = window.text;
         document.getElementById("val").setAttribute("value", window.i);
        
        
}

function transfertOui1(){
       document.getElementById("x").setAttribute("value", window.x);
     document.getElementById("y").setAttribute("value", window.y);
      document.getElementById("z").setAttribute("value", window.z);
     document.getElementById("postit").setAttribute("value",window.postit);
}


function transfertNon1() {
         document.getElementById("postit").setAttribute("value", -1);

     
}



function transfertOuiTab(){
    if( window.tab == "/"){
     window.tab = "home";
     }
     else{
     window.tab = window.tab.replace("/", "");
     }
     
     document.getElementById("tab").setAttribute("value",window.tab);
    document.getElementById("val").setAttribute("value", window.i);
    
    
}




