var s = document.getElementsByTagName("html");
var intervalID1;
intervalID1 = setInterval(function() { miseAJour() }, 10000);


/* Ajout d'un évènement double clic */
s[0].addEventListener("dblclick", eventdb);

var page = "";

if(location.pathname.replace("/", "") == "") {
    page = "home";
}
else {
    page = location.pathname.replace("/", "");
}


var width = 600;
var height = 300;


if(window.innerWidth) {
    var left = (window.innerWidth - width) / 2;
    var haut = (window.innerHeight - height) / 2;
}
else {
    left = (document.body.clientWidth - width) / 2;
    haut = (document.body.clientHeight - height) / 2;
}

/* Fonction permettant d'échapper les caractères spéciaux "<" et ">" */
function echapHTML(string) {
    return string.replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;');
}

// Gestion de l'évènement double clic
function eventdb(dbclick) {
    window.x = dbclick.screenX - 150;
    window.y = dbclick.screenY - 200;

    var user = document.getElementsByClassName("user")[0].getAttribute("id");

    if(user == "visiteur") {
        var fenetre = window.open("", "popup", "menubar=no, scrollbars=no, haut="+haut+", left="+left+", width="+width+", height="+height+"");
        fenetre.document.write("<p>Vous n'êtes pas connecté.</p> <p>Vous ne pouvez pas écrire de post-it.</p>");
    }
    
    else {
        var fenetre = window.open("/s/text.html", "popup", "menubar=no, scrollbars=no, haut="+haut+", left="+left+", width="+width+", height="+height+"");
        fenetre.focus();
        fenetre.x = window.x;
        fenetre.y = window.y;
        fenetre.z =  parseInt(maxZ(),10)+1;
        fenetre.tab = location.pathname;
    }
}

// Fonction de mise a jour qui ajoute seulement
function ajouter(obj) {
    var conteneur = document.getElementById("conteneur");

    for(var i = 0; i < obj.length; i++) {
        if(document.getElementById(obj[i].id) == null) {
            conteneur.innerHTML += "<div class=flex-conteneur id=" + obj[i].id + " style='position: absolute; left:" + obj[i].x + "px; top:" + obj[i].y + "px ; z-index:"+obj[i].z+"; 'draggable=true  ondragstart=drag(event)>"
                + "<img src='/resources/bouton_fermer.gif' class='fermer' alt='Bouton supprimer' title='Supprimer ce post-it' onclick='supprimer(this)'/>"
                + "<div class='text_postit' onclick=modify(this)>" + echapHTML(obj[i].champ) + "</div>"
                + "<span class='date'>" + obj[i].date_creation + "</span>"
                + "<span class='auteur'>" + obj[i].auteur.toUpperCase() + "</span>";
        }
    }
}


// Fonction qui supprime tous les post-it
function sup(){
    var conteneur = document.getElementById("conteneur");
   var interne = document.getElementsByClassName("flex-conteneur");
    var taille = interne.length;

  for(var i = 0; i < taille ;  i++) {
                conteneur.removeChild(interne[0]);
            }
  
  
}
    
// EventSource 
var source = new EventSource('/connect?path='+page);

// on écoute le serveur puis on regarde id
// si besoin on actualise(supprimer+ajouter)
// sinon on ajoute
source.addEventListener(page, function(e) {
    var data = JSON.parse(e.data);
    if(e.lastEventId==1){
      sup();
    }
    ajouter(data);
}, false);



/* Affichage de la fenêtre pour supprimer un post-it */
function supprimer(onclick) {
    var randomnumber = Math.floor((Math.random()*100)+1);
    var fenetre = window.open("/s/confirmer.html","_blank", "popup"+randomnumber+", menubar=no, haut="+haut+", left="+left+", width=250, height=150");
    fenetre.i = onclick.parentElement.getAttribute("Id");
    fenetre.focus();
}



/* Affichage de la fenêtre pour modifier un post-it */
function modify(onclick){
    var randomnumber = Math.floor((Math.random()*100)+1); 
    
    var fenetre = window.open("/s/modifie.html","_blank",'PopUp'+randomnumber,"menubar=no, scrollbars=no, haut="+haut+", left="+left+", width=600, height=350");
    fenetre.text = onclick.innerHTML.trim();
    fenetre.i  = onclick.parentElement.getAttribute("Id");
    fenetre.z =  parseInt(maxZ(),10)+1;
    fenetre.auteur = onclick.nextElementSibling.nextElementSibling.innerHTML.trim();

    fenetre.focus();
    
    
}

