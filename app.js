/* Chargement du framework Express, Twig et MySQL */
var express = require('express');
var twig = require("twig");
var mysql = require('mysql');
var crypto = require('crypto');
var bodyP = require('body-parser');
var cookieP = require('cookie-parser');
var session = require('express-session');

var prefixe = "a56$PziEe";
var suffix =  "cA58po*"

var choix = 0;

/* Création de l'application web */
var app = express();


/* Configuration des middlewares */
app
    .use(bodyP.urlencoded({ extended: false }))
    .use(cookieP())
    .use(express.static('.'));


/* Connexion à la base de données */
var db    = mysql.createConnection({
  host     : process.env.IP,
  user     : 'shouta15',
  password : '',
  database : 'c9'  // mettez ici le nom de la base de données
});


/* Configuration du chemin pour les pages statiques */
app.use('/s', express.static('static'));

/* Configuration du dossier contenant les templates */
app.set('views', 'templates');

/* Session */
app.use(session({ secret : '12345' }));


/* Définition d'une route pour le chemin "/" */
app.get('/', function(req, res) {

    var md5 = crypto.createHash('sha1').update('Apple').digest("hex");

    db.query('SELECT * FROM postit where nom_tab="home"', function(err, rows) {
        if(!err) {
            modDate(rows);
            var postit = rows;

            db.query('SELECT * FROM tableaux', function(err, rows) {
                if(!err){
                    if(req.session.user) {
                        res.render('pageprincipal.twig', { 'nom_user' : req.session.user, 'post' : postit , 'tab' : rows });
                    }
                    else {
                        res.render('pageprincipal.twig', { 'nom_user' : 'visiteur', 'post' : postit, 'tab' : rows });
                    }
                }
            });
        }

        else {
            res.render('message.twig', { 'post' : err });
        }
    });
});


/* Définition d'un chemin pour la requête d'inscription */
app.all('/signup', function(req, res) {
    /* Méthode POST */
    if(req.method == 'POST') {

        if(req.body.pass[0] == req.body.pass[1]) {

             var md5 = crypto.createHash('sha1').update(prefixe+req.body.pass[0]+suffix).digest("hex");

            db.query('INSERT INTO users(`nom`, `pass`) VALUES (?, ?)', [req.body.login,md5], function(err, rows) {
                if(!err) {
                    res.render('signin.twig', { 'message' : 'Inscription réussie' });
                }
                else {
                    res.render('signup.twig', { 'message' : 'Cet utilisateur existe déjà.' });
                }
            });
        }

        else {
            res.render('signup.twig', { 'message' : 'Les mots de passe doivent correspondre.' });
        }
    }

    /* Méthode GET */
    else {
        res.render('signup.twig');
    }
});


/* Définition d'un chemin pour la requête de connexion */
app.all('/signin', function(req, res) {
    /* Méthode POST */
    if(req.method == 'POST') {
        var md5 = crypto.createHash('sha1').update(prefixe+req.body.pass+suffix).digest("hex");

        db.query('SELECT * FROM users WHERE nom = ? AND pass = ?', [req.body.login, md5], function(err, rows) {
            if(!err) {
                // Si la requête sort un tuple et qu'il correspond à ce que l'on a tapé, alors la connexion est réussie
                if(rows.length == 1) {
                    if((req.body.login == rows[0].nom) && (md5 == rows[0].pass)) {
                        req.session.user = req.body.login;
                        res.redirect('/');
                    }
                }
                else {
                    res.render('signin.twig', { 'message' : 'Utilisateur inexistant ou mot de passe incorrect.' });
                }
            }

            else {
                res.render('signin.twig', { 'message' : err });
            }
        });
    }

    /* Méthode GET */
    else {
        res.render('signin.twig');
    }
});


/* Définition d'un chemin pour la page de déconnexion */
app.get('/logout', function(req, res) {
    if(req.session.user) {
        req.session.destroy();
        res.redirect('/');
    }
    else {
        res.redirect('/');
    }
});


