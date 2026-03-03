import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
const labelClass = 'block text-sm font-medium text-slate-700';

export default function AdminCompaniesChatbotsCreate({ company, goalTypes }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    slug: '',
    goal_type: 'assistant',
    custom_goal: '',
    openai_api_key: '',
    widget_primary_color: '#4f46e5',
    widget_position: 'bottom-right',
    widget_welcome_message: '',
    widget_auto_open_after_seconds: 20,
  });

  return (
    <AdminLayout>
      <Head title={`Nuovo chatbot – ${company.name}`} />
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
        <h1 className="text-2xl font-semibold text-slate-900">Nuovo chatbot</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          post(`/admin/companies/${company.id}/chatbots`);
        }}
        className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label htmlFor="name" className={labelClass}>Nome *</label>
          <input
            id="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className={inputClass}
            placeholder="es. Assistente vendite"
          />
          {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>Slug (opzionale)</label>
          <input
            id="slug"
            value={data.slug}
            onChange={(e) => setData('slug', e.target.value)}
            className={inputClass}
            placeholder="es. vendite"
          />
          {errors.slug && <p className="mt-1.5 text-sm text-red-600">{errors.slug}</p>}
        </div>

        <div>
          <label htmlFor="goal_type" className={labelClass}>Obiettivo del chatbot</label>
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
          {errors.goal_type && <p className="mt-1.5 text-sm text-red-600">{errors.goal_type}</p>}
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
              placeholder="Descrivi l'obiettivo che il chatbot deve perseguire..."
            />
            {errors.custom_goal && <p className="mt-1.5 text-sm text-red-600">{errors.custom_goal}</p>}
          </div>
        )}

        <div className="border-t border-slate-200 pt-6">
          <h2 className="mb-4 text-lg font-medium text-slate-900">OpenAI</h2>
          <div className="mb-4">
            <label htmlFor="openai_api_key" className={labelClass}>Chiave API OpenAI (opzionale)</label>
            <input
              id="openai_api_key"
              type="password"
              value={data.openai_api_key}
              onChange={(e) => setData('openai_api_key', e.target.value)}
              placeholder="Lascia vuoto per usare la chiave globale (OPENAI_API_KEY)"
              className={inputClass}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-slate-500">Chiave dedicata solo per questo chatbot. Se vuota viene usata la chiave globale.</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Widget (opzionale)</h2>
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
              <p className="mt-1 text-xs text-slate-500">Messaggio di benvenuto. Vuoto = default.</p>
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
              <p className="mt-1 text-xs text-slate-500">0 = disabilitata. Default 20.</p>
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
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={processing}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Crea chatbot
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
