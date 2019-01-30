/** Classe che rappresenta un processo (o attività) sul quale si basa l'intera applicazione. */
class Processo {
    /**
     * Crea il processo.
     * @param {string} nome - Nome del processo (univoco).
     * @param {number} durata - Durata del processo (da esprimere in giorni).
     */
    constructor(nome, durata) {
        this.nome = nome;
        this.durata = durata;

        this.precedenti = [];
        this.successivi = [];

        this.earlyStart = null;
        this.earlyFinish = null;

        this.lateStart = null;
        this.lateFinish = null;
    }

    /**
     * Aggiunge un processo alla propria lista di successivi e viceversa.
     * @param {Object} successivo - Processo da aggiungere alla lista dei successivi.
     */
    setSuccessivo(successivo) {
        this.successivi.push(successivo);
        successivo.precedenti.push(this);
    }

    /**
     * Calcola l'early finish del processo.
     */
    calcolaEarlyFinish() {
        this.earlyFinish = new Date(this.earlyStart);
        this.earlyFinish.setDate(this.earlyFinish.getDate() + parseInt(this.durata));
    }

    /**
     * Calcola il late start del processo.
     */
    calcolaLateStart() {
        this.lateStart = new Date(this.lateFinish);
        this.lateStart.setDate(this.lateFinish.getDate() - parseInt(this.durata));
    }

    /**
     * Controlla che il processo sia "primo", ovvero che non abbia processi precedenti che andrebbero eseguiti prima di lui.
     * @returns {boolean} - True se il processo è primo altrimenti false.
     */
    isFirst() { return this.precedenti.length === 0 ? true : false }

    /**
     * Controlla che il processo sia "ultimo", ovvero che non abbia processi successivi che andrebbero eseguiti dopo di lui.
     * @returns {boolean} - True se il processo è l'ultim altrimenti false.
     */
    isLast() { return this.successivi.length === 0 ? true : false }

    /**
     * Scrive in maniera ordinata tutte le informazioni relative ad un processo nella fase early.
     * @returns {string} - La stringa contenente le informazioni.
     */
    toStringEarly() {
        return (
            "Il processo " + this.nome +
            " dura " + this.durata + " giorni e inizia il " +
            this.earlyStart.getDate() + "/" + (this.earlyStart.getMonth() + 1) + "/" + this.earlyStart.getFullYear() +
            " e finisce il " + 
            this.earlyFinish.getDate() + "/" + (this.earlyFinish.getMonth() + 1) + "/" + this.earlyFinish.getFullYear()
        )
    }

    /**
     * Scrive in maniera ordinata tutte le informazioni relative ad un processo nella fase late.
     * @returns {string} - La stringa contenente le informazioni.
     */
    toStringLate() {
        return (
            "Il processo " + this.nome +
            " dura " + this.durata + " giorni e inizia il " +
            this.lateStart.getDate() + "/" + (this.lateStart.getMonth() + 1) + "/" + this.lateStart.getFullYear() +
            " e finisce il " + 
            this.lateFinish.getDate() + "/" + (this.lateFinish.getMonth() + 1) + "/" + this.lateFinish.getFullYear()
        )
    }
}

/**
 * Calcola in maniera ricorsiva l'early start e l'early finish di ogni processo.
 * @param {Object} processo - Processo dal quale iniziare a calcolare l'early start e l'early finish.
 */
const calcolaRicorsivoEarly = processo => {
    //Per ogni processo successivo a quello passato come parametro ne calcola l'early start e l'early finish.
    processo.successivi.forEach(p => {
        if(p.earlyStart == null) {
            p.earlyStart = new Date();
            p.earlyStart.setDate(processo.earlyStart.getDate() + parseInt(processo.durata));
            p.calcolaEarlyFinish();
        }
        else {
            let x = new Date();
            x.setDate(processo.earlyStart.getDate() + parseInt(processo.durata));

            if(x > p.earlyStart) {
                p.earlyStart = x;
                p.calcolaEarlyFinish();
            }
        }

        //Se il processo ha dei successivi a sua volta esegue questa funzione.
        if(p.successivi !== [])
            calcolaRicorsivoEarly(p);

    });
}

/**
 * Calcola in maniera ricorsiva il late start e il late finish di ogni processo.
 * @param {Object} processo - Processo dal quale iniziare a calcolare il late start e il late finish.
 */
const calcolaRicorsivoLate = processo => {
    //Per ogni processo successivo a quello passato come parametro ne calcola il late start e il late finish.
    processo.precedenti.forEach(p => {
        if(p.lateFinish == null) {
            p.lateFinish = new Date(processo.lateStart);
            p.calcolaLateStart();
        }
        else {
            let x = new Date(processo.lateStart);

            if(x > p.lateFinish) {
                p.lateFinish = x;
                p.calcolaLateStart();
            }
        }

        //Se il processo ha dei precedenti (non quelli penali obv) a sua volta esegue questa funzione.
        if(p.precedenti !== [])
            calcolaRicorsivoLate(p);
    });
}