/* Définition d'un chemin lors de l'ajout d'un nouveau post-it */
app.all('/ajouter', function(req, res) {
    /* Vérification si l'utilisateur est connecté ou non */
    if(req.session.user) {
        /* Méthode POST */
        if(req.method == 'POST') {
            var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

            db.query("INSERT INTO postit(`champ`, `date_creation`, `x`, `y`, z, `auteur`, `nom_tab`) VALUES(?, ?, ?, ?, ?, ?, ?)", [req.body.champ, date, req.body.x, req.body.y, req.body.z,req.session.user, req.body.tab], function(err, rows) {
                if(!err) {
                    res.render('message.twig', { 'message': 'Insertion réussie' });
                }
                else {
                    res.render('message.twig', { 'message': 'Insertion échouée' });
                }
            });
        }

        /* Méthode GET */
        else {
            res.redirect('/');
        }
    }

    else {
        res.render('message.twig', { 'message': "Vous ne pouvez pas ajouter de post-it si vous n'êtes pas connecté." });
    }
});


/* Définition d'un chemin lors de la suppression d'un post-it */
app.post('/effacer', function(req, res) {
    /* Vérification si l'utilisateur est connecté ou non */
    if(req.session.user) {
        if(req.body.val != -1) {
            db.query('DELETE FROM postit WHERE id = ?', [req.body.val], function(err, rows) {
                if(!err) {
                    choix = 1;
                    res.render('message.twig', { 'message' : 'Suppression réussie' });
                }
                else {
                    res.render('message.twig', { 'message' : 'Suppression échouée' });
                }
            });
        }

        else {
            res.render('message.twig', { 'message' : 'Suppression annulée' });
        }
    }

    else {
        res.render('message.twig', { 'message': "Vous ne pouvez pas supprimer ce post-it si vous n'êtes pas connecté." });
    }
});


/* Chemin pour l'ajout d'un nouveau tableau */
app.post('/ajouterTab', function(req, res) {
    db.query("INSERT INTO tableaux VALUES(?)", [req.body.tab], function(err, rows) {
        if(!err) {
            res.render('message.twig', { 'message' : 'CreationTab reussit' });
        }
        else {
            res.render('message.twig', { 'message' : 'CreationTab echouer' });
        }
    });
});


app.post('/effacerTab',function(req, res) {
    /* Vérification si l'utilisateur est connecté ou non */
    if(req.session.user && req.body.val!=-1 ) {
        /* Méthode POST */
        if(req.method == 'POST' && req.body.tab!="home") {
            db.query("DELETE from postit where nom_tab= ?",[req.body.tab], function(err, rows) {
                if(!err) {
                    db.query("DELETE from tableaux where nom = ?",[req.body.tab], function(err, rows){
                        if(!err){
                              res.render('message.twig', { 'message': 'Suppression réussie' });
                        }
                        else{
                             res.render('message.twig', { 'message': 'Suppression échouée' });
                        }
                    });
                }
                else {
                    res.render('message.twig', { 'message': 'Suppression échouée' });
                }
            });
        }

        /* Méthode GET */
        else {
           res.render('message.twig', { 'message': 'Suppression échouée' });
        }
    }

    else {
        res.render('message.twig', { 'message': "Vous ne pouvez pas supprimer de tableau de post-it si vous n'êtes pas connecté." });
    }
})


/* Définition d'un chemin lors de la modification d'un post-it */
app.post('/modifier', function(req, res) {
    if(req.session.user  && req.session.user == req.body.auteur) {
        var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

        db.query('UPDATE postit SET champ = ? , date_creation = ? , z = ? WHERE id = ?', [ req.body.champ, date, req.body.z, req.body.val], function(err, rows) {
            if(!err) {
                choix = 1;
                res.render('message.twig', { 'message' : 'Modification réussie' });

            }
            else {
                res.render('message.twig', { 'message' : 'Modification échouée' });
            }
        });
    }

    else {
        res.render('message.twig', { 'message': "Vous ne pouvez pas modifier ce post-it car vous n'êtes pas connecté ou ce post-it ne vous appartient pas." });
    }
});

