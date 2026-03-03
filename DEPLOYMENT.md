# Deploy in produzione

## Coda (queue) – scraper sito in background

L’estrazione del contenuto dal sito aziendale (scraper) viene eseguita in **background** tramite job in coda. In produzione la coda deve essere elaborata altrimenti il job non parte.

### Opzione consigliata: cron

Sul server (es. Hostinger), aggiungi un **cron job** che ogni minuto elabora i job in attesa e termina (nessun processo sempre attivo):

```bash
* * * * * /usr/bin/php /home/u414268243/domains/chatbot.agenziamarketingcarpi.it/artisan queue:work --stop-when-empty
```

- **Sostituisci** `/home/u414268243/domains/chatbot.agenziamarketingcarpi.it` con il **percorso assoluto** della root del progetto (la cartella dove si trova il file `artisan`). Usa percorsi assoluti, senza `cd`.
- Se non trovi il path: da SSH vai nella cartella del progetto con `cd` e lancia `pwd`; oppure nel File Manager di Hostinger apri la cartella che contiene `artisan` e controlla il path.
- Se `php` non è in `/usr/bin/php`, trova il path con `which php` da SSH e usalo al posto di `/usr/bin/php`.
- Nel pannello Hostinger: **Cron Jobs** → aggiungi il comando sopra con frequenza “Every minute”.

Così quando un utente clicca “Aggiorna dal sito”, il job viene accodato e nel giro di al massimo un minuto il cron lo esegue in background.

### Opzione alternativa: worker sempre attivo

Se hai accesso SSH e possibilità di tenere un processo in esecuzione (es. VPS con systemd/supervisor):

```bash
php artisan queue:work
```

In questo caso i job vengono elaborati subito, senza aspettare il cron.