/** Classe che permette di eseguire tutti i calcoli e le operazioni sui processi. */
class Calcolatore {
    /**
     * Crea il calcolatore.
     * @param {Object} dataInizio - Data che indica l'inizio del progetto.
     */
    constructor(dataInizio) {
        this.dataInizio = dataInizio;
        this.dataFine = null;
        this.processi = [];
    }

    /**
     * Aggiunge un processo nel calcolatore.
     * @param {Object} processo - Processo da aggiungere.
     */
    addProcesso(processo) {
        this.processi.push(processo);
    }

    /**
     * Cerca il processo in base al suo nome (che è univoco).
     * @param {string} name - Nome del processo da cercare.
     * @returns {Object} - Null se il processo non viene trovato altrimenti il processo con il nome specificato.
     */
    getProcessoByName(name) {
        let processo = null;

        this.processi.forEach(p => {
            if(p.nome.localeCompare(name) === 0) {
                processo = p;
            }
        });

        return processo;
    }

    /**
     * Cerca il processo in base al suo nome e lo rimuove dal calcolatore.
     * @param {string} name - Nome del processo da eliminare.
     */
    eliminaProcessoByName(name) {
        this.processi.forEach((p, index) => {
            if(p.nome.localeCompare(name) === 0)
                this.processi.splice(index, 1); //Eliminazione processo dalla lista.
        });
    }

    /**
     * Calcola le date di inizio e di fine di tutti i processi che "possiede".
     */
    calcola() {
        this.dataFine = null;

        //Per ogni processo elimina le informazioni che vanno calcolare per evitare errori nel calcolo.
        this.processi.forEach(p => {
            p.earlyStart = null;
            p.earlyFinish = null;
            p.lateStart = null;
            p.lateFinish = null;
        });

        //Per ogni processo calcola i suoi early start e early finish.
        this.processi.forEach(p => {
            if(p.isFirst()) {
                p.earlyStart = new Date(this.dataInizio);
                p.calcolaEarlyFinish();
                calcolaRicorsivoEarly(p);
            }
        });

        //Scorre tutti i processi per vedere quale sia la data di fine progetto.
        this.processi.forEach(p => {
            if(p.isLast()) {
                if(this.dataFine == null)
                    this.dataFine = new Date(p.earlyFinish);
                else if(p.earlyFinish > this.dataFine)
                    this.dataFine = new Date(p.earlyFinish);
            }
        });

        //Per ogni processo calcola i suoi late start e late finish.
        this.processi.forEach(p => {
            if(p.isLast()) {
                p.lateFinish = new Date(this.dataFine);
                p.calcolaLateStart();
                calcolaRicorsivoLate(p);
            }
        });
    }
}

/**
 * Trasforma una data in una stringa (mostrando solo anno, mese e giorno nel formato DD/MM/YYYY).
 * @param {Object} date - Data di cui bisogna fare il parsing.
 */
const dateToString = date => date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

const calcolatore = new Calcolatore(new Date());    //Calcolatore che rappresenta il cervello dell'applicazione.

const formAggiungiProcesso = document.getElementById("form-add-processo");  //Puntatore al form della pagina html nel quale sono inseriti i dati relativi ai processi da inserire.

/**
 * Aggiorna la tabella per mostrare a schermo i processi al momento inseriti.
 */
const aggiornaTabella = () => {
    const tbody = document.getElementById("inserisci-processi");    //Corpo della tabella.
    tbody.innerHTML = "";   //Elimina le informazioni già presenti nella tabella.

    //Per ogni processo crea una nuova riga nella tabella per mostrarne tutte le sue informazioni.
    calcolatore.processi.forEach(p => {
        let tr = document.createElement("tr");

        tr.classList.add("processo");

        Object.keys(p).forEach(key => {
            let td = document.createElement("td");

            if(p[key] instanceof Date) {
                td.innerHTML = dateToString(p[key]);
                tr.appendChild(td);
            }
            else if(!Array.isArray(p[key])) {
                td.innerHTML = p[key];
                tr.appendChild(td);
            }
        });

        let icon = document.createElement("i");
        icon.classList.add("far");
        icon.classList.add("fa-trash-alt");

        let td = document.createElement("td");
        td.classList.add("icona-cestino");
        td.appendChild(icon);
        td.onclick = () => eliminaProcesso(p);

        tr.appendChild(td);

        tbody.appendChild(tr);
    });
}

/**
 * Elimina dal calcolatore il processo specificato.
 * @param {string} processo - Nome del processo da eliminare.
 */
const eliminaProcesso = processo => {
    if(calcolatore.getProcessoByName(processo.nome) == null)
        return;
    
    calcolatore.eliminaProcessoByName(processo.nome);
    aggiornaTabella();
}