/* Tableaux au format JSON disponibles dans la base de données */
app.get('/list', function(req, res) {
    db.query('SELECT * FROM tableaux', function(err, rows) {
        if(!err) {
            res.send(JSON.stringify(rows))
        }
    });
});



/* EventSource qui permet d'envoyer pour chaque tableau les nouvelles modifications */
app.get('/connect', function(req, res){
    res.writeHead(200, {
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    });

setInterval(function (){
       db.query('SELECT * FROM postit where nom_tab= ? ',[req.query.path], function(err, rows) {
        if(!err) {
            modDate(rows);
            var postit= rows;

           res.write('event:'+req.query.path+'\n'+'id:'+choix+'\n'+'data: ' + JSON.stringify(postit) + '\n\n');
        }
       });
},3000);
});


app.all('/dragndrop',function(req, res) {
    if(req.body.postit!=-1){
         if(req.session.user) {
              db.query('UPDATE postit SET x = ?, y = ?, z = ? WHERE postit.id = ? ',[req.body.x, req.body.y ,req.body.z, req.body.postit], function(err, rows) {
                if(!err) {
                    res.render('message.twig', { 'message' : 'Position du post-it modifiée avec succès' });
                }
                else{
                    res.render('message.twig', { 'message' : 'Modification de la position du post-it échouée' });
                }
              });
        }
        else{
             res.render('message.twig', { 'message' : 'Vous devez vous connecter' });
        }
}
else{
   res.render('message.twig', { 'message' : 'Erreur dans la manipulation' });
}
})



/* Définition d'un chemin pour afficher les différentes tableaux de post-it */
app.all('/:n', function(req, res) {
    db.query('SELECT * FROM tableaux where nom = ? ', [req.params.n], function(err, rows) {
        if(!err) {
            if(rows.length >= 1) {
                db.query('SELECT * FROM postit where nom_tab = ? ', [req.params.n], function(err, rows) {
                    if(!err) {
                        var utilisateur = "";

                        if(req.session.user) {
                            utilisateur = req.session.user;
                        }
                        else {
                            utilisateur = "visiteur";
                        }

                        if(rows.length >= 1) {
                            modDate(rows);
                            res.render('pageprincipal.twig', { 'nom_user' : utilisateur, 'post' : rows });
                        }
                        else {
                            res.render('pageprincipal.twig', { 'nom_user': utilisateur ,'post' : rows ,});
                        }
                    }

                    else {
                        res.render('message.twig', { 'message' : "Service inaccessible" });
                    }
                });
            }

            else {
                 res.render('message.twig', { 'message' : "Tableau inexistant" });
            }
        }

        else {
            res.render('message.twig', { 'message' : "Tableau inexistant" });
        }
    });
});



/* Différentes routes pour les fichiers CSS/js/html */
app.get('/s/creationTab.html', function(req, res) {
    res.sendFile(__dirname + '/static/creationTab.html');
});

app.get('/s/suppressionTab.html', function(req, res) {
    res.sendFile(__dirname + '/static/creationTab.html');
});

app.get('/s/even.js', function(req, res) {
    res.sendFile(__dirname + '/static/even.js');
});

app.get('/s/confirmer.html', function(req, res) {
    res.sendFile(__dirname + '/static/confirmer.html');
});

app.get('/s/dragndrop.js', function(req, res) {
    res.sendFile(__dirname + '/static/dragndrop.js');
});

app.get('/s/text.html', function(req, res) {
    res.sendFile(__dirname + '/static/text.html');
});


app.get('/s/fermer.png', function(req, res) {
    res.sendFile(__dirname + '/static/fermer.png');
});

app.get('/text.js', function(req, res) {
    res.sendFile(__dirname + '/text.js');
});




function modDate(rows) {
    for(var i = 0; i < rows.length; i++) {
        var date = new Date(rows[i].date_creation).toISOString().slice(0, 19).replace('T', ' ');
        rows[i].date_creation = date;
    }
}




/* Lancement de l'application (process.env.PORT est un paramètre fourni par Cloud9) */
app.listen(process.env.PORT);