import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
const labelClass = 'block text-sm font-medium text-slate-700';

export default function AdminCompaniesChatbotsEdit({ company, chatbot, goalTypes, bertoliInfoUrl }) {
  const { data, setData, put, processing, errors } = useForm({
    name: chatbot.name,
    slug: chatbot.slug ?? '',
    goal_type: chatbot.goal_type ?? 'assistant',
    custom_goal: chatbot.custom_goal ?? '',
    bertoli_configuration_enabled: !!chatbot.bertoli_configuration_enabled,
    openai_api_key: '',
    openai_api_key_clear: false,
    widget_primary_color: chatbot.widget_primary_color ?? '#4f46e5',
    widget_position: chatbot.widget_position ?? 'bottom-right',
    widget_welcome_message: chatbot.widget_welcome_message ?? '',
    widget_auto_open_after_seconds: chatbot.widget_auto_open_after_seconds ?? 20,
    recap_email_enabled: !!chatbot.recap_email_enabled,
    recap_email_delay_minutes: chatbot.recap_email_delay_minutes ?? 30,
    widget_icon: null,
    remove_icon: false,
  });

  const submit = (e) => {
    e.preventDefault();
    const hasFile = data.widget_icon instanceof File;
    const removeIcon = !!data.remove_icon;
    const base = `/admin/companies/${company.id}/chatbots/${chatbot.id}`;
    if (hasFile || removeIcon) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', data.name);
      formData.append('slug', data.slug || '');
      formData.append('goal_type', data.goal_type);
      formData.append('custom_goal', data.goal_type === 'custom' ? (data.custom_goal || '') : '');
      formData.append('bertoli_configuration_enabled', data.bertoli_configuration_enabled ? '1' : '0');
      formData.append('widget_primary_color', data.widget_primary_color || '');
      formData.append('widget_position', data.widget_position || '');
      formData.append('widget_welcome_message', data.widget_welcome_message ?? '');
      formData.append('widget_auto_open_after_seconds', String(data.widget_auto_open_after_seconds ?? 20));
      formData.append('recap_email_enabled', data.recap_email_enabled ? '1' : '0');
      formData.append('recap_email_delay_minutes', String(data.recap_email_delay_minutes ?? 30));
      formData.append('remove_icon', removeIcon ? '1' : '0');
      if (data.openai_api_key) formData.append('openai_api_key', data.openai_api_key);
      if (data.openai_api_key_clear) formData.append('openai_api_key_clear', '1');
      if (hasFile) formData.append('widget_icon', data.widget_icon);
      router.post(base, formData, { forceFormData: true });
    } else {
      put(base);
    }
  };

  return (
    <AdminLayout>
      <Head title={`Modifica ${chatbot.name}`} />
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/companies" className="text-slate-600 hover:text-slate-900">
          ← Aziende
        </Link>
        <Link
          href={`/admin/companies/${company.id}`}
          className="text-slate-600 hover:text-slate-900"
        >
          {company.name}
        </Link>
        <Link
          href={`/admin/companies/${company.id}/chatbots`}
          className="text-slate-600 hover:text-slate-900"
        >
          Chatbot
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Modifica {chatbot.name}</h1>
      </div>

      <form
        onSubmit={submit}
        className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label htmlFor="name" className={labelClass}>Nome *</label>
          <input
            id="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className={inputClass}
          />
          {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="goal_type" className={labelClass}>Obiettivo</label>
          <select
            id="goal_type"
            value={data.goal_type}
            onChange={(e) => setData('goal_type', e.target.value)}
            className={inputClass}
          >
            {Object.entries(goalTypes || {}).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {data.goal_type === 'custom' && (
          <div>
            <label htmlFor="custom_goal" className={labelClass}>Obiettivo personalizzato</label>
            <textarea
              id="custom_goal"
              value={data.custom_goal}
              onChange={(e) => setData('custom_goal', e.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={data.bertoli_configuration_enabled}
              onChange={(e) => setData('bertoli_configuration_enabled', e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-primary-600"
            />
            <span>
              <span className="block font-medium text-slate-900">
                Attiva anche la &quot;Configurazione Bertoli&quot;
              </span>
              <span className="mt-1 block text-xs text-slate-600">
                Se attiva si somma agli obiettivi del chatbot già previsti.{' '}
                <Link href={bertoliInfoUrl} className="text-primary-700 underline hover:text-primary-800">
                  Vedi dettagli configurazione
                </Link>
                .
              </span>
            </span>
          </label>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="mb-4 text-lg font-medium text-slate-900">OpenAI</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="openai_api_key" className={labelClass}>Chiave API OpenAI (opzionale)</label>
              <input
                id="openai_api_key"
                type="password"
                value={data.openai_api_key}
                onChange={(e) => setData('openai_api_key', e.target.value)}
                placeholder={chatbot.openai_api_key_set ? '•••••••• (lascia vuoto per non modificare)' : 'Usa la chiave globale dal .env se vuoto'}
                className={inputClass}
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-slate-500">
                Chiave dedicata solo per questo chatbot. Se vuota viene usata la chiave globale (OPENAI_API_KEY nel .env).
              </p>
              {chatbot.openai_api_key_set && (
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={data.openai_api_key_clear}
                    onChange={(e) => setData('openai_api_key_clear', e.target.checked)}
                    className="rounded border-slate-300 text-primary-600"
                  />
                  Rimuovi chiave dedicata (usa la globale)
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Aspetto widget</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="widget_welcome_message" className={labelClass}>Frase iniziale</label>
              <textarea
                id="widget_welcome_message"
                value={data.widget_welcome_message}
                onChange={(e) => setData('widget_welcome_message', e.target.value)}
                rows={2}
                placeholder="Ciao! Come posso aiutarti?"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">Messaggio di benvenuto mostrato all&apos;apertura della chat. Lasciare vuoto per usare il default.</p>
            </div>
            <div>
              <label htmlFor="widget_auto_open_after_seconds" className={labelClass}>Apertura automatica (secondi)</label>
              <input
                id="widget_auto_open_after_seconds"
                type="number"
                min={0}
                max={300}
                value={data.widget_auto_open_after_seconds}
                onChange={(e) => setData('widget_auto_open_after_seconds', e.target.value ? parseInt(e.target.value, 10) : 0)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">0 = disabilitata. Il pannello si apre da solo dopo questo numero di secondi.</p>
            </div>
            <div>
              <label htmlFor="widget_primary_color" className={labelClass}>Colore</label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="widget_primary_color"
                  type="color"
                  value={data.widget_primary_color}
                  onChange={(e) => setData('widget_primary_color', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  value={data.widget_primary_color}
                  onChange={(e) => setData('widget_primary_color', e.target.value)}
                  className={inputClass + ' max-w-[140px] font-mono'}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Posizione</label>
              <div className="mt-1.5 flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="widget_position"
                    value="bottom-right"
                    checked={data.widget_position === 'bottom-right'}
                    onChange={() => setData('widget_position', 'bottom-right')}
                    className="text-primary-600"
                  />
                  In basso a destra
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="widget_position"
                    value="bottom-left"
                    checked={data.widget_position === 'bottom-left'}
                    onChange={() => setData('widget_position', 'bottom-left')}
                    className="text-primary-600"
                  />
                  In basso a sinistra
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="widget_icon" className={labelClass}>Icona (opzionale)</label>
              <div className="mt-1.5 flex flex-wrap items-center gap-4">
                {(chatbot.widget_icon_url && !data.remove_icon) || (data.widget_icon instanceof File) ? (
                  <span className="flex h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {data.widget_icon instanceof File ? (
                      <img src={URL.createObjectURL(data.widget_icon)} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <img src={chatbot.widget_icon_url} alt="" className="h-full w-full object-contain" />
                    )}
                  </span>
                ) : null}
                <input
                  id="widget_icon"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setData('widget_icon', f || null);
                    if (f) setData('remove_icon', false);
                  }}
                  className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-100 file:px-3 file:py-1.5 file:text-primary-700"
                />
                {chatbot.widget_icon_url && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={data.remove_icon}
                      onChange={(e) => setData('remove_icon', e.target.checked)}
                    />
                    Rimuovi icona
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Email recap conversazione</h2>
          <p className="mb-4 text-sm text-slate-600">
            Dopo un periodo di inattività dalla fine della conversazione, invia al cliente una mail con il riepilogo della chat e i dati inseriti (solo se l&apos;utente ha fornito un&apos;email).
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={data.recap_email_enabled}
              onChange={(e) => setData('recap_email_enabled', e.target.checked)}
              className="rounded border-slate-300 text-primary-600"
            />
            Invia email di recap al cliente
          </label>
          {data.recap_email_enabled && (
            <div className="mt-4">
              <label htmlFor="recap_email_delay_minutes" className={labelClass}>Minuti dopo la fine della conversazione</label>
              <input
                id="recap_email_delay_minutes"
                type="number"
                min={5}
                max={1440}
                value={data.recap_email_delay_minutes}
                onChange={(e) => setData('recap_email_delay_minutes', e.target.value ? parseInt(e.target.value, 10) : 30)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">Dopo quanti minuti dall&apos;ultimo messaggio inviare la mail (5–1440, default 30).</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={processing}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Salva
          </button>
          <Link
            href={`/admin/companies/${company.id}/chatbots`}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annulla
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
