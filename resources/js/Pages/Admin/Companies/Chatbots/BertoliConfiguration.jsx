import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';

export default function AdminCompaniesChatbotsBertoliConfiguration({ company }) {
  return (
    <AdminLayout>
      <Head title={`Configurazione Bertoli - ${company.name}`} />
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/companies" className="text-slate-600 hover:text-slate-900">
          ← Aziende
        </Link>
        <Link href={`/admin/companies/${company.id}`} className="text-slate-600 hover:text-slate-900">
          {company.name}
        </Link>
        <Link href={`/admin/companies/${company.id}/chatbots`} className="text-slate-600 hover:text-slate-900">
          Chatbot
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Configurazione Bertoli</h1>
      </div>

      <div className="max-w-4xl space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm leading-6 text-slate-700">
          Questa configurazione aggiunge regole specifiche per Bertoli Arredamenti al comportamento standard del chatbot.
          Non sostituisce l&apos;obiettivo scelto: lo integra.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-slate-900">Knowledge base usata</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Sito Bertoli: tutto il sito `bertoliarredamenti.it`.</li>
            <li>
              Conoscenza su marchi e collezioni in assortimento (Veneta Cucine, Stosa, Meson&apos;s, Lago, Riflessi, Cattelan Italia,
              MSG, Novamobili, Manifattura Falomo, Arcom, Calia, Samoa, Ditre, ecc.): usata solo per formulare risposte corrette,
              senza suggerire all&apos;utente siti, link o acquisti presso terzi.
            </li>
            <li>
              Dalle fonti prodotto sono escluse sezioni su rivenditori/punti vendita/rete vendita o equivalenti.
            </li>
            <li>
              Per Cattelan Italia e esclusa la categoria outlet.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-slate-900">Regole risposta principali</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>
              Non suggerire mai prodotti, siti o URL di terzi: il canale unico verso l&apos;utente e Bertoli (showroom, consulenza,
              occasioni sul sito Bertoli quando serve).
            </li>
            <li>
              Per richieste su prodotti specifici o pronta consegna: verificare prima le occasioni Bertoli; per il resto usare la
              conoscenza interna senza indirizzare verso fonti esterne.
            </li>
            <li>
              Obiettivo commerciale: portare l&apos;utente a fissare un appuntamento nella showroom piu comoda.
            </li>
            <li>
              Richieste post-vendita/manutenzione: raccogliere descrizione problema e contratto/codice contratto, poi indicare
              presa in carico dal reparto post-vendita.
            </li>
            <li>
              Su richiesta showroom o prodotti in sala mostra: rispondere in nome Bertoli e invitare l&apos;utente a lasciare
              recapiti per contatto dal referente locale (Modena/Correggio), senza rimandare a siti di terzi.
            </li>
            <li>Sempre raccogliere nome, cognome, telefono ed email.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-slate-900">Escalation post-vendita</h2>
          <p className="text-sm leading-6 text-slate-700">
            Al termine della raccolta dati per post-vendita, il chatbot comunica che il reparto dedicato fornira pronta
            risposta e indica l&apos;inoltro a: <span className="font-medium">raffaele.mussini@bertoliarredamenti.it</span>.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
}
