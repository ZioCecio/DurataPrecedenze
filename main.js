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

            if(x < p.lateFinish) {
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
        //Per ogni processo controlla se tra i suoi successivi è presente il processo da eliminare.
        this.processi.forEach(processo => {
            processo.successivi.forEach((p, index) => {
                if(p.nome.localeCompare(name) === 0)
                    processo.successivi.splice(index, 1);
            });
        });

        //Per ogni processo controlla se tra i suoi precedenti è presente il processo da eliminare.
        this.processi.forEach(processo => {
            processo.precedenti.forEach((p, index) => {
                if(p.nome.localeCompare(name) === 0)
                    processo.precedenti.splice(index, 1);
            });
        });
        
        //Scorre la lista di processi ed elimina quello specificato.
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
const dateToString = date => date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

const calcolatore = new Calcolatore(new Date());    //Calcolatore che rappresenta il cervello dell'applicazione.

const formAggiungiProcesso = document.getElementById("form-add-processo");  //Puntatore al form della pagina html nel quale sono inseriti i dati relativi ai processi da inserire.
const formAggiungiPrecedenza = document.getElementById("form-add-precedenze"); //Puntatore al form della pagina html nel quale sono inseriti i dati relativi alle precedenze da inserire.

let processoSelezionato = null //Tiene traccia dell'ultimo processo che è stato cliccato sulla tabella.

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

        tr.onclick = () => visualizzaPrecedenze(p);

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
    eliminaOptions(processo.nome);

    calcolatore.calcola();
    aggiornaTabella();

    if(processo == processoSelezionato)
        processoSelezionato = null;

    visualizzaPrecedenze(processoSelezionato);
}

/**
 * Aggiunge le opzioni alle select della pagina per creare le precedenze.
 * @param {string} nomeProcesso - Nome del processo da aggiungere nelle opzioni dei select.
 */
const aggiungiOptions = nomeProcesso => {
    let precedente = document.getElementById("precedente");
    let successivo = document.getElementById("successivo");

    let option1 = document.createElement("option");
    let option2 = document.createElement("option");

    option1.classList.add(nomeProcesso);
    option2.classList.add(nomeProcesso);

    option1.innerHTML = nomeProcesso;
    option2.innerHTML = nomeProcesso;

    precedente.appendChild(option1);
    successivo.appendChild(option2);
}

/**
 * Elimina le opzioni alle select della pagina per creare le precedenze.
 * @param {string} nomeProcesso - Nome del processo da eliminare dalle opzioni dei select.
 */
const eliminaOptions = nomeProcesso => {
    let options = document.getElementsByClassName(nomeProcesso);
    for(let i = options.length - 1; i >= 0; i--)
        options[i].parentNode.removeChild(options[i]);
}

/**
 * Elimina una precedenza.
 * @param {Object} precedente - Processo precedente.
 * @param {Object} successivo - Processo successivo.
 */
const eliminaPrecedenza = (precedente, successivo) => {
    let indiceSuccessivo = precedente.successivi.indexOf(successivo);
    let indicePrecedente = successivo.precedenti.indexOf(precedente);

    precedente.successivi.splice(indiceSuccessivo, 1);
    successivo.precedenti.splice(indicePrecedente, 1);

    calcolatore.calcola();
    aggiornaTabella();
    visualizzaPrecedenze(processoSelezionato);
}

/**
 * Visualizza e aggiorna la tabella che mostra tutti i processi successivi di un processo.
 * @param {Object} processo - Processo del quale sono da mostrare i successivi.
 */
const visualizzaPrecedenze = processo => {
    const scrivi = document.getElementById("scrivi-risultati");
    const table = document.createElement("table");

    scrivi.innerHTML = "";

    if(!calcolatore.processi.includes(processo))
        return;

    processoSelezionato = processo;

    table.classList.add("pure-table");
    table.classList.add("scrivi-risultati");

    const titolo = document.createElement("h1");
    titolo.innerHTML = "Successivi di " + processo.nome;

    scrivi.appendChild(titolo);
    scrivi.appendChild(table);

    processo.successivi.forEach(p => {
        let x = document.createElement("tr");
        x.classList.add("processo");

        let y = document.createElement("td");
        let z = document.createElement("td");

        let icon = document.createElement("i");
        icon.classList.add("far");
        icon.classList.add("fa-trash-alt");

        y.innerHTML = p.nome;
        z.appendChild(icon);
        z.classList.add("icona-cestino");
        z.onclick = () => eliminaPrecedenza(processo, p);

        x.appendChild(y);
        x.appendChild(z);

        table.appendChild(x);
    });
}