//Viene aggiunta al form la funzione che deve eseguire quando i suoi dati vengono mandati.
formAggiungiProcesso.onsubmit = event => {
    event.preventDefault(); //Impedisce eseguire POST verso l'esterno.

    let nome = event.target.nomeProcesso.value;
    let durata = parseInt(event.target.durataProcesso.value);

    event.target.nomeProcesso.value = "";
    event.target.durataProcesso.value = "";

    //Se il processo è già presente nel calcolatore non lo si inserisce.
    if(calcolatore.getProcessoByName(nome) != null) {
        alert("Processo con nome " + nome + " già inserito.");
        return;
    }

    calcolatore.addProcesso(new Processo(nome, durata));

    calcolatore.calcola();  //Ogni volta che un processo viene aggiunto il calcolatore ri-esegue tutti i calcoli.

    aggiornaTabella();  //Ogni volta che un processo viene aggiunto viene ri-disegnata la tabella per mostrare i processi.
}

/*

const calc = new Calcolatore(new Date());
const formAggiungiProcesso = document.getElementById("form-add-processo");
const formAggiungiPrecedenza = document.getElementById("form-add-precedenze");
const tbody = document.getElementById("tabella-processi");
const containerTabella = document.getElementById("container-tabella-processi");

const selectPrecedente = document.getElementById("precedente");
const selectSuccessivo = document.getElementById("successivo");

const scriviRisulati = document.getElementById("scrivi-risultati");

let scriviSulDiv = () => {
    calc.calcola();

    scriviRisulati.innerHTML = "";

    let titoloEarly = document.createElement("h1");
    titoloEarly.innerHTML = "EARLY";

    let titoloLate = document.createElement("h1");
    titoloLate.innerHTML = "LATE";

    scriviRisulati.appendChild(titoloEarly);
    calc.processi.forEach(p => {
        let x = document.createElement("p");
        x.innerHTML = p.toStringEarly();
        scriviRisulati.appendChild(x);
    });

    scriviRisulati.appendChild(titoloLate);
    calc.processi.forEach(p => {
        let x = document.createElement("p");
        x.innerHTML = p.toStringLate();
        scriviRisulati.appendChild(x);
    });
}

let addPrecedenze = processo => {
    let tbodyPrecedenze = document.getElementById("tabella-precedenze");
    tbodyPrecedenze.innerHTML = "";

    processo.successivi.forEach(p => {
        let tr = document.createElement("tr");
        tr.classList.add("processo");

        let row1 = document.createElement("td");
        let row2 = document.createElement("td");

        row1.innerHTML = processo.nome;
        row2.innerHTML = p.nome;

        tr.appendChild(row1);
        tr.appendChild(row2);

        tbodyPrecedenze.appendChild(tr);

        scriviSulDiv();
    });
}

let creaTabellaProcessi = processo => {
    let tr = document.createElement("tr");
    tr.classList.add("processo");
    tr.onclick = () => addPrecedenze(processo);

    let row1 = document.createElement("td");
    let row2 = document.createElement("td");

    row1.innerHTML = processo.nome;
    row2.innerHTML = processo.durata;

    tr.appendChild(row1);
    tr.appendChild(row2);

    tbody.appendChild(tr);

    scriviSulDiv();
}

formAggiungiProcesso.onsubmit = event => {
    event.preventDefault();
    let nome = document.getElementById('nome-processo').value;
    let durata = document.getElementById('durata-processo').value;

    let processo = new Processo(nome, durata);
    calc.addProcesso(processo);

    let op1 = document.createElement("option");
    let op2 = document.createElement("option");
        
    op1.innerHTML = processo.nome;
    op2.innerHTML = processo.nome;

    selectPrecedente.appendChild(op1);
    selectSuccessivo.appendChild(op2);

    creaTabellaProcessi(processo);
}

formAggiungiPrecedenza.onsubmit = event => {
    event.preventDefault();

    let precedente = calc.getProcessoByName(document.getElementById("precedente").value);
    let successivo = calc.getProcessoByName(document.getElementById("successivo").value);

    precedente.setSuccessivo(successivo);

    console.log("ADD");

    calc.calcola();

    scriviSulDiv();
}

*/

/*
const calc = new Calcolatore(new Date());
let a = new Processo("A", 2);
let b = new Processo("B", 1);
let c = new Processo("C", 6);
let d = new Processo("D", 3);
let e = new Processo("E", 3);
let f = new Processo("F", 5);
a.setSuccessivo(d);
b.setSuccessivo(d);
b.setSuccessivo(e);
c.setSuccessivo(e);
d.setSuccessivo(f);
e.setSuccessivo(f);
calc.addProcesso(a);
calc.addProcesso(b);
calc.addProcesso(c);
calc.addProcesso(d);
calc.addProcesso(e);
calc.addProcesso(f);
calc.calcola();
calc.processi.forEach(p => {
    console.log(p.toStringEarly());
});
calc.processi.forEach(p => {
    console.log(p.toStringLate());
});
*/

/*
const calco = new Calcolatore(new Date());
let a = new Processo("A", 10);
let b = new Processo("B", 5);
let c = new Processo("C", 3);
b.setSuccessivo(c);
calco.addProcesso(a);
calco.addProcesso(b);
calco.addProcesso(c);
calco.calcola();
calco.processi.forEach(p => {
    console.log(p.toStringEarly());
});
calco.processi.forEach(p => {
    console.log(p.toStringLate());
});
*/