/* Ouvre le tableau de post-it selectionné */
function Ouverture(onclick) {
    var randomnumber = Math.floor((Math.random()*100)+1); 
    var fenetre = window.open("./"+onclick.innerHTML, "_blank", "PopUp"+randomnumber+", scrollbars=no, menubar=yes, resizable=yes, width=900, height=500");
    fenetre.tab = onclick.innerHTML;
    fenetre.focus();
}


/* Affichage de la fenêtre pour créer un tableau de post-it */
function CreationTab(onclick) {
    var randomnumber = Math.floor((Math.random()*100)+1); 
    var fenetre = window.open("/s/creationTab.html", "_blank", "PopUp"+randomnumber+", menubar=no, width=500, height=300");
    fenetre.focus();
}


/* Affichage de la fenêtre pour supprimer un tableau de post-it */
function SuppressionTab(onclick) {
    var randomnumber = Math.floor((Math.random()*100)+1);
    var fenetre = window.open("./s/supprimertab.html","_blank","PopUp"+randomnumber+",menubar=no, width=500, height=300");
    fenetre.focus();
}


var modifier = ""; 
/* Fonction qui met à jour la liste des tableaux de post-it via Ajax */
function miseAJour() {
     var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://projet-aws-shouta15.c9users.io/list");
    xhr.setRequestHeader("If-None-Match", "Fri, 15 Feb 2013 13:43:19 GMT");
    xhr.responseType = "json";
    xhr.send();

    xhr.onload = function() {
        if(modifier != xhr.getResponseHeader("Etag")) {
            modifier = xhr.getResponseHeader("Etag");
            var interne = document.getElementsByClassName("list_tab");
            var conteneur = document.getElementsByClassName("list_postit");
            var taille = interne.length;
             for(var i = 0; i <taille; i++) {
                conteneur[0].removeChild(interne[0]);
            }
            
            var obj = xhr.response;      
            for(var i = 0; i < obj.length; i++) {
                
                
                conteneur[0].innerHTML += "<option value="+obj[i].nom+" class=\"list_tab\" onclick=\"Ouverture(this)\">"+obj[i].nom+"</option>";

            }
        }
    };
            
            
}


// Fonction appelée lors du démarrage d'un drag
function drag(ev) {
    // on récupere la position du post-it puis on calcule la différence qu'il y a entre l'écran et le navigateur
    var diff_ecran;
    var left = parseInt(ev.target.style.left,10);
    var top = parseInt(ev.target.style.top,10);
    diff_ecran = (left - ev.clientX ) + ',' + (top - ev.clientY) +','+ev.target.id;
    // on transfère les données
    ev.dataTransfer.setData("text/plain",diff_ecran);
}

// Fonction qui permet de drop un element
function drop(ev) {
    
    ev.preventDefault();
    
    var data = ev.dataTransfer.getData("text/plain").split(',');
         
    var postit = document.getElementById(data[2]);
    var x = ev.clientX + parseInt(data[0],10);
    var y = ev.clientY + parseInt(data[1],10);
    var  z = parseInt(maxZ(),10)+1;
   
    postit.style.left = x + 'px';
    postit.style.top = y+ 'px';
    postit.style.zIndex = z;


     console.log(maxZ());
     
    var randomnumber = Math.floor((Math.random()*100)+1); 
    var fenetre = window.open("/s/dragndrop.html","_blank", "popup"+randomnumber+", menubar=no, scrollbars=no, haut="+haut+", left="+left+", width=250, height=150");
    fenetre.x = x;
    fenetre.y = y;
    fenetre.z = z;
    fenetre.postit = data[2]; 
    fenetre.focus();
     

}

// Fonction appelle en cours de déplacement d'un élément 
function allowDrop(ev) {
 ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}


function maxZ()
{
  var elems = document.getElementsByClassName("flex-conteneur");
  var highest = 0;
  
  for (var i = 0; i < elems.length; i++)
  {
    var zindex = parseInt(elems[i].style.zIndex,10);
    
 
    if (zindex > highest)
    {
      highest = zindex;
    }
    
  }

  return highest;
  
}

// Gestion du zoom 
document.getElementById("conteneur").addEventListener("wheel", myFunction);

var compteur =1 ;

function myFunction(ev) {
    
    var cliqueX = ev.clientX;
    var cliqueY = ev.clientY;
    var zoom = ev.deltaY;
    if(Math.sign(zoom) == -1 && compteur <3){
        compteur = compteur+0.1;
    }
    else if(Math.sign(zoom) == 1 && compteur>=0){
        compteur = compteur-0.1;
    }
    
    document.getElementById("conteneur").style.MozTransform = "scale("+compteur+")";
    document.getElementById("conteneur").style.MozTransformOrigin =cliqueX + 'px ' + cliqueY + 'px';
   
}