/**
 * Controlla che le precedenze siano corrette per evitare loop durante il calcolo delle date.
 * @param {Object} precedente - Processo precedente.
 * @param {Object} successivo - Processo successivo.
 * @returns {boolean} - True se la precedenza è valida altrimenti false.
 */
const controllaPrecedenze = (precedente, successivo) => {
    //Se il precedente ha tra i precedenti il suo successivo, la precedenza è sbagliata.
    if(precedente.precedenti.includes(successivo))
        return false;
    
    //Se il successivo ha tra i successivi il suo precedente, la precedenza è sbagliata.
    if(successivo.successivi.includes(precedente))
        return false;

    let ret = true;

    //Esegue lo stesso controllo per ogni processo successivo a quello dato.
    if(successivo.successivi !== []) {
        successivo.successivi.forEach(p => {
            ret = controllaPrecedenze(precedente, p);
        });
    }

    //Esegue lo stesso controllo per ogni processo precedente a quello dato.
    if(precedente.precedenti !== []) {
        precedente.precedenti.forEach(p => {
            ret = controllaPrecedenze(p, successivo);
        });
    }

    return ret;
}

//Viene aggiunta al form la funzione che deve eseguire quando i suoi dati vengono mandati.
formAggiungiProcesso.onsubmit = event => {
    event.preventDefault(); //Impedisce di eseguire POST verso l'esterno.

    let nome = event.target.nomeProcesso.value;
    let durata = parseInt(event.target.durataProcesso.value);

    event.target.nomeProcesso.value = "";
    event.target.durataProcesso.value = "";

    //Se il processo è già presente nel calcolatore non lo si inserisce.
    if(calcolatore.getProcessoByName(nome) != null) {
        alert("Processo con nome " + nome + " già inserito.");
        return;
    }

    //Se non è specificata la durata del processo non lo si inserisce.
    if(isNaN(durata)) {
        alert("Specificare la durata del processo!");
        return;
    }

    //Se non è specificato il nome del processo non lo si inserisce.
    if(nome.localeCompare("") === 0) {
        alert("Specificare il nome del processo!");
        return;
    }

    calcolatore.addProcesso(new Processo(nome, durata));
    aggiungiOptions(nome);

    calcolatore.calcola();  //Ogni volta che un processo viene aggiunto il calcolatore ri-esegue tutti i calcoli.
    aggiornaTabella();  //Ogni volta che un processo viene aggiunto viene ri-disegnata la tabella per mostrare i processi.
}

//Viene aggiunta al form la funzione che deve eseguire quando i suoi dati vengono mandati.
formAggiungiPrecedenza.onsubmit = event => {
    event.preventDefault(); //Impedisce di eseguire POST verso l'esterno.

    let precedente = event.target.precedente.value; //Salva il nome del processo precedente.
    let successivo = event.target.successivo.value; //Salva il nome del processo successivo.

    //Se precedente e successivo sono uguali non fa aggiungere la precedenza.
    if(precedente.localeCompare(successivo) === 0) {
        alert("Un processo non può precedere se stesso!");
        return;
    }

    precedente = calcolatore.getProcessoByName(precedente);
    successivo = calcolatore.getProcessoByName(successivo);

    //Se la precedenza è già stata aggiunta evita che venga aggiunta per la seconda volta.
    if(precedente.successivi.includes(successivo)) {
        alert("Precedenza già aggiunta!");
        return;
    }

    //Se le precedenze non sono valide non le aggiunge.
    if(!controllaPrecedenze(precedente, successivo)) {
        alert("Precedenza errata!");
        return;
    }

    precedente.setSuccessivo(successivo);   //Aggiunge la precedenza.

    calcolatore.calcola();  //Ricalcola le date.
    aggiornaTabella();  //Aggiorna la tabella da mostrare all'utente.
    visualizzaPrecedenze(processoSelezionato); //Aggiorna la tabella che mostra le precedenze.